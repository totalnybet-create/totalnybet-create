import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function set(obj, dotted, value) {
  const parts = dotted.split(".");
  let cursor = obj;
  for (const key of parts.slice(0, -1)) {
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[parts.at(-1)] = value;
}

const plPath = path.join(root, "messages", "pl.json");
const pl = JSON.parse(fs.readFileSync(plPath, "utf8"));

const copy = {
  "notFound.title": "Nie znaleziono strony",
  "notFound.description": "Ten adres nie istnieje lub został przeniesiony.",
  "notFound.backHome": "Wróć na start",
  "globalError.title": "Coś poszło nie tak",
  "globalError.description": "Spróbuj ponownie. Jeżeli problem się powtórzy, wróć na stronę główną.",
  "globalError.tryAgain": "Spróbuj ponownie",
  "a11y.openLiveChatWithRef": "Otwórz czat pomocy · ref {code}",
  "authLayout.backToSite": "Wróć do strony",

  "pwa.installing": "Instalowanie…",
  "pwa.browserOfferReady": "Twoja przeglądarka może zainstalować PERSONE ROYALE CASINO.",
  "pwa.installUnavailableHint": "Jeżeli nie widzisz przycisku instalacji, użyj instrukcji dla swojego urządzenia.",
  "pwa.iosIntro": "Safari na iPhonie lub iPadzie",
  "pwa.iosStep1": "Dotknij przycisku Udostępnij.",
  "pwa.iosStep2": "Wybierz „Dodaj do ekranu początkowego”.",
  "pwa.iosStep3": "Potwierdź przyciskiem Dodaj. PERSONE ROYALE CASINO pojawi się na ekranie głównym.",
  "pwa.androidIntro": "Chrome na Androidzie",
  "pwa.androidStep1": "Otwórz menu z trzema kropkami.",
  "pwa.androidStep2": "Wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.",
  "pwa.androidStep3": "Potwierdź instalację.",
  "pwa.desktopIntro": "Chrome lub Edge na komputerze",
  "pwa.desktopStep1": "Kliknij ikonę instalacji po prawej stronie paska adresu.",
  "pwa.desktopStep2": "Możesz też otworzyć menu przeglądarki i wybrać instalację tej strony jako aplikacji.",
  "pwa.whyTitle": "Po co instalować?",
  "pwa.whyBody": "Uruchamiaj PERSONE ROYALE CASINO z ekranu głównego lub paska zadań w trybie aplikacji.",

  "topbar.logoutFailedTitle": "Nie udało się wylogować",
  "topbar.logoutFailedDescription": "Spróbuj ponownie za chwilę.",
  "topbar.ribbonLive": "Gry na żywo",
  "topbar.ribbonFair": "Rozliczanie po stronie serwera",
  "topbar.secureBadge": "Połączenie szyfrowane",

  "auth.recoverySectionTitle": "Pytania bezpieczeństwa",
  "auth.recoverySectionSub": "Posłużą do odzyskania dostępu do konta. Nie wysyłamy linków resetujących e-mailem.",
  "auth.recoveryQuestionNumber": "Pytanie {n}",
  "auth.recoveryPickQuestion": "Wybierz pytanie",
  "auth.recoveryAnswerLabel": "Twoja odpowiedź",
  "auth.recoveryAnswerPlaceholder": "Wpisz odpowiedź",
  "auth.recoveryQuestionsDistinct": "Wybierz trzy różne pytania.",
  "auth.metaLoginTitle": "Logowanie",
  "auth.metaLoginDescription": "Zaloguj się do konta PERSONE ROYALE CASINO i korzystaj z wirtualnych żetonów.",
  "auth.metaSignupTitle": "Rejestracja",
  "auth.metaSignupDescription": "Utwórz konto PERSONE ROYALE CASINO. Tylko wirtualne żetony; 18+.",
  "auth.recoveryQuestions.birth_city": "W jakim mieście się urodziłeś lub urodziłaś?",
  "auth.recoveryQuestions.mother_maiden": "Jak brzmi nazwisko panieńskie Twojej mamy?",
  "auth.recoveryQuestions.first_pet": "Jak miał na imię Twój pierwszy zwierzak?",
  "auth.recoveryQuestions.favorite_teacher": "Jak brzmiało nazwisko Twojego ulubionego nauczyciela?",
  "auth.recoveryQuestions.childhood_nickname": "Jakie było Twoje przezwisko z dzieciństwa?",
  "auth.recoveryQuestions.first_car": "Jakiej marki był Twój pierwszy samochód?",
  "auth.forgotPasswordStepTitle": "Odzyskiwanie przez pytania bezpieczeństwa",
  "auth.forgotPasswordStepBody": "Podaj nazwę użytkownika, odpowiedz na zapisane pytania i ustaw nowe hasło.",
  "auth.forgotPasswordGenericError": "Nie udało się potwierdzić danych odzyskiwania. Sprawdź odpowiedzi i spróbuj ponownie.",
  "auth.forgotPasswordAnswersIncomplete": "Odpowiedz na wszystkie trzy pytania.",
  "auth.forgotPasswordBackToLogin": "Wróć do logowania",

  "hero.welcomeLead": "Witaj w",
  "hero.welcomeAccent": "Persone Royale.",
  "hero.tagline": "Graj dla rozrywki, zdobywaj wirtualne CHIP i rozwijaj swój profil.",
  "hero.liveRoundEyebrow": "Gra trwa",
  "hero.lastWinEyebrow": "Ostatnia wygrana",
  "hero.rankBronze": "Brąz",
  "hero.guestTierTitle": "Brąz",
  "hero.guestVipHint": "Zaloguj się, aby śledzić poziom VIP i nagrody wirtualne.",
  "hero.xpToNext": "{xp} XP do następnego poziomu",
  "hero.nextTierBonusMoney": "+{amount} CHIP za kolejny poziom",
  "hero.vipAtMax": "Najwyższy poziom VIP",
  "hero.vipMaxDetail": "Masz najwyższy poziom. Korzyści VIP pozostają aktywne.",
  "hero.vipTiers.bronze_1": "Brąz · Poziom I",
  "hero.vipTiers.bronze_2": "Brąz · Poziom II",
  "hero.vipTiers.silver_1": "Srebro · Poziom I",
  "hero.vipTiers.gold_1": "Złoto · Poziom I",
  "hero.demoMultiplierHint": "Wartość demonstracyjna — nie jest aktywną rundą",
  "hero.trustChipsAria": "Najważniejsze informacje",
  "hero.acceptsLabel": "Saldo",
  "hero.acceptsAria": "Saldo wirtualnych żetonów",

  "dashboard.thisWeek": "Ten tydzień",
  "dashboard.prizePool": "Pula nagród CHIP",
  "dashboard.trustInstantTitle": "Natychmiastowe nagrody wirtualne",
  "dashboard.trustInstantBody": "Nagrody pozostają w grze",
  "dashboard.trustFairTitle": "Rozliczanie serwerowe",
  "dashboard.trustFairBody": "Wynik gry rozlicza serwer",
  "dashboard.trustSecureTitle": "Bezpieczne konto",
  "dashboard.trustSecureBody": "Sesja i saldo są chronione po stronie serwera",
  "dashboard.trustSupportTitle": "Pomoc",
  "dashboard.trustSupportBody": "Wsparcie w sprawach konta i gier",
  "dashboard.tournamentDailyTitle": "Codzienne wyzwanie",
  "dashboard.tournamentDailyStatus": "Kończy się za 04:12:34",
  "dashboard.tournamentBattleTitle": "Turniej VIP",
  "dashboard.tournamentBattleStatus": "Kończy się za 12:12:34",
  "dashboard.tournamentWeekendTitle": "Weekendowe wyzwanie",
  "dashboard.tournamentWeekendStatus": "Start za 1d 04:12:34",

  "faqSection.claim-bonus-q": "Jak działają bonusy wirtualnych żetonów?",
  "faqSection.claim-bonus-a": "Dostępne bonusy dodają wirtualne CHIP do salda play-money. Nie można ich wymienić ani wypłacić jako pieniędzy.",
  "faqSection.verify-account-q": "Jak zabezpieczyć konto?",
  "faqSection.verify-account-a": "Używaj silnego hasła i nie udostępniaj danych logowania. Sesja i saldo są chronione po stronie serwera.",
  "faqSection.support-q": "Jak skontaktować się z pomocą?",
  "faqSection.support-a": "Użyj czatu pomocy na stronie i opisz problem z kontem, saldem CHIP lub grą.",

  "promotionsGrid.detailsLink": "Szczegóły",
  "promotionsGrid.badgeDaily": "Codziennie",
  "promotionsGrid.badgeWeekly": "Co tydzień",
  "promotionsGrid.badgePartner": "Specjalne",
  "promotionsGrid.vip-cashback-title": "Nagroda VIP",
  "promotionsGrid.vip-cashback-desc": "Aktywność w grach może zwiększać poziom VIP i odblokowywać wirtualne nagrody.",
  "promotionsGrid.race-title": "Ranking tygodnia",
  "promotionsGrid.race-desc": "Zdobywaj punkty aktywności i wspinaj się w rankingu społecznościowym.",
  "promotionsGrid.battle-x-title": "Pojedynki graczy",
  "promotionsGrid.battle-x-desc": "Rywalizuj w wydarzeniach społecznościowych na wirtualne CHIP.",
  "promotionsGrid.raffle-title": "Losowanie CHIP",
  "promotionsGrid.raffle-desc": "Zdobywaj wirtualne losy za aktywność i bierz udział w losowaniach nagród w grze.",
  "promotionsGrid.bonuses-title": "Bonusy CHIP",
  "promotionsGrid.bonuses-desc": "Odbieraj dostępne bonusy i nagrody wirtualne zgodnie z zasadami promocji.",
  "promotionsGrid.pragmatic-title": "Losowe nagrody",
  "promotionsGrid.pragmatic-desc": "Wybrane wydarzenia mogą przyznawać dodatkowe wirtualne CHIP.",
  "promotionsGrid.werder-title": "Wydarzenia specjalne",
  "promotionsGrid.werder-desc": "Okresowe wydarzenia społecznościowe i limitowane nagrody w grze.",
  "promotionsGrid.multiplier-monday-title": "Poniedziałkowe wyzwanie",
  "promotionsGrid.multiplier-monday-desc": "Cotygodniowe wyzwanie z punktami aktywności i wirtualnymi nagrodami.",

  "gameCard.badgeHot": "Popularne",
  "gameCard.badgeNew": "Nowe",
  "gamesCatalog.crash": "Royal Arc",
  "gamesCatalog.crash-classic": "Tryb klasyczny",
  "gamesCatalog.crash-turbo": "Tryb szybki",
  "gamesCatalog.crash-auto": "Gra automatyczna",
  "gamesCatalog.crash-provably": "Rozliczanie serwerowe",
  "gamesCatalog.crash-live": "Gra na żywo",

  "partnersBlock.sectionTitle": "Persone Royale",
  "partnersBlock.werder-bremen-desc": "Sekcja wydarzeń specjalnych PERSONE ROYALE CASINO.",
  "partnersBlock.crypto-com-desc": "Wirtualne CHIP są używane wyłącznie wewnątrz portalu.",
  "partnersBlock.ufc-desc": "Wydarzenia i wyzwania społecznościowe będą dodawane etapami.",

  "reviewsBlock.sectionTitle": "Opinie",
  "reviewsBlock.playerSince": "Gracz od",
  "reviewsBlock.readMore": "Czytaj więcej",
  "reviewsBlock.starsAria": "Ocena {rating} na 5",
  "reviewsBlock.olive-body": "Lubię szybki dostęp do gier i wspólne saldo wirtualnych CHIP.",
  "reviewsBlock.hap10-body": "Interfejs jest czytelny, a historia aktywności pomaga kontrolować saldo w grze.",
  "reviewsBlock.1shaw-body": "Najbardziej podoba mi się Royal Arc i szybkie przechodzenie między grami.",

  "newsBlock.viewAll": "Zobacz wszystkie",
  "liveActivity.liveBetsTitle": "Ostatnia aktywność",
  "liveActivity.liveBetsSub": "Ostatnie wyniki w grach",
  "liveActivity.liveBadge": "Na żywo",
  "liveActivity.stakeLabel": "Stawka CHIP",
  "liveActivity.bustChip": "KONIEC",
  "liveActivity.topMultipliersTitle": "Najlepsze wyniki dziś",
  "liveActivity.topMultipliersSub": "Najwyższe wyniki z ostatnich 24 godzin",
  "liveActivity.demoChip": "Demo",
  "liveActivity.demoNote": "Dane przykładowe — nie są aktywnością prawdziwych graczy.",

  "promoStrip.rewardsTitle": "Zacznij z 2500 wirtualnych CHIP",
  "promoStrip.rewardsBody": "Każde nowe konto otrzymuje startowe saldo do rozgrywki play-money.",
  "promoStrip.ribbon": "Bonus startowy",

  "landing.originalsTitle": "Graj w Royal Arc",
  "landing.originalsBody": "Slot 5×3 połączony ze wspólnym saldem wirtualnych CHIP.",
  "landing.promoCardTitle": "Promocje",
  "landing.promoCardBody": "Bonusy, rankingi i wydarzenia społecznościowe z nagrodami wirtualnymi.",
  "landing.promoCardVipTitle": "Klub VIP",
  "landing.promoCardVipBody": "Poziomy, korzyści i nagrody wirtualne za aktywność.",

  "vipCta.title": "Klub VIP Persone Royale",
  "vipCta.body": "Rozwijaj poziom VIP poprzez aktywność i odblokowuj korzyści w grze.",
  "vipCta.cta": "Klub VIP",

  "about.short": "PERSONE ROYALE CASINO · kasyno społecznościowe",
  "about.long": "PERSONE ROYALE CASINO to portal play-money oparty na wirtualnych żetonach, nagrodach i rozgrywce społecznościowej. Bez wpłat, wypłat i wymiany CHIP na pieniądze.",
  "about.readAll": "Czytaj więcej",
  "about.sectionTitle": "O PERSONE ROYALE CASINO",
  "about.pageTitle": "O nas",
  "about.builtHeading": "Stworzone do rozgrywki społecznościowej",
  "about.builtExtra": "Mobilny portal z wirtualnymi CHIP, wspólnym saldem i grami rozliczanymi po stronie serwera.",

  "support.fastLine": "Zwykle odpowiadamy w ciągu kilku minut.",
  "liveChat.typing": "Pisze…",
  "liveChat.agentReplyDeposit": "Opisz, co wydarzyło się z kontem lub saldem wirtualnych CHIP, a sprawdzimy problem.",
  "liveChat.agentReplyWithdraw": "Napisz, której gry lub pozycji w historii salda dotyczy pytanie.",
  "liveChat.agentReplyBonus": "Podaj nazwę bonusu lub przybliżony czas odbioru nagrody.",
  "liveChat.autoReply": "Dziękujemy za wiadomość. Pomoc odpowie tutaj za chwilę.",
  "liveChat.agentReplies": [
    "Sprawdzamy dane konta.",
    "Napisz, której gry lub pozycji salda CHIP dotyczy problem.",
    "Większość problemów z saldem możemy sprawdzić w historii aktywności.",
    "W sprawie bonusu podaj jego nazwę lub przybliżony czas odbioru."
  ],
  "liveChat.nudgeIdle": "Jesteś nadal z nami? Opisz problem w jednym zdaniu.",
  "liveChat.syncedNotice": "Wiadomość została przekazana do pomocy.",
  "liveChat.relayFailed": "Nie udało się potwierdzić dostarczenia. Spróbuj wysłać wiadomość ponownie.",
  "liveChat.fromSupport": "Pomoc",
  "liveChat.fromNamedAgent": "{name} · Pomoc",
  "liveChat.referenceCode": "Numer czatu · {code}",

  "feedback.title": "Opinie o nas",
  "feedback.body": "Opinie o portalu społecznościowym, grach i pomocy.",
  "licenses.title": "Bezpieczeństwo",
  "licenses.body": "Tryb play-money, szyfrowane sesje konta i rozliczanie salda po stronie serwera.",
  "sponsorships.title": "Wydarzenia specjalne",
  "sponsorships.body": "Miejsce na przyszłe współprace i wydarzenia społecznościowe Persone Royale.",
  "news.title": "Aktualności",
  "news.body": "Nowości produktowe, gry i funkcje wirtualnych żetonów.",
  "newsArticles.editorialAuthor": "Redakcja PERSONE ROYALE",
  "newsArticles.backToNews": "Wszystkie aktualności",
  "newsArticles.readMore": "Czytaj więcej",
  "newsArticles.byAuthor": "Autor: {author}",
  "newsArticles.footerBlurb": "Śledź aktualności, aby poznawać nowe gry i funkcje portalu.",
  "newsArticles.items.trust-wallet-deposit.title": "Pierwsze kroki z wirtualnymi CHIP",
  "newsArticles.items.trust-wallet-deposit.excerpt": "Utwórz konto, odbierz startowe saldo i uruchom grę.",
  "newsArticles.items.trust-wallet-deposit.body": "Każde nowe konto PERSONE ROYALE CASINO otrzymuje wirtualne CHIP do gier play-money. Portal nie obsługuje wpłat ani wypłat prawdziwych pieniędzy.",
  "newsArticles.items.trust-wallet-deposit.category": "Poradnik",
  "newsArticles.items.bank-card-deposit.title": "Jak działa wspólne saldo CHIP",
  "newsArticles.items.bank-card-deposit.excerpt": "Royal Arc i historia konta korzystają z jednego salda wirtualnych żetonów.",
  "newsArticles.items.bank-card-deposit.body": "Wspólny portfel zapisuje wirtualne nagrody, stawki i wygrane. CHIP służą tylko do rozgrywki i nie można ich wymienić na pieniądze.",
  "newsArticles.items.bank-card-deposit.category": "Produkt",

  "responsibleGaming.depositLimitsTitle": "Limity gry",
  "responsibleGaming.depositLimitsBody": "Ustaw własne limity sesji i rób przerwy, kiedy tego potrzebujesz.",
  "responsibleGaming.lossLimitsTitle": "Limity sesji",
  "responsibleGaming.lossLimitsBody": "Używaj osobistych limitów, aby rozgrywka pozostała kontrolowaną rozrywką.",
  "responsibleGaming.timeoutTitle": "Przerwa",
  "responsibleGaming.timeoutBody": "Wstrzymaj konto na wybrany czas i wróć później.",
  "responsibleGaming.selfExclusionTitle": "Wyłączenie konta",
  "responsibleGaming.selfExclusionBody": "Możesz zamknąć konto społecznościowe, jeżeli nie chcesz dalej z niego korzystać.",
  "responsibleGaming.helpHeading": "Potrzebujesz przerwy?",
  "responsibleGaming.helpIntro": "Jeżeli gra przestaje być rozrywką, zrób przerwę i skorzystaj z niezależnego wsparcia w swoim kraju.",

  "nav.sponsorships": "Wydarzenia",
  "nav.wallet": "Saldo",
  "nav.verification": "Bezpieczeństwo konta",
  "nav.mobile": "Aplikacja",

  "footer.main.heading": "Główne",
  "footer.main.crash": "Royal Arc",
  "footer.main.promotions": "Promocje",
  "footer.main.vipClub": "Klub VIP",
  "footer.team.heading": "Persone Royale",
  "footer.team.aboutUs": "O nas",
  "footer.team.sponsorships": "Wydarzenia",
  "footer.team.feedback": "Opinie",
  "footer.team.liveSupport": "Pomoc na żywo",
  "footer.info.heading": "Informacje",
  "footer.info.privacySecurity": "Prywatność i bezpieczeństwo",
  "footer.info.termsFairPlay": "Regulamin i zasady gry",
  "footer.info.licensesSecurity": "Bezpieczeństwo",
  "footer.info.responsibleGaming": "Odpowiedzialna gra",
  "footer.profile.heading": "Profil",
  "footer.profile.deposit": "Saldo CHIP",
  "footer.profile.withdraw": "Historia",
  "footer.profile.bonuses": "Bonusy",
  "footer.profile.settings": "Ustawienia",
  "footer.profile.guestHeading": "Konto",
  "footer.profile.loginGuest": "Zaloguj się",
  "footer.profile.signupGuest": "Zarejestruj się",
  "footer.support.title": "Pomoc",
  "footer.support.body": "Skontaktuj się z nami w sprawie konta, salda lub gier.",
  "footer.support.emailCta": "Napisz e-mail",
  "footer.publisher.prefix": "Portal",
  "footer.publisher.suffix": "",

  "profile.index.metaDescription": "Profil PERSONE ROYALE CASINO — saldo wirtualnych CHIP, poziom VIP i ostatnia aktywność.",
  "profile.index.welcomeBack": "Witaj ponownie",
  "profile.index.memberSince": "Konto od {date}",
  "profile.index.vipStatus": "Status VIP:",
  "profile.index.vipProgress": "Postęp VIP",
  "profile.index.nextBonusShort": "bonus za kolejny poziom",
  "profile.index.verifyNow": "Zabezpiecz konto",
  "profile.index.emailVerification": "Bezpieczeństwo konta",
  "profile.index.notVerified": "Do ustawienia",
  "profile.index.verified": "Gotowe",
  "profile.index.accountLevel": "Poziom konta",
  "profile.index.openCta": "Otwórz",
  "profile.index.bonusesShortcutBody": "Bonusy i nagrody wirtualnych CHIP.",
  "profile.index.transactionsShortcutBody": "Historia żetonów, stawek, wygranych i nagród.",
  "profile.index.vipShortcutBody": "Poziomy VIP i korzyści za aktywność.",

  "profile.bonuses.metaTitle": "Bonusy",
  "profile.bonuses.metaDescription": "Sprawdź aktywne bonusy i nagrody wirtualnych CHIP.",
  "profile.bonuses.title": "Bonusy",
  "profile.bonuses.liveOffers": "Dostępne nagrody",
  "profile.bonuses.activeBonus": "Aktywny bonus",
  "profile.bonuses.noActiveBonus": "Brak aktywnego bonusu",
  "profile.bonuses.vipCashback": "Nagroda VIP",
  "profile.bonuses.promoCode": "Kod promocyjny",
  "profile.bonuses.enterCode": "Wpisz kod",
  "profile.bonuses.promoHint": "Dostępność zależy od aktywnej promocji",

  "profile.deposit.metaTitle": "Saldo CHIP",
  "profile.deposit.metaDescription": "Wpłaty prawdziwych pieniędzy są wyłączone. Portal używa wyłącznie wirtualnych CHIP.",
  "profile.deposit.title": "Saldo CHIP",
  "profile.deposit.historyTitle": "Historia salda",
  "profile.deposit.historyCta": "Wróć do profilu",
  "profile.deposit.historyDescription": "Saldo wirtualnych CHIP służy wyłącznie do rozgrywki.",
  "profile.deposit.stepMethodHeading": "Tryb play-money",
  "profile.deposit.cryptoOnly": "Brak wpłat pieniężnych",
  "profile.deposit.stepCurrencyHeading": "Waluta gry: CHIP",
  "profile.deposit.networkCalloutTitle": "Wirtualne żetony",
  "profile.deposit.networkCalloutBody": "CHIP działają wyłącznie wewnątrz PERSONE ROYALE CASINO i nie mają wartości pieniężnej.",
  "profile.deposit.selectedBadge": "Aktywne",
  "profile.deposit.stepSendHeading": "Brak wpłat",
  "profile.deposit.networkSendWarning": "Nie wysyłaj pieniędzy ani kryptowalut. Ten portal działa wyłącznie w trybie play-money.",
  "profile.deposit.usdtNetworksTitle": "Brak sieci płatniczych",
  "profile.deposit.usdtNetworksFootnote": "PERSONE ROYALE CASINO nie przyjmuje wpłat prawdziwych pieniędzy.",
  "profile.deposit.disclaimerTreasury": "Wirtualne CHIP są księgowane wyłącznie przez system gry.",
  "profile.deposit.minDepositLabel": "Wpłaty",
  "profile.deposit.networkLabel": "Tryb",
  "profile.deposit.noAssetsTitle": "Wpłaty wyłączone",
  "profile.deposit.noAssetsBody": "Używamy wyłącznie wirtualnych CHIP.",
  "profile.deposit.missingAddressBody": "Brak adresów płatniczych — tryb play-money nie obsługuje wpłat.",

  "profile.withdraw.metaTitle": "Historia",
  "profile.withdraw.metaDescription": "Wypłaty prawdziwych pieniędzy są wyłączone. Wirtualne CHIP nie mają wartości pieniężnej.",
  "profile.withdraw.title": "Historia",
  "profile.withdraw.historyTitle": "Historia aktywności",
  "profile.withdraw.historyCta": "Wróć do historii",
  "profile.withdraw.historyDescription": "Wirtualnych CHIP nie można wypłacić ani wymienić na pieniądze.",
  "profile.withdraw.stepMethodHeading": "Tryb play-money",
  "profile.withdraw.cryptoOnly": "Wypłaty wyłączone",
  "profile.withdraw.cryptoOnlySub": "Wirtualne CHIP służą wyłącznie do rozgrywki.",
  "profile.withdraw.stepCurrencyHeading": "Waluta gry: CHIP",
  "profile.withdraw.usdRailNote": "Brak wypłat i zewnętrznych transferów.",
  "profile.withdraw.addressLabel": "Brak adresu wypłaty",
  "profile.withdraw.addressHint": "Wirtualne CHIP pozostają wewnątrz portalu.",
  "profile.withdraw.addressPlaceholder": "Wypłaty są wyłączone",
  "profile.withdraw.amountUsdLabel": "Wirtualne CHIP",
  "profile.withdraw.amountUsdHint": "Brak wartości pieniężnej",
  "profile.withdraw.submit": "Wypłaty wyłączone",
  "profile.withdraw.submitting": "Niedostępne",
  "profile.withdraw.successMessage": "Wypłaty nie są dostępne w trybie play-money.",
  "profile.withdraw.errorGeneric": "Ta funkcja jest wyłączona.",
  "profile.withdraw.networkError": "Ta funkcja jest wyłączona.",
  "profile.withdraw.insufficient": "Wirtualne CHIP nie mogą być wypłacane.",
  "profile.withdraw.noAssetsTitle": "Wypłaty wyłączone",
  "profile.withdraw.noAssetsBody": "Portal nie obsługuje wypłat pieniężnych.",
  "profile.withdraw.asideTitle": "Tylko play-money",
  "profile.withdraw.asideBody": "CHIP nie można wypłacić, sprzedać ani wymienić na pieniądze.",

  "profile.verification.metaTitle": "Bezpieczeństwo konta",
  "profile.verification.metaDescription": "Zadbaj o bezpieczeństwo danych logowania i sesji konta.",
  "profile.verification.title": "Bezpieczeństwo konta",
  "profile.verification.stepsAria": "Kroki bezpieczeństwa",
  "profile.verification.stepEmail": "Dane konta",
  "profile.verification.stepBasic": "Silne hasło",
  "profile.verification.stepChecking": "Ochrona sesji",
  "profile.verification.stepComplete": "Gotowe",
  "profile.verification.activationHeading": "Ochrona konta",
  "profile.verification.emailPendingHeading": "Sprawdź ustawienia bezpieczeństwa",
  "profile.verification.activationBody": "Używaj unikalnego hasła i nie udostępniaj danych logowania.",
  "profile.verification.activationBodyVerified": "Sesja konta jest aktywna. Możesz zarządzać hasłem w ustawieniach.",
  "profile.verification.proceed": "Ustawienia",

  "profile.settings.metaTitle": "Ustawienia",
  "profile.settings.metaDescription": "Zarządzaj kontem i hasłem PERSONE ROYALE CASINO.",
  "profile.settings.title": "Ustawienia",
  "profile.settings.personalData": "Dane konta",
  "profile.settings.protected": "Chronione",
  "profile.settings.changePassword": "Zmień hasło",
  "profile.settings.update": "Aktualizuj",
  "profile.settings.twoFa": "Dodatkowe zabezpieczenie",
  "profile.settings.notConnected": "Nieaktywne",
  "profile.settings.connectWallet": "Opcja niedostępna",
  "profile.settings.cardOptions": "Ustawienia konta",
  "profile.settings.passwordForm.heading": "Zmiana hasła",
  "profile.settings.passwordForm.sub": "Ustaw silne, unikalne hasło. Pozostaniesz zalogowany na tym urządzeniu.",
  "profile.settings.passwordForm.current": "Obecne hasło",
  "profile.settings.passwordForm.next": "Nowe hasło",
  "profile.settings.passwordForm.confirm": "Powtórz nowe hasło",
  "profile.settings.passwordForm.submit": "Zmień hasło",
  "profile.settings.passwordForm.saving": "Zapisywanie…",
  "profile.settings.passwordForm.success": "Hasło zostało zmienione.",
  "profile.settings.passwordForm.genericError": "Nie udało się zmienić hasła.",
  "profile.settings.passwordForm.networkError": "Błąd połączenia.",

  "profile.transactions.metaDescription": "Historia wirtualnych CHIP, stawek, wygranych i nagród.",
  "profile.transactions.tableType": "Rodzaj",
  "profile.transactions.tableAmount": "Liczba CHIP",
  "profile.transactions.tableWhen": "Data"
};

for (const [key, value] of Object.entries(copy)) set(pl, key, value);

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) value[key] = sanitize(child);
    return value;
  }
  if (typeof value !== "string") return value;

  let next = value
    .replaceAll("SIEDLAR CASINO", "PERSONE ROYALE CASINO")
    .replaceAll("SEDLAR CASINO", "PERSONE ROYALE CASINO")
    .replaceAll("Script.Casino", "PERSONE ROYALE CASINO")
    .replaceAll("script.casino", "personeroyale.pl")
    .replaceAll("CrashX", "PERSONE ROYALE CASINO")
    .replaceAll("CRASHX", "PERSONE ROYALE CASINO")
    .replace(/\bCrash\b/g, "Royal Arc")
    .replace(/\bcrypto(?:currency|currencies)?\b/gi, "wirtualne CHIP")
    .replace(/\bon-chain\b/gi, "w systemie gry")
    .replace(/\bKYC\b/g, "ochrona konta");

  if (/BTC|ETH|USDT|USDC|BNB|TRX|SOL|TON|XRP|Cura[cç]ao|Mastercard|VISA|Apple Pay|Google Pay|wallet address|blockchain|treasury/i.test(next)) {
    return "Ta funkcja nie jest używana w trybie play-money. PERSONE ROYALE CASINO korzysta wyłącznie z wirtualnych CHIP.";
  }
  return next;
}

sanitize(pl);
fs.writeFileSync(plPath, `${JSON.stringify(pl, null, 2)}\n`);

const footerPath = path.join(root, "components", "layout", "Footer.tsx");
fs.writeFileSync(footerPath, `import { getLocale } from "next-intl/server";
import { BrandLockup } from "./BrandLockup";
import { FooterInstallApp } from "@/components/pwa/FooterInstallApp";
import { OpenLiveChatButton } from "@/components/support/OpenLiveChatButton";

export async function Footer() {
  const year = new Date().getFullYear();
  const locale = await getLocale();
  const isPl = locale === "pl";
  return (
    <footer className="dashboard-shell mt-8 overflow-hidden p-4 sm:p-6 lg:p-7">
      <div className="grid gap-6 border-b border-[var(--chrome-border)] pb-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <BrandLockup size="lg" />
          <p className="mt-4 max-w-[46ch] text-sm font-semibold leading-relaxed text-[var(--color-text-muted)]">
            {isPl ? "Premium kasyno społecznościowe z wirtualnymi CHIP. Bez wpłat, wypłat i wartości pieniężnej." : "Premium social casino with virtual chips only. No deposits, withdrawals or cash value."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(isPl ? ["18+", "Wirtualne CHIP", "Bez wypłat", "Tylko play-money"] : ["18+", "Virtual CHIP", "No cash-out", "Play money only"]).map((item) => (
              <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/62">{item}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <OpenLiveChatButton variant="primary" className="h-11" />
          <FooterInstallApp className="h-11" />
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-5 text-xs font-medium leading-relaxed text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} PERSONE ROYALE CASINO · {isPl ? "wersja play-money" : "play-money social casino"}.</p>
        <p>{isPl ? "Wirtualnych CHIP nie można wypłacić, sprzedać ani wymienić na pieniądze." : "Virtual CHIP cannot be redeemed, withdrawn or exchanged for money."}</p>
      </div>
    </footer>
  );
}
`);

const redirectPage = (target) => `import { redirect } from "next/navigation";\n\nexport default async function RedirectPage({ params }: { params: Promise<{ locale: string }> }) {\n  const { locale } = await params;\n  redirect(\`/\${locale}${target}\`);\n}\n`;

const replacements = [
  ["app/[locale]/games/crash/page.tsx", "/games/royal-arc"],
  ["app/[locale]/profile/deposit/page.tsx", "/profile"],
  ["app/[locale]/profile/withdraw/page.tsx", "/profile/transactions"],
  ["app/[locale]/profile/verification/page.tsx", "/profile/settings"]
];
for (const [relative, target] of replacements) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, redirectPage(target));
}

console.log("Applied final Persone Royale Polish cleanup, safe play-money routes and localized footer.");
