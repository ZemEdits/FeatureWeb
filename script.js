const $ = (id) => document.getElementById(id);
$('year').textContent = new Date().getFullYear();

document.querySelectorAll('[data-panel]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.workspace').forEach(panel => panel.classList.remove('open'));
    const panel = $(button.dataset.panel);
    panel.classList.add('open');
    panel.scrollIntoView({behavior:'smooth', block:'start'});
  });
});
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('.workspace').classList.remove('open')));
$('toolSearch').addEventListener('input', event => {
  const term = event.target.value.toLowerCase().trim();
  document.querySelectorAll('.tool-card').forEach(card => card.hidden = !card.dataset.search.includes(term) && !card.innerText.toLowerCase().includes(term));
});

function loadImage(file, callback) {
  if (!file || !file.type.startsWith('image/')) { alert('Please choose a valid image file.'); return; }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { callback(img, url); };
  img.onerror = () => { URL.revokeObjectURL(url); alert('This image could not be opened.'); };
  img.src = url;
}
function downloadCanvas(canvas, mime, filename) {
  if (!canvas.width || !canvas.height) { alert('Please choose an image first.'); return; }
  canvas.toBlob(blob => {
    if (!blob) { alert('Could not create the file. Try another format.'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, mime, 0.92);
}

let photoImage = null, photoUrl = null;
const photoCanvas = $('photoCanvas'), photoCtx = photoCanvas.getContext('2d');
function drawPhoto() {
  if (!photoImage) return;
  photoCanvas.width = photoImage.naturalWidth; photoCanvas.height = photoImage.naturalHeight;
  photoCtx.filter = `brightness(${$('brightness').value}%) contrast(${$('contrast').value}%) ${$('filter').value}`;
  photoCtx.drawImage(photoImage, 0, 0); photoCtx.filter = 'none';
  photoCanvas.style.display = 'block'; $('photoHint').style.display = 'none'; $('downloadPhoto').disabled = false;
}
$('photoFile').addEventListener('change', e => loadImage(e.target.files[0], (img, url) => {
  if (photoUrl) URL.revokeObjectURL(photoUrl); photoImage = img; photoUrl = url; drawPhoto();
}));
['brightness','contrast','filter'].forEach(id => $(id).addEventListener('input', drawPhoto));
$('downloadPhoto').addEventListener('click', () => downloadCanvas(photoCanvas, 'image/png', 'toolnest-edited.png'));

let convertImage = null, convertUrl = null;
$('convertFile').addEventListener('change', e => loadImage(e.target.files[0], (img, url) => {
  if (convertUrl) URL.revokeObjectURL(convertUrl); convertImage = img; convertUrl = url; $('convertDownload').disabled = false;
}));
$('convertDownload').addEventListener('click', () => {
  if (!convertImage) return;
  const canvas = document.createElement('canvas'); canvas.width = convertImage.naturalWidth; canvas.height = convertImage.naturalHeight;
  const ctx = canvas.getContext('2d');
  if ($('convertFormat').value === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
  ctx.drawImage(convertImage,0,0);
  const mime = $('convertFormat').value;
  const ext = mime === 'image/jpeg' ? 'jpg' : mime.split('/')[1];
  downloadCanvas(canvas,mime,`toolnest-converted.${ext}`);
});

let resizeImage = null, resizeUrl = null;
$('resizeFile').addEventListener('change', e => loadImage(e.target.files[0], (img, url) => {
  if (resizeUrl) URL.revokeObjectURL(resizeUrl); resizeImage = img; resizeUrl = url;
  $('resizeWidth').value = img.naturalWidth; $('resizeHeight').value = img.naturalHeight; $('resizeDownload').disabled = false;
}));
$('resizeWidth').addEventListener('input', () => {
  if (resizeImage && $('keepRatio').checked && $('resizeWidth').value) $('resizeHeight').value = Math.max(1, Math.round(Number($('resizeWidth').value) * resizeImage.naturalHeight / resizeImage.naturalWidth));
});
$('resizeHeight').addEventListener('input', () => {
  if (resizeImage && $('keepRatio').checked && $('resizeHeight').value) $('resizeWidth').value = Math.max(1, Math.round(Number($('resizeHeight').value) * resizeImage.naturalWidth / resizeImage.naturalHeight));
});
$('resizeDownload').addEventListener('click', () => {
  if (!resizeImage) return;
  const w = Number($('resizeWidth').value), h = Number($('resizeHeight').value);
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 8000 || h > 8000) { alert('Enter width and height between 1 and 8000 pixels.'); return; }
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(resizeImage,0,0,w,h);
  downloadCanvas(canvas,'image/png',`toolnest-${w}x${h}.png`);
});

$('calculatePercent').addEventListener('click', () => {
  const p = Number($('percentValue').value), n = Number($('percentBase').value);
  if ($('percentValue').value === '' || $('percentBase').value === '' || !Number.isFinite(p) || !Number.isFinite(n)) { $('percentResult').textContent = 'Enter a percentage and a number first.'; return; }
  $('percentResult').textContent = `${p}% of ${n} = ${Number((p/100*n).toFixed(6))}`;
});
