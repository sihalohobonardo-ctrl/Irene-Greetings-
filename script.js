
const CONFIG = {
  flower: "Image/Bunga .png",
  name: "Irene Dwi Yolanda Turnip, S.Kep",                 // nama pasanganmu
  from: "Bonardo Sihaloho, S.T, M.Eng",                 // namamu
  // Foto: isi path file di folder media/, mis. "media/foto1.jpg". Kosongkan "" agar bisa dipilih manual.
  photos: ["Image/1.jpeg", "Image/2.jpeg", "Image/3.jpeg", "Image/4.jpeg", "Image/5.jpeg", "Image/6.jpeg"],
  // Video: mis. "media/video.mp4". Kosongkan "" agar bisa dipilih manual.
  video: "",
  letter: [
    "Akhirnya, hari yang kamu tunggu-tunggu datang juga. Aku tahu untuk sampai di titik ini bukanlah hal yang mudah. Ada banyak perjuangan, rasa lelah, dan mungkin juga hari-hari ketika kamu merasa ingin menyerah. Tapi hari ini, semua itu terbayar dengan indah.",
    "Aku ikut senang dan bangga melihat kamu berhasil menyelesaikan satu tahap penting dalam hidupmu. Semoga gelar yang kamu raih hari ini menjadi awal dari banyak hal baik yang akan datang. Semoga langkahmu ke depannya semakin dimudahkan, impianmu satu per satu terwujud, dan kamu selalu dikelilingi hal-hal yang membuatmu bahagia.",
    "Jangan pernah meragukan dirimu sendiri, ya. Kamu sudah membuktikan bahwa kamu mampu melewati banyak hal untuk sampai di sini.",
    "Aku juga berharap, setelah hari ini, masih ada banyak kesempatan untuk melihat kamu tumbuh, meraih impianmu, dan merayakan keberhasilan-keberhasilanmu yang lain.",
    "Sekali lagi, selamat wisuda ya ibann!!! Have fun di hari wisudamu dan maaf karena belum bisa datang yaaa."
  ]
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened = false;

/* --- isi teks --- */
$('#cardName').textContent = CONFIG.name;
$('#dear').textContent = `Dear ${CONFIG.name},`;
$('#sign').textContent = CONFIG.from;
$('#letterBody').innerHTML = CONFIG.letter.map(t => `<p></p>`).join('');
$$('#letterBody p').forEach((p, i) => p.textContent = CONFIG.letter[i]);

/* --- navigasi --- */
function go(id){
  if (id !== 'opening' && !opened) return;
  const el = document.getElementById(id);
  if (!el || el.hidden) return;
  el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
}
$$('.nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
function syncNav(){
  $$('.nav button[data-needs-open]').forEach(b => b.disabled = !opened);
  const ids = ['opening','inside','letter'].filter(i => !document.getElementById(i).hidden);
  let cur = ids[0];
  ids.forEach(i => { if (document.getElementById(i).getBoundingClientRect().top < innerHeight*.5) cur = i; });
  $$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.go === cur));
}
addEventListener('scroll', syncNav, {passive:true});
syncNav();

/* --- buka amplop --- */
function openEnvelope(){
  if (opened) return;
  opened = true;
  $('#envelope').classList.add('open');
  $('#openBtn').textContent = 'Klik Tombol Ini ya';
  $('#openBtn').classList.add('link');
  $('#openTitle').textContent = 'Selamat Wisuda Ibannn ';
  burstPetals(28);
  setTimeout(() => {
    $('#openBtn').onclick = showInside;
  }, 50);
  setTimeout(showInside, reduce ? 300 : 2600);
}
let shown = false;
function showInside(){
  if (shown) return;
  shown = true;
  document.body.classList.remove('locked');
  ['inside','letter'].forEach(id => {
    const s = document.getElementById(id);
    s.hidden = false; s.classList.add('show');
  });
  syncNav();
  go('inside');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){
      $$('#letterBody p').forEach((p,i) => setTimeout(() => p.classList.add('in'), reduce ? 0 : i*500));
      io.disconnect();
    }
  }), {threshold:.25});
  io.observe($('#paper'));
}
$('#seal').addEventListener('click', openEnvelope);
$('#envelope').addEventListener('click', openEnvelope);
$('#openBtn').onclick = openEnvelope;

/* --- galeri foto (hanya dari CONFIG, pengunjung tidak bisa mengubah) --- */
const photos = [...CONFIG.photos];
const gallery = $('#gallery');

function renderGallery(){
  gallery.innerHTML = '';
  photos.forEach((src, i) => {
    const d = document.createElement('div');
    if (src){
      d.className = 'slot filled';
      d.tabIndex = 0;
      d.setAttribute('role','button');
      d.setAttribute('aria-label', `Lihat foto ${i+1}`);
      const img = new Image();
      img.src = src; img.alt = `Foto kenangan ${i+1}`; img.loading = 'lazy'; img.decoding = 'async';
      img.onerror = () => { photos[i] = ''; renderGallery(); };
      d.append(img);
      d.addEventListener('click', () => openLightbox(i));
      d.addEventListener('keydown', e => { if (e.key==='Enter' || e.key===' '){ e.preventDefault(); openLightbox(i); } });
    } else {
      d.className = 'slot empty';
      d.innerHTML = `<div class="ph"><b>♥</b><span>Foto ${i+1}</span></div>`;
    }
    gallery.append(d);
  });
}
renderGallery();

/* --- lightbox --- */
let lb = 0;
const filledIdx = () => photos.map((p,i) => p ? i : -1).filter(i => i >= 0);
function openLightbox(i){ lb = i; $('#lightbox').hidden = false; showLb(); }
function showLb(){ $('#lbImg').src = photos[lb]; }
function stepLb(d){
  const list = filledIdx(); if (!list.length) return closeLb();
  lb = list[(list.indexOf(lb) + d + list.length) % list.length]; showLb();
}
function closeLb(){ $('#lightbox').hidden = true; }
$('#lbClose').onclick = closeLb;
$('#lbPrev').onclick = () => stepLb(-1);
$('#lbNext').onclick = () => stepLb(1);
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLb(); });
addEventListener('keydown', e => {
  if ($('#lightbox').hidden) return;
  if (e.key==='Escape') closeLb();
  if (e.key==='ArrowLeft') stepLb(-1);
  if (e.key==='ArrowRight') stepLb(1);
});
let tx = 0;
$('#lightbox').addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
$('#lightbox').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
});

/* --- video (hanya dari CONFIG) --- */
const video = $('#video');
function resetVideo(){
  video.removeAttribute('src'); video.load(); video.hidden = true;
  $('#videoPick').hidden = false; $('#videoBox').classList.remove('filled');
}
if (CONFIG.video){
  video.src = CONFIG.video; video.hidden = false;
  $('#videoPick').hidden = true; $('#videoBox').classList.add('filled');
  video.addEventListener('error', resetVideo);
}

/* --- efek --- */
function burstPetals(n){
  if (reduce) return;
  const box = $('#petals');
  for (let i=0;i<n;i++){
    const p = document.createElement('i');
    p.className = 'petal';
    p.style.left = Math.random()*100 + 'vw';
    p.style.setProperty('--dx', (Math.random()*160-80) + 'px');
    p.style.animationDuration = (5 + Math.random()*5) + 's';
    p.style.animationDelay = (Math.random()*1.5) + 's';
    p.style.transform = `scale(${.7+Math.random()*.8})`;
    box.append(p);
    setTimeout(() => p.remove(), 12000);
  }
}
$('#loveBtn').addEventListener('click', e => {
  burstPetals(18);
  if (reduce) return;
  const r = e.currentTarget.getBoundingClientRect();
  for (let i=0;i<14;i++){
    const h = document.createElement('span');
    h.className = 'heart'; h.textContent = '♥';
    h.style.left = (r.left + r.width/2 + Math.random()*60-30) + 'px';
    h.style.top = r.top + 'px';
    h.style.fontSize = (14 + Math.random()*20) + 'px';
    h.style.setProperty('--dx', (Math.random()*200-100) + 'px');
    h.style.animationDelay = (i*60) + 'ms';
    document.body.append(h);
    setTimeout(() => h.remove(), 2400);
  }
});

/* --- tutup amplop / ulang --- */
$('#replayBtn').addEventListener('click', () => {
  go('opening');
  setTimeout(() => {
    $('#envelope').classList.remove('open');
    $('#openBtn').textContent = 'Ketuk untuk membuka';
    $('#openBtn').classList.remove('link');
    $('#openTitle').textContent = 'Sebuah Surat Spesial Untukmu';
    $('#openBtn').onclick = () => { $('#envelope').classList.add('open'); $('#openTitle').textContent='Selamat Wisuda!'; burstPetals(20); go('inside'); };
    $('#envelope').onclick = null;
  }, 700);
});

/* --- kelopak ambient (terus bergerak, 22 elemen di HP agar tetap ringan) --- */
(function(){
  if (reduce) return;
  const box = $('#petals');
  const N = innerWidth < 700 ? 22 : 34;
  for (let i=0;i<N;i++){
    const p = document.createElement('i');
    p.className = 'petal amb' + (i % 3 === 0 ? ' flower' : '');
    p.style.left = (i*(100/N) + Math.random()*(100/N)) + 'vw';
    p.style.setProperty('--dx', (Math.random()*120-60) + 'px');
    p.style.animationDuration = (14 + Math.random()*10) + 's';
    p.style.animationDelay = (-Math.random()*20) + 's';
    box.append(p);
  }
})();
