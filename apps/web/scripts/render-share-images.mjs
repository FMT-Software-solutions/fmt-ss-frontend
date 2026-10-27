// Renders the 1200×630 link-preview images (one per app, plus the site and
// marketplace ones) with headless Chrome, from the live Sanity data.
//
//   node scripts/render-share-images.mjs <out dir> public/fmt-logo-white.png <dir of puppeteer-core>
//
// Needs Chrome, puppeteer-core and @fontsource/inter next to it (e.g. the
// stock-flow/promo-video project's node_modules). Then:
//   - copy fmt-default.jpg and fmt-marketplace.jpg into public/og/
//   - upload each <slug>.jpg to Sanity as the app's "Search & sharing" image
// Rerun after adding an app or changing a tagline.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const [outDir, logoPath, puppeteerDir] = process.argv.slice(2);
const require = createRequire(puppeteerDir + '/');
const puppeteer = require('puppeteer-core');
mkdirSync(outDir, { recursive: true });

const BRAND = '#e40c57';
const FONT_DIR = puppeteerDir.replace(/puppeteer-core\/?$/, '@fontsource/inter/files/');
const fontFaces = [500, 600, 700, 800]
  .map((w) => `@font-face { font-family: Inter; font-weight: ${w}; src: url(data:font/woff2;base64,${readFileSync(FONT_DIR + 'inter-latin-' + w + '-normal.woff2').toString('base64')}) format('woff2'); }`)
  .join('\n');
const logo = `data:image/png;base64,${readFileSync(logoPath).toString('base64')}`;
const q = encodeURIComponent(`*[_type=="premiumApp" && isPublished==true]|order(sortOrder asc){
  title, "slug": slug.current, tagline, isFree, hasTrialUsage, trialDays, platforms{ web{available}, desktop{ windows{available} } },
  "img": mainImage.asset->url }`);
const apps = (await (await fetch(`https://cfyhidte.apicdn.sanity.io/v2024-03-13/data/query/production?query=${q}`)).json()).result;
const dataUrl = async (url) => `data:image/jpeg;base64,${Buffer.from(await (await fetch(url + '?w=1500&fm=jpg&q=85')).arrayBuffer()).toString('base64')}`;
for (const app of apps) app.shot = await dataUrl(app.img);

const esc = (s = '') => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const shell = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontFaces}
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter, system-ui, sans-serif; color: #fff;
    background: radial-gradient(900px 520px at 85% 110%, ${BRAND}55, transparent 60%),
                radial-gradient(700px 420px at -10% -20%, ${BRAND}33, transparent 60%), #0b0f1c; }
  .grid { position: absolute; inset: 0; background-image: linear-gradient(#ffffff0a 1px, transparent 1px), linear-gradient(90deg, #ffffff0a 1px, transparent 1px);
    background-size: 40px 40px; mask-image: radial-gradient(ellipse 70% 70% at 30% 40%, #000 30%, transparent 75%); }
  .logo { height: 46px; }
  .chip { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; font-size: 21px; font-weight: 600;
    background: #ffffff14; border: 1px solid #ffffff22; color: #fff; }
  .chip.brand { background: ${BRAND}; border-color: ${BRAND}; }
  .shot { border-radius: 18px; box-shadow: 0 30px 80px -20px #000c, 0 0 0 1px #ffffff1a; object-fit: cover; }
</style></head><body><div class="grid"></div>${body}</body></html>`;

const appPage = (app) => {
  const platforms = [app.platforms?.desktop?.windows?.available && 'Windows', app.platforms?.web?.available && 'Web'].filter(Boolean).join(' · ');
  const chips = app.isFree
    ? ['Free download', 'Works offline', platforms]
    : [app.hasTrialUsage ? `Free ${app.trialDays ?? 30}-day trial` : 'Pay in instalments', 'Mobile Money', platforms];
  return centered({
    title: esc(app.title),
    titleSize: app.title.length > 14 ? 66 : 80,
    subtitle: esc(app.tagline),
    chips: chips.filter(Boolean).map(esc),
    shots: [app.shot],
  });
};

/**
 * Centred composition: WhatsApp often shows a square crop from the middle,
 * so the name, tagline and screenshot all sit in the central 630px.
 */
const centered = ({ title, titleSize = 72, subtitle, chips, shots }) => shell(`
  <img class="logo" src="${logo}" style="position:absolute; left:48px; top:40px; height:40px">
  <div style="position:absolute; left:0; right:0; top:58px; text-align:center; padding:0 200px">
    <div style="font-size:${titleSize}px; font-weight:800; letter-spacing:-2px; line-height:1.02; text-wrap:balance">${title}</div>
    <div style="margin:16px auto 0; max-width:620px; font-size:27px; line-height:1.3; color:#ffffffcc; font-weight:500; text-wrap:balance">${subtitle}</div>
    <div style="margin-top:22px; display:flex; justify-content:center; flex-wrap:wrap; gap:10px">
      ${chips.map((c, i) => `<span class="chip ${i === 0 ? 'brand' : ''}" style="font-size:19px; padding:8px 16px">${c}</span>`).join('')}
    </div>
  </div>
  ${shots
    .map((s, i, all) => {
      const n = all.length;
      const offset = (i - (n - 1) / 2) * 250;
      const front = i === Math.floor(n / 2);
      return `<img class="shot" src="${s}" style="position:absolute; left:${600 + offset - (front ? 380 : 310)}px; top:${front ? 352 : 382}px;
        width:${front ? 760 : 620}px; height:${front ? 420 : 340}px; transform: rotate(${n > 1 ? (i - (n - 1) / 2) * 5 : 0}deg);
        z-index:${front ? 3 : 1}; ${front ? '' : 'opacity:0.85;'}">`;
    })
    .join('')}
`);

const sitePage = (title, subtitle, shots) =>
  centered({ title, subtitle, chips: ['Free trials', 'Mobile Money', 'Instalments'], shots });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
const shoot = async (html, file) => {
  await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot({ type: 'jpeg', quality: 84 });
  writeFileSync(`${outDir}/${file}`, buf);
  console.log(`${file}  ${Math.round(buf.length / 1024)} KB`);
};

for (const app of apps) await shoot(appPage(app), `${app.slug}.jpg`);
const byOrder = apps.filter((a) => !a.isFree);
await shoot(
  sitePage('Software that runs your business', 'Inventory, sales, printing and church management apps for Ghana.', [byOrder[1], byOrder[0], byOrder[2]].map((a) => a.shot)),
  'fmt-default.jpg',
);
await shoot(
  sitePage('Software Marketplace', `${apps.length} apps for shops, printers and churches. Try free, then pay with Mobile Money.`, [byOrder[2], byOrder[1], byOrder[3]].map((a) => a.shot)),
  'fmt-marketplace.jpg',
);
await browser.close();
