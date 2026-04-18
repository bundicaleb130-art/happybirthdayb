/* ══════════════════════════════════════════════════
   BIRTHDAY SITE — script.js
   Handles: login → gallery transition, confetti,
   floating emojis, lightbox, scroll animations
══════════════════════════════════════════════════ */

'use strict';

/* ── DOM refs ──────────────────────────────────── */
const nameInput   = document.getElementById('name-input');
const enterBtn    = document.getElementById('enter-btn');
const pageLogin   = document.getElementById('page-login');
const pageGallery = document.getElementById('page-gallery');
const nameDisplay = document.getElementById('name-display');
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lb-img');
const lbClose     = document.getElementById('lb-close');
const lbPrev      = document.getElementById('lb-prev');
const lbNext      = document.getElementById('lb-next');
const canvas      = document.getElementById('confetti-canvas');
const ctx         = canvas.getContext('2d');

/* ═══════════════════════════════════════════════
   FLOATING EMOJIS
═══════════════════════════════════════════════ */
const EMOJIS = ['🎉','🎊','🎈','🎂','✨','💛','💖','🌟','🥳','🎁','🌸','🦋','🍀','🌈','💫','🎶'];

function spawnFloaters (count = 18) {
  const container = document.getElementById('floaters');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'floater';
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    el.style.left     = `${Math.random() * 100}%`;
    el.style.animationDuration = `${6 + Math.random() * 10}s`;
    el.style.animationDelay   = `${Math.random() * 8}s`;
    el.style.fontSize = `${1 + Math.random() * 1.6}rem`;
    container.appendChild(el);
  }
}
spawnFloaters();

/* ═══════════════════════════════════════════════
   CONFETTI ENGINE
═══════════════════════════════════════════════ */
const COLORS = ['#ff6eb4','#ffe066','#ffb347','#c9aaff','#7ef5c0','#7dd8ff','#ff8c66','#fff'];
let pieces = [];
let confettiRunning = false;
let confettiRaf;

function resizeCanvas () {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Piece {
  constructor () { this.reset(true); }

  reset (fromTop = false) {
    this.x   = Math.random() * canvas.width;
    this.y   = fromTop ? -20 : Math.random() * canvas.height;
    this.r   = 4 + Math.random() * 7;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.rot  = Math.random() * Math.PI * 2;
    this.vx   = (Math.random() - 0.5) * 2.5;
    this.vy   = 2 + Math.random() * 4;
    this.vrot = (Math.random() - 0.5) * 0.15;
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
    this.w = this.r * 2; this.h = this.r * 0.6;
    this.alpha = 0.85 + Math.random() * 0.15;
    this.decay  = 0;
  }

  update () {
    this.x   += this.vx;
    this.y   += this.vy;
    this.rot += this.vrot;
    this.vy  += 0.04;    // gravity
    this.vx  += (Math.random() - 0.5) * 0.08; // drift
    if (this.decay > 0) { this.alpha -= 0.008; }
    if (this.alpha < 0 || this.y > canvas.height + 20) this.reset(true);
  }

  draw () {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    } else {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.r, this.r * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function launchConfetti (particleCount = 140) {
  pieces = [];
  for (let i = 0; i < particleCount; i++) {
    const p = new Piece();
    p.y = -Math.random() * canvas.height * 0.6;
    pieces.push(p);
  }
  confettiRunning = true;
  animateConfetti();

  setTimeout(() => {
    pieces.forEach(p => { p.decay = 1; });
    setTimeout(() => { confettiRunning = false; ctx.clearRect(0,0,canvas.width,canvas.height); }, 3000);
  }, 6000);
}

function animateConfetti () {
  if (!confettiRunning) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach(p => { p.update(); p.draw(); });
  confettiRaf = requestAnimationFrame(animateConfetti);
}

/* ═══════════════════════════════════════════════
   LOGIN LOGIC
═══════════════════════════════════════════════ */
nameInput.addEventListener('input', () => {
  const val = nameInput.value.trim();
  enterBtn.disabled = val.length === 0;
  if (val.length > 0) {
    enterBtn.style.animation = 'none';
    void enterBtn.offsetWidth;
    enterBtn.style.animation = 'pulse-btn 0.5s ease';
  }
});

nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !enterBtn.disabled) handleEnter();
});

enterBtn.addEventListener('click', () => {
  if (!enterBtn.disabled) handleEnter();
});

function handleEnter () {
  const name = nameInput.value.trim();
  if (!name) return;

  nameInput.disabled = true;
  enterBtn.disabled  = true;

  const card = document.querySelector('.login-card');
  card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease';
  card.style.transform = 'scale(1.08)';
  setTimeout(() => {
    card.style.opacity   = '0';
    card.style.transform = 'scale(0.8)';
  }, 200);

  launchConfetti(160);
  startMusic();

  setTimeout(() => {
    pageLogin.classList.remove('active');
    pageGallery.classList.add('active');
    nameDisplay.textContent = name;
    pageGallery.scrollTo({ top: 0 });
    setTimeout(() => launchConfetti(120), 500);
  }, 600);
}

/* ═══════════════════════════════════════════════
   MUSIC PLAYER
═══════════════════════════════════════════════ */
const bgMusic     = document.getElementById('bg-music');
const musicPlayer = document.getElementById('music-player');
const musicDisc   = document.getElementById('music-disc');
const musicToggle = document.getElementById('music-toggle');
const musicMute   = document.getElementById('music-mute');
const musicFill   = document.getElementById('music-bar-fill');
const musicTime   = document.getElementById('music-time');
const musicTitle  = document.getElementById('music-title');

function extractTitle (src) {
  if (!src) return 'Birthday Song';
  const base = src.split('/').pop().replace(/\.[^.]+$/, '');
  return base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Birthday Song';
}

function formatTime (secs) {
  if (!isFinite(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function startMusic () {
  if (!bgMusic) return;
  const src = bgMusic.querySelector('source')?.src || bgMusic.src;
  musicTitle.textContent = extractTitle(src);
  bgMusic.volume = 0;
  bgMusic.play().then(() => {
    musicPlayer.classList.remove('hidden');
    fadeVolume(0, 0.7, 2000);
  }).catch(() => {
    musicPlayer.classList.remove('hidden');
    musicToggle.textContent = '▶';
    musicDisc.classList.add('paused');
  });
}

function fadeVolume (from, to, durationMs) {
  const steps = 40;
  const stepTime = durationMs / steps;
  const delta = (to - from) / steps;
  let current = from;
  const iv = setInterval(() => {
    current = Math.min(Math.max(current + delta, 0), 1);
    bgMusic.volume = current;
    if ((delta > 0 && current >= to) || (delta < 0 && current <= to)) clearInterval(iv);
  }, stepTime);
}

bgMusic.addEventListener('timeupdate', () => {
  if (!bgMusic.duration) return;
  const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
  musicFill.style.width = `${pct}%`;
  musicTime.textContent = formatTime(bgMusic.currentTime);
});

bgMusic.addEventListener('loadedmetadata', () => {
  musicTime.textContent = formatTime(bgMusic.duration);
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle.textContent = '⏸';
    musicDisc.classList.remove('paused');
    musicPlayer.classList.remove('paused');
  } else {
    bgMusic.pause();
    musicToggle.textContent = '▶';
    musicDisc.classList.add('paused');
    musicPlayer.classList.add('paused');
  }
});

let lastVol = 0.7;
musicMute.addEventListener('click', () => {
  if (bgMusic.muted || bgMusic.volume === 0) {
    bgMusic.muted = false;
    bgMusic.volume = lastVol;
    musicMute.textContent = '🔊';
  } else {
    lastVol = bgMusic.volume;
    bgMusic.muted = true;
    musicMute.textContent = '🔇';
  }
});

bgMusic.addEventListener('play',  () => { musicDisc.classList.remove('paused'); musicPlayer.classList.remove('paused'); musicToggle.textContent = '⏸'; });
bgMusic.addEventListener('pause', () => { musicDisc.classList.add('paused');    musicPlayer.classList.add('paused');    musicToggle.textContent = '▶'; });

/* ═══════════════════════════════════════════════
   LIGHTBOX — mobile-first, GPU-accelerated
   • Preloads adjacent images
   • Smooth slide transition (left ↔ right)
   • Waits for image load before animating in
   • 48px+ touch targets, swipe support
   • Distinguishes horizontal swipe from scroll
═══════════════════════════════════════════════ */
const photoCards = Array.from(document.querySelectorAll('.photo-card'));
const imgSrcs    = photoCards.map(card => card.querySelector('img')?.src).filter(Boolean);

let currentLbIdx    = 0;
let lbTransitioning = false;

/* Set up accessibility attributes */
photoCards.forEach((card, i) => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View photo ${i + 1}`);
  card.addEventListener('click', () => openLightbox(i));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
  });
});

/* Preload neighbouring images for instant feel */
function preloadAdjacent (idx) {
  [-1, 1].forEach(offset => {
    const i = (idx + offset + imgSrcs.length) % imgSrcs.length;
    if (imgSrcs[i]) { const img = new Image(); img.src = imgSrcs[i]; }
  });
}

function openLightbox (idx) {
  currentLbIdx = idx;

  /* Reset image state before showing */
  lbImg.style.transition = 'none';
  lbImg.style.opacity    = '0';
  lbImg.style.transform  = 'scale(0.94)';
  lbImg.src = imgSrcs[idx];
  lbImg.alt = `Photo ${idx + 1}`;

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';

  const animateIn = () => {
    requestAnimationFrame(() => {
      lbImg.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      lbImg.style.opacity    = '1';
      lbImg.style.transform  = 'scale(1)';
    });
  };

  if (lbImg.complete && lbImg.naturalWidth > 0) {
    animateIn();
  } else {
    lbImg.onload = animateIn;
  }

  preloadAdjacent(idx);
}

function closeLightbox () {
  lbImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  lbImg.style.opacity    = '0';
  lbImg.style.transform  = 'scale(0.94)';
  setTimeout(() => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
    lbImg.style.transition = 'none';
    lbTransitioning = false;
  }, 210);
}

function showLbImg (newIdx, direction) {
  if (lbTransitioning) return;
  lbTransitioning = true;

  const outX = direction === 'next' ? '-100%' : '100%';
  const inX  = direction === 'next' ? '100%'  : '-100%';

  /* Slide current image out */
  lbImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  lbImg.style.opacity    = '0';
  lbImg.style.transform  = `translateX(${outX})`;

  setTimeout(() => {
    currentLbIdx = (newIdx + imgSrcs.length) % imgSrcs.length;

    /* Snap new image to incoming side (no transition) */
    lbImg.style.transition = 'none';
    lbImg.style.transform  = `translateX(${inX})`;
    lbImg.style.opacity    = '0';
    lbImg.src = imgSrcs[currentLbIdx];
    lbImg.alt = `Photo ${currentLbIdx + 1}`;

    const animateIn = () => {
      requestAnimationFrame(() => {
        lbImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        lbImg.style.opacity    = '1';
        lbImg.style.transform  = 'translateX(0)';
        setTimeout(() => { lbTransitioning = false; }, 260);
      });
    };

    if (lbImg.complete && lbImg.naturalWidth > 0) {
      animateIn();
    } else {
      lbImg.onload = animateIn;
    }

    preloadAdjacent(currentLbIdx);
  }, 210);
}

/* Buttons */
lbNext.addEventListener('click',  () => showLbImg(currentLbIdx + 1, 'next'));
lbPrev.addEventListener('click',  () => showLbImg(currentLbIdx - 1, 'prev'));
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

/* Keyboard */
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowRight') showLbImg(currentLbIdx + 1, 'next');
  if (e.key === 'ArrowLeft')  showLbImg(currentLbIdx - 1, 'prev');
});

/* Touch swipe — distinguishes horizontal from vertical scroll */
let lbTouchStartX = 0;
let lbTouchStartY = 0;
let lbIsSwiping   = false;

lightbox.addEventListener('touchstart', (e) => {
  lbTouchStartX = e.touches[0].clientX;
  lbTouchStartY = e.touches[0].clientY;
  lbIsSwiping   = false;
}, { passive: true });

lightbox.addEventListener('touchmove', (e) => {
  const dx = Math.abs(e.touches[0].clientX - lbTouchStartX);
  const dy = Math.abs(e.touches[0].clientY - lbTouchStartY);
  if (dx > dy && dx > 10) {
    lbIsSwiping = true;
    e.preventDefault(); // stop page scroll while swiping
  }
}, { passive: false });

lightbox.addEventListener('touchend', (e) => {
  if (!lbIsSwiping) return;
  const diff = lbTouchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 45) {
    diff > 0
      ? showLbImg(currentLbIdx + 1, 'next')
      : showLbImg(currentLbIdx - 1, 'prev');
  }
}, { passive: true });

/* ═══════════════════════════════════════════════
   STAGGERED PHOTO CARD REVEAL
   Cards fade + rise in one by one as they enter
   the viewport. Each card waits for the previous
   one to finish before starting (true sequential).
═══════════════════════════════════════════════ */
function setupCardReveal () {
  const cards = Array.from(document.querySelectorAll('.photo-card'));

  /* Start all cards invisible and shifted down */
  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(40px) scale(0.96)';
    card.style.transition = 'none';
  });

  /* Reveal one card at a time using IntersectionObserver +
     a sequential delay so they pop in like a slideshow */
  let revealIndex = 0;

  function revealNext () {
    if (revealIndex >= cards.length) return;
    const card = cards[revealIndex];
    revealIndex++;

    /* Small stagger between each card */
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    card.style.opacity    = '1';
    card.style.transform  = 'translateY(0) scale(1)';

    /* Wait for this card's transition to mostly finish, then do the next */
    setTimeout(revealNext, 350);
  }

  /* Use IntersectionObserver to wait until the grid is visible
     (user may have scrolled or the page just appeared) */
  const grid = document.getElementById('gallery-grid');
  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gridObserver.disconnect();
        /* Short pause after page transition, then start the cascade */
        setTimeout(revealNext, 300);
      }
    });
  }, { threshold: 0.05 });

  gridObserver.observe(grid);

  /* Also trigger scroll-reveal for video & message sections */
  const others = document.querySelectorAll('.video-wrapper, .message-card');
  const otherObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        otherObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  others.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'none';
    otherObserver.observe(el);
  });
}

const galleryObserver = new MutationObserver(() => {
  if (pageGallery.classList.contains('active')) {
    setTimeout(setupCardReveal, 150);
    galleryObserver.disconnect();
  }
});
galleryObserver.observe(pageGallery, { attributes: true, attributeFilter: ['class'] });

/* ═══════════════════════════════════════════════
   PHOTO CARD TILT (desktop only)
═══════════════════════════════════════════════ */
if (!('ontouchstart' in window)) {
  document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.photo-card').forEach(card => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 2.5) {
        card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.03)`;
      } else {
        card.style.transform = '';
      }
    });
  });

  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.photo-card').forEach(c => { c.style.transform = ''; });
  });
}

/* ═══════════════════════════════════════════════
   BUTTON PULSE ANIMATION
═══════════════════════════════════════════════ */
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes pulse-btn {
  0%   { box-shadow: 0 0 0 0 rgba(255,110,180,0.6); }
  70%  { box-shadow: 0 0 0 12px rgba(255,110,180,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,110,180,0); }
}
`;
document.head.appendChild(styleTag);

/* ═══════════════════════════════════════════════
   VIDEO — fade in when visible
═══════════════════════════════════════════════ */
const video = document.getElementById('highlight-video');
if (video) {
  const videoObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.style.transition = 'opacity 0.8s ease';
        video.style.opacity = '1';
        videoObs.disconnect();
      }
    });
  }, { threshold: 0.25 });

  video.style.opacity = '0';
  videoObs.observe(video);
}

console.log('🎂 Birthday site loaded! Enjoy the celebration! 🎉');
