// Gera a imagem de compartilhamento (Open Graph) e os ícones PNG do site.
// Uso (na pasta do projeto):  npm i -D playwright && node scripts/gerar-imagens.mjs
// Se o navegador ainda não estiver instalado: npx playwright install chromium
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(dir, '../public/assets/img');
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;

const browser = await chromium.launch({ proxy });

async function render(file, size, target) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(dir, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, target), type: 'png' });
  await page.close();
  console.log('✓', target);
}

await render('og-image.html', { width: 1200, height: 630 }, 'og-image.png');
await render('icon.html', { width: 512, height: 512 }, 'icon-512.png');
await render('icon.html', { width: 192, height: 192 }, 'icon-192.png');
await render('icon.html', { width: 180, height: 180 }, 'apple-touch-icon.png');

await browser.close();
