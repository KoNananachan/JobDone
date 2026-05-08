// Generate build/icon.png (1024x1024) using a hidden Electron window.
const { app, BrowserWindow } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const html = `<!doctype html><html><body style="margin:0;background:transparent;">
<canvas id="c" width="1024" height="1024"></canvas>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const W = 1024, H = 1024;
const pad = 64, r = 220;
const x = pad, y = pad, w = W - pad*2, h = H - pad*2;

// Outer rounded square with gradient
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

// Inner highlight glow
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

// Soft shadow under the check
ctx.save();
ctx.shadowColor = 'rgba(0,0,0,0.32)';
ctx.shadowBlur = 32;
ctx.shadowOffsetY = 18;
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 96;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.beginPath();
ctx.moveTo(280, 540);
ctx.lineTo(460, 720);
ctx.lineTo(760, 340);
ctx.stroke();
ctx.restore();

// Subtle inner stroke for crisp edge
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

window._ready = true;
</script>
</body></html>`;

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1024, height: 1024,
    show: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: false, sandbox: false },
  });
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise((r) => setTimeout(r, 200));
  const dataUrl = await win.webContents.executeJavaScript(
    "document.getElementById('c').toDataURL('image/png')"
  );
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  const outDir = path.join(__dirname, '..', 'build');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'icon.png');
  fs.writeFileSync(out, buf);
  console.log('Wrote', out, buf.length, 'bytes');
  app.quit();
});
