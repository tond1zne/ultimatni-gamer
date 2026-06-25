# Ultimate Streamer Challenge

Webová appka pro výzvy (hry + IRL), body, týdenní žebříčky a admin schvalování důkazů.

**Stack:** Next.js 14 (frontend + backend v jednom) · Prisma + PostgreSQL · NextAuth (přihlášení) · Tailwind (černobílý comic styl)

Appka je připravená na nasazení na **Vercel** s hostovaným Postgresem (Neon / Supabase).
Lokálně ji ale spustíš stejně dobře proti vlastnímu Postgresu (i přes Docker).

---

## 1. Co appka umí

- Registrace s **potvrzením emailu** (bez kliknutí na potvrzovací odkaz se nelze přihlásit)
- Seznam výzev (hry / IRL), každá má obtížnost a počet bodů
- Uživatel u výzvy vloží **odkaz** na video/screenshot (YouTube, Twitch klip, Google Drive, atd.)
- Admin vidí všechny odeslané důkazy, schválí (a může upravit počet bodů) nebo zamítne
- **Email adminovi** při každém novém odeslaném důkazu — jde si zapnout/vypnout v `/admin/settings`
- Žebříček celkový i pro každou jednotlivou výzvu
- **Týden se nespustí sám** — admin v `/admin/week` ručně klikne na "Spustit týden" a teprve pak
  začne běžet časovač a hráči mohou odesílat důkazy. Po vypršení (nebo ručním uzavření) čeká
  další týden znovu na ruční spuštění.
- Historie uzavřených týdnů a jejich žebříčků

## 2. Co budeš potřebovat

- Node.js verze 18 nebo novější (https://nodejs.org)
- Postgres databázi. Pro Vercel doporučeno **Neon** (https://neon.tech) nebo **Supabase**
  (https://supabase.com) — obě mají zdarma tier a obě dávají dva connection stringy
  (pooled + direct), což appka přímo využívá.
- Účet na Vercelu (https://vercel.com) — zdarma tier stačí
- SMTP účet na odesílání emailů — doporučeno **Resend** (https://resend.com) nebo
  **Brevo** (https://www.brevo.com), oba mají zdarma SMTP relay

## 3. Založení databáze (Neon - doporučeno)

1. Vytvoř si zdarma účet na https://neon.tech a nový projekt.
2. V dashboardu projektu najdeš dva connection stringy:
   - **Pooled connection** → použiješ jako `DATABASE_URL`
   - **Direct connection** → použiješ jako `DIRECT_URL`
3. Oba zkopíruj, budeš je potřebovat v dalším kroku.

(Supabase: Settings → Database → "Connection pooling" (port 6543) = `DATABASE_URL`,
"Connection string" (port 5432) = `DIRECT_URL`.)

## 4. Spuštění na vlastním počítači

```bash
# 1. Rozbal/zkopíruj projekt a přejdi do složky
cd streamer-challenges

# 2. Nainstaluj závislosti
npm install

# 3. Vytvoř .env soubor podle vzoru
cp .env.example .env
# otevři .env a vlož:
# - DATABASE_URL a DIRECT_URL z Neon/Supabase (viz sekce 3)
# - NEXTAUTH_SECRET (vygeneruješ příkazem: openssl rand -base64 32)
# - SMTP údaje (viz sekce 4b) - bez nich appka pojede, jen se emaily neodešlou

# 4. Vytvoř databázová migraci a aplikuj ji
npx prisma migrate dev --name init

# 5. Nahraj počáteční data (admin účet + pár ukázkových výzev)
npm run db:seed

# 6. Spusť appku
npm run dev
```

Appka poběží na **http://localhost:3000**. Hned po startu jdi do `/admin/week` a klikni na
**"Spustit týden"** — dokud to neuděláš, hráči vidí výzvy, ale nemohou odesílat důkazy.

Krok 4 (`prisma migrate dev`) vytvoří složku `prisma/migrations` se SQL příkazy pro vytvoření
tabulek — tu složku **commitni do gitu**, budeš ji potřebovat při nasazení na Vercel.

### 4b. Nastavení SMTP (odesílání emailů)

Appka potřebuje SMTP účet pro dva typy emailů: potvrzení registrace a notifikace adminům o
novém důkazu. Pokud `.env` SMTP proměnné nevyplníš, appka funguje dál, jen se emaily místo
odeslání jen zalogují do konzole serveru.

Příklad `.env` pro Gmail (funguje jen pro testování, potřebuješ "App password" —
ne běžné heslo k účtu: https://myaccount.google.com/apppasswords):

```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tvuj@gmail.com"
SMTP_PASS="app-password-z-googlu"
SMTP_FROM="Ultimate Streamer Challenge <tvuj@gmail.com>"
```

### Výchozí admin účet

Seed script vytvoří admin účet (rovnou s potvrzeným emailem, takže se hned přihlásíš):

- **email:** `admin@streamer.gg`
- **heslo:** `admin123`

**Hned po prvním přihlášení si vytvoř vlastní admin účet a starý seed účet smaž** (přes
`npx prisma studio`, viz níže — appka nemá v UI změnu hesla).

Pokud chceš jiný email/heslo pro admina hned od začátku, spusť seed takto:

```bash
SEED_ADMIN_EMAIL="tvuj@email.cz" SEED_ADMIN_PASSWORD="silneheslo123" npm run db:seed
```

### Jak udělat z běžného uživatele admina

```bash
npm run db:studio
```

Otevře se v prohlížeči Prisma Studio. Najdi tabulku `User`, u daného uživatele změň pole
`role` z `USER` na `ADMIN` a ulož.

## 5. Jak appka funguje v praxi

1. **Admin** v `/admin/challenges` vytvoří výzvy — název, popis, kategorie (Hra/IRL), obtížnost a body.
2. **Hráč** se zaregistruje a musí kliknout na potvrzovací odkaz, který mu přijde emailem —
   bez potvrzení se nelze přihlásit.
3. Na `/challenges` si vybere výzvu, splní ji, nahraje video/screenshot na YouTube/Twitch/Drive/
   atd. a do appky vloží jen **odkaz** (jde to ale jen tehdy, když admin už spustil aktuální týden).
4. **Admin** dostane (pokud má zapnuté notifikace v `/admin/settings`) email, že čeká nový důkaz.
   V `/admin/submissions` klikne na odkaz, ověří a buď **schválí** (může i upravit počet
   přidělených bodů) nebo **zamítne** (s důvodem).
5. Schválené body se okamžitě promítnou do žebříčků — celkového i u dané výzvy.
6. Časovač běží jen tehdy, když ho admin v `/admin/week` ručně spustí. Po vypršení (nebo
   ručním uzavření) se týden zapíše do historie a další týden znovu čeká na ruční spuštění —
   nic se nespustí samo. Historie týdnů a jejich žebříčků zůstává dostupná v `/leaderboard`
   (výběr týdne) a v `/admin/week`.

## 6. Nasazení na Vercel

1. Nahraj projekt do GitHub/GitLab repozitáře (s `prisma/migrations` uvnitř — viz krok 4).
2. Na https://vercel.com → "Add New Project" → vyber repozitář.
3. V "Environment Variables" vlož:
   - `DATABASE_URL`, `DIRECT_URL` (z Neon/Supabase)
   - `NEXTAUTH_SECRET` (vygeneruj: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` → po prvním nasazení sem vlož skutečnou adresu (`https://tvuj-projekt.vercel.app`)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
4. V "Build & Development Settings" nastav **Build Command** na:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```
   (`migrate deploy` aplikuje migrace ze složky `prisma/migrations` na produkční databázi —
   bezpečné pouštět opakovaně, nic nepřepíše, jen doplní chybějící změny.)
5. Klikni Deploy. Po prvním úspěšném nasazení se vrať do Environment Variables a oprav
   `NEXTAUTH_URL` na finální doménu, pak udělej "Redeploy".
6. Spusť seed dat **jednou, lokálně, proti produkční databázi**:
   ```bash
   DATABASE_URL="...produkční pooled URL..." DIRECT_URL="...produkční direct URL..." npm run db:seed
   ```

### Alternativa — vlastní server / VPS

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run build
npm run start   # appka poběží na portu 3000
```

Doporučeno spustit appku přes `pm2` a před ní si dát **nginx** jako reverzní proxy s HTTPS
(např. přes Certbot). I tady potřebuješ Postgres databázi (může běžet na stejném serveru).

## 7. Struktura projektu (pro orientaci)

```
prisma/schema.prisma     - datový model (User, Week, Challenge, Submission, VerificationToken, AppSettings)
prisma/seed.ts           - počáteční data (admin, první týden, ukázkové výzvy)
prisma/migrations/       - vznikne po "npx prisma migrate dev" - commitni do gitu
src/lib/                 - prisma klient, NextAuth konfigurace, logika týdnů/žebříčků, email, nastavení
src/actions/             - serverové akce (registrace, odeslání důkazu, admin akce)
src/app/                 - jednotlivé stránky (Next.js App Router), včetně /verify pro potvrzení emailu
src/components/          - opakovaně použité UI komponenty
```

## 8. Možná rozšíření do budoucna

- Vlastní upload videí/screenshotů přímo na server (místo odkazů) — vyžaduje úložiště
  (např. S3/Cloudflare R2) a je to větší změna v backendu
- Notifikace e-mailem při schválení/zamítnutí
- Sezónní žebříček (souhrn za více týdnů)
- Komentáře/diskuze u jednotlivých výzev
