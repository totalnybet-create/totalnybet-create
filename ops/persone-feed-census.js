import { Readable } from 'node:stream';
import { parse } from 'csv-parse';
import { writeFile } from 'node:fs/promises';

const feedUrl = process.env.ADMITAD_FEED_URL;
if (!feedUrl) throw new Error('Missing feed URL');
const response = await fetch(feedUrl);
if (!response.ok || !response.body) throw new Error(`Feed HTTP ${response.status}`);

let parsed = 0;
const categories = new Map();
const reader = response.body.getReader();
async function* chunks() {
  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    yield Buffer.from(value);
  }
}
const parser = Readable.from(chunks()).pipe(parse({columns:true,bom:true,delimiter:';',skip_empty_lines:true,relax_quotes:true,relax_column_count:true}));
for await (const row of parser) {
  parsed++;
  const category = String(row.category || 'Inne').trim() || 'Inne';
  categories.set(category, (categories.get(category) || 0) + 1);
  if (parsed % 100000 === 0) console.log(`COUNT ${parsed}`);
}
const result = {parsed_count: parsed, categories: [...categories.entries()].sort((a,b)=>b[1]-a[1])};
await writeFile('persone-feed-census.json', JSON.stringify(result, null, 2));
console.log(`DONE ${parsed}`);
