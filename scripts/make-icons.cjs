// Generate every icon variant the app needs:
//   build/icon.png              — 1024x1024 master app icon
//   build/icon.icns             — macOS app icon
//   build/icon.ico              — Windows app icon
//   build/trayTemplate.png      — macOS tray (template image, auto-tinted)
//   build/trayTemplate@2x.png   — macOS tray retina
//   build/tray.png              — Windows tray (16x16 white-on-transparent)
//
// Run with:  npx electron scripts/make-icons.cjs

const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const toIco = require('to-ico');

const buildDir = path.join(__dirname, '..', 'build');

function appIconHtml(size) {
  return `<!doctype html><html><body style="margin:0;background:transparent;">
<canvas id="c" width="${size}" height="${size}"></canvas>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const W = ${size}, H = ${size};
const pad = W * 0.0625, r = W * 0.215;
const x = pad, y = pad, w = W - pad*2, h = H - pad*2;

const grad = ctx.createLinearGradient(0, 0, W, H);
grad.addColorStop(0, '#7c5cff');
grad.addColorStop(0.55, '#5b8cff');
grad.addColorStop(1, '#4dd0ff');
ctx.fillStyle = grad;
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
ctx.fill();

const glow = ctx.createRadialGradient(W*0.32, H*0.28, 40, W*0.32, H*0.28, W*0.7);
glow.addColorStop(0, 'rgba(255,255,255,0.32)');
glow.addColorStop(0.5, 'rgba(255,255,255,0.05)');
glow.addColorStop(1, 'rgba(255,255,255,0)');
ctx.fillStyle = glow;
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
ctx.fill();

ctx.save();
ctx.shadowColor = 'rgba(0,0,0,0.32)';
ctx.shadowBlur = W * 0.031;
ctx.shadowOffsetY = W * 0.018;
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = W * 0.094;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.beginPath();
ctx.moveTo(W*0.273, H*0.527);
ctx.lineTo(W*0.449, H*0.703);
ctx.lineTo(W*0.742, H*0.332);
ctx.stroke();
ctx.restore();

ctx.strokeStyle = 'rgba(255,255,255,0.18)';
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(x + r, y);
ctx.arcTo(x + w, y, x + w, y + h, r);
ctx.arcTo(x + w, y + h, x, y + h, r);
ctx.arcTo(x, y + h, x, y, r);
ctx.arcTo(x, y, x + w, y, r);
ctx.closePath();
ctx.stroke();
</script></body></html>`;
}

function trayHtml(size, color) {
  return `<!doctype html><html><body style="margin:0;background:transparent;">
<canvas id="c" width="${size}" height="${size}"></canvas>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const W = ${size}, H = ${size};
ctx.strokeStyle = '${color}';
ctx.lineWidth = Math.max(1.5, W * 0.13);
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.beginPath();
ctx.moveTo(W*0.20, H*0.55);
ctx.lineTo(W*0.42, H*0.75);
ctx.lineTo(W*0.80, H*0.30);
ctx.stroke();
</script></body></html>`;
}

let sharedWin = null;
function ensureWin() {
  if (sharedWin && !sharedWin.isDestroyed()) return sharedWin;
  sharedWin = new BrowserWindow({
    width: 1024, height: 1024,
    show: false, transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: false, sandbox: false },
  });
  return sharedWin;
}

async function renderToPng(html, _size) {
  const win = ensureWin();
  // Load a blank page first to clear any prior state; data:text/html with the
  // same prefix sometimes confuses the navigation cache.
  await win.loadURL('about:blank');
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise((r) => setTimeout(r, 150));
  const dataUrl = await win.webContents.executeJavaScript(
    "document.getElementById('c').toDataURL('image/png')"
  );
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function main() {
  fs.mkdirSync(buildDir, { recursive: true });

  // Master 1024x1024 app icon
  const masterPng = await renderToPng(appIconHtml(1024), 1024);
  fs.writeFileSync(path.join(buildDir, 'icon.png'), masterPng);
  console.log('wrote icon.png', masterPng.length);

  // macOS .icns (via iconutil)
  const iconset = path.join(buildDir, 'icon.iconset');
  fs.mkdirSync(iconset, { recursive: true });
  const macSizes = [
    [16, 'icon_16x16'],
    [32, 'icon_16x16@2x'],
    [32, 'icon_32x32'],
    [64, 'icon_32x32@2x'],
    [128, 'icon_128x128'],
    [256, 'icon_128x128@2x'],
    [256, 'icon_256x256'],
    [512, 'icon_256x256@2x'],
    [512, 'icon_512x512'],
    [1024, 'icon_512x512@2x'],
  ];
  for (const [s, name] of macSizes) {
    execSync(
      `sips -z ${s} ${s} ${path.join(buildDir, 'icon.png')} --out ${path.join(iconset, name + '.png')}`,
      { stdio: 'ignore' }
    );
  }
  execSync(`iconutil -c icns ${iconset} -o ${path.join(buildDir, 'icon.icns')}`, { stdio: 'ignore' });
  fs.rmSync(iconset, { recursive: true, force: true });
  console.log('wrote icon.icns');

  // Windows .ico (multi-size)
  const winSizes = [16, 24, 32, 48, 64, 128, 256];
  const winBuffers = [];
  const tmp = path.join(buildDir, 'ico-tmp');
  fs.mkdirSync(tmp, { recursive: true });
  for (const s of winSizes) {
    const out = path.join(tmp, `${s}.png`);
    execSync(
      `sips -z ${s} ${s} ${path.join(buildDir, 'icon.png')} --out ${out}`,
      { stdio: 'ignore' }
    );
    winBuffers.push(fs.readFileSync(out));
  }
  const ico = await toIco(winBuffers);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('wrote icon.ico', ico.length);

  // macOS tray template (16/32) — black-on-transparent so macOS auto-tints
  const trayMac1x = await renderToPng(trayHtml(16, '#000'), 16);
  const trayMac2x = await renderToPng(trayHtml(32, '#000'), 32);
  fs.writeFileSync(path.join(buildDir, 'trayTemplate.png'), trayMac1x);
  fs.writeFileSync(path.join(buildDir, 'trayTemplate@2x.png'), trayMac2x);
  console.log('wrote trayTemplate.png + @2x');

  // Windows tray — 32x32 white check (works on light + dark Windows tray)
  const trayWin = await renderToPng(trayHtml(32, '#ffffff'), 32);
  fs.writeFileSync(path.join(buildDir, 'tray.png'), trayWin);
  console.log('wrote tray.png');

  app.quit();
}

app.whenReady().then(() => {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
});
