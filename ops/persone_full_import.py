import json, re, sys, time, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

HANDOFF='https://persone-store-foundation-af5rc9.v2.appdeploy.ai/api/_ops-feed-handoff?token=ed_3JZ7b7_geldQUXffNvIVl5Eaqh_EKHoEUO6wIzts'
AUTH='https://ep-autumn-math-auw5twqr.neonauth.c-10.us-east-1.aws.neon.tech/neondb/auth'
DATA='https://ep-autumn-math-auw5twqr.apirest.c-10.us-east-1.aws.neon.tech/neondb/rest/v1'
BATCH=500
PROGRESS=5000
FEED_ID=14107

def get_json(url, headers=None, timeout=60):
    req=urllib.request.Request(url, headers=headers or {'Accept':'application/json'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)

def get_feed_url():
    data=get_json(HANDOFF, {'Accept':'application/json','User-Agent':'Persone-Import-GHA/1.0'})
    url=str(data.get('url') or '').strip()
    if not url.startswith('https://'):
        raise RuntimeError('feed_url_missing')
    return url

def auth_token():
    data=get_json(AUTH+'/token/anonymous', {'Accept':'application/json','User-Agent':'Persone-Import-GHA/1.0'})
    token=str(data.get('token') or '')
    if not token:
        raise RuntimeError('neon_token_missing')
    return token

def post_batch(rows, token):
    body=json.dumps(rows, ensure_ascii=False, separators=(',',':')).encode('utf-8')
    url=DATA+'/catalog_products?on_conflict=source%2Cexternal_id'
    for attempt in range(5):
        req=urllib.request.Request(url, data=body, method='POST', headers={
            'Authorization':'Bearer '+token,
            'Content-Type':'application/json',
            'Prefer':'resolution=merge-duplicates,return=minimal',
            'User-Agent':'Persone-Import-GHA/1.0',
        })
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                if 200 <= r.status < 300:
                    return token
        except urllib.error.HTTPError as e:
            if e.code in (401,403) and attempt < 4:
                token=auth_token(); continue
            msg=e.read(500).decode('utf-8','replace')
            if attempt == 4:
                raise RuntimeError(f'neon_http_{e.code}:{msg}')
        except Exception:
            if attempt == 4: raise
        time.sleep(min(8, 0.5*(2**attempt)))
    return token

def txt(elem, name):
    child=elem.find(name)
    if child is None or child.text is None: return ''
    return child.text.strip()

def first_picture(elem):
    for p in elem.findall('picture'):
        if p.text and p.text.strip(): return p.text.strip()
    return ''

def param(elem, wanted):
    wanted=re.sub(r'[^a-z0-9]','',wanted.lower())
    for p in elem.findall('param'):
        name=re.sub(r'[^a-z0-9]','',str(p.attrib.get('name','')).lower())
        if name==wanted and p.text: return p.text.strip()
    return ''

def number(v):
    try:
        n=float(str(v or '').replace(',','.').strip())
        return n if n>=0 else None
    except Exception: return None

def merchant_url(link):
    try:
        u=urllib.parse.urlparse(link)
        q=urllib.parse.parse_qs(u.query)
        ulp=(q.get('ulp') or [''])[0]
        if not ulp: return None
        deep=urllib.parse.urlparse(ulp)
        dq=urllib.parse.parse_qs(deep.query)
        return (dq.get('dl_target_url') or [ulp])[0]
    except Exception: return None

def product(elem, categories):
    external=str(elem.attrib.get('id','')).strip()
    title=(txt(elem,'name') or txt(elem,'model')).strip()[:1200]
    price=number(txt(elem,'price'))
    link=txt(elem,'url').strip()
    if not external or not title or price is None or not link.startswith(('http://','https://')):
        return None
    old=number(txt(elem,'oldprice'))
    category_id=txt(elem,'categoryId')
    category=categories.get(category_id) or category_id or 'Inne'
    disc_raw=param(elem,'discount')
    try: discount=max(0,min(100,int(re.sub(r'\D','',disc_raw)))) if re.sub(r'\D','',disc_raw) else None
    except Exception: discount=None
    if discount is None and old and old>price: discount=round((1-price/old)*100)
    desc=txt(elem,'description')[:6000]
    image=first_picture(elem)
    return {
        'source':'aliexpress','external_id':external,'slug':'ae-'+external,'sku':external,
        'brand':(txt(elem,'vendor') or txt(elem,'manufacturer'))[:300],
        'title':title,'description':desc,'category':category,'category_path':[category],
        'price':price,'original_price':old,'currency':(txt(elem,'currencyId') or 'USD')[:3].upper(),
        'discount':discount,'sizes':[],'tone':'','image_url':image or None,
        'affiliate_url':link,'merchant_url':merchant_url(link),'availability':'in_stock','published':True,
        'source_updated_at':None,
        'raw':{'feed_id':FEED_ID,'feed_category_id':category_id,'commission_rate':param(elem,'commissionrate')}
    }

def main():
    feed=get_feed_url()
    print('START Persone full AliExpress import', flush=True)
    req=urllib.request.Request(feed, headers={'User-Agent':'Persone-Import-GHA/1.0','Accept':'application/xml,text/xml,*/*'})
    parser=ET.XMLPullParser(events=('start','end'))
    categories={}; batch=[]; parsed=valid=sent=invalid=0; token=auth_token(); next_progress=PROGRESS
    with urllib.request.urlopen(req, timeout=180) as response:
        while True:
            chunk=response.read(1024*1024)
            if not chunk: break
            parser.feed(chunk)
            for event, elem in parser.read_events():
                if event!='end': continue
                name=elem.tag.split('}')[-1]
                if name=='category' and 'id' in elem.attrib:
                    if elem.text and elem.text.strip(): categories[str(elem.attrib.get('id',''))]=elem.text.strip()
                    elem.clear(); continue
                if name!='offer': continue
                parsed+=1
                row=product(elem,categories)
                if row is None: invalid+=1
                else:
                    valid+=1; batch.append(row)
                    if len(batch)>=BATCH:
                        token=post_batch(batch,token); sent+=len(batch); batch.clear()
                elem.clear()
                if parsed>=next_progress:
                    print(f'Importowano {sent:,} zapisanych / {parsed:,} odczytanych; poprawnych {valid:,}; odrzuconych {invalid:,}', flush=True)
                    next_progress+=PROGRESS
    if batch:
        token=post_batch(batch,token); sent+=len(batch); batch.clear()
    print(f'GOTOWE parsed={parsed} valid={valid} sent={sent} invalid={invalid}', flush=True)
    if sent==0: raise RuntimeError('zero_products_written')

if __name__=='__main__':
    try: main()
    except Exception as e:
        print('IMPORT FAILED:',repr(e),file=sys.stderr,flush=True); raise
