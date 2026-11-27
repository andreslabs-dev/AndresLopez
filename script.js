(function () {
  'use strict';
  var root = document.documentElement; root.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  /* ---------- Iconos de trazo 24x24 ---------- */
  var IC = {
    kanban: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
    process: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h3a3 3 0 0 1 3 3v6"/>',
    stages: '<path d="M3 20h5v-5h5v-5h5V5h3"/><path d="M18 5h3v3"/>',
    sql: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    algo: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M18 11c0 4-5 4-12 6"/>',
    tree: '<rect x="9" y="3" width="6" height="5" rx="1.5"/><rect x="3" y="16" width="6" height="5" rx="1.5"/><rect x="15" y="16" width="6" height="5" rx="1.5"/><path d="M12 8v4M6 16v-4h12v4"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/><path d="M9 15l2-2-2-2M13 15h3"/>',
    scale: '<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.5 6a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    graph: '<circle cx="12" cy="4.5" r="1.8"/><circle cx="6.5" cy="12" r="1.8"/><circle cx="17.5" cy="12" r="1.8"/><circle cx="3.5" cy="19.5" r="1.8"/><circle cx="9.5" cy="19.5" r="1.8"/><path d="M10.9 6L7.6 10.5M13.1 6L16.4 10.5M5.8 13.7L4.2 17.8M7.2 13.7L8.8 17.8"/>',
    latex: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><path d="M14 11h-4l3 3-3 3h4"/>',
    java: '<path d="M5 10h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h2a2.5 2.5 0 0 1 0 5h-2M9 3c-1.5 1.5 1.5 2.5 0 4M13 3c-1.5 1.5 1.5 2.5 0 4"/>',
    python: '<path d="M12 3H9a3 3 0 0 0-3 3v3h6v1.5H5.5A2.5 2.5 0 0 0 3 13v1.5A3.5 3.5 0 0 0 6.5 18H8v-3a3 3 0 0 1 3-3h4a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"/><path d="M12 21h3a3 3 0 0 0 3-3v-3h-6v-1.5h6.5A2.5 2.5 0 0 0 21 11V9.5"/>',
    js: '<rect x="3" y="3" width="18" height="18" rx="3"/><text x="12" y="16.5" text-anchor="middle" font-size="9">JS</text>',
    ts: '<rect x="3" y="3" width="18" height="18" rx="3"/><text x="12" y="16.5" text-anchor="middle" font-size="9">TS</text>',
    html: '<path d="M4 3l1.5 17L12 22l6.5-2L20 3z"/><path d="M8 8h8l-.5 6-3.5 1.5L8.5 14"/>',
    firebase: '<path d="M5 18L7.5 4l3 5.5L12.5 6 19 18l-7 3.5z"/><path d="M5 18l7-6 7 6"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }
  $$('[data-icon]').forEach(function (el) { el.innerHTML = icon(el.dataset.icon); });

  /* ---------- Capacidades: carrusel infinito (auto-desplazamiento + arrastre + flechas) ---------- */
  (function () {
    var mq = $('#marquee'); if (!mq) return;
    var track = $('.track', mq), prev = $('.cap-prev'), next = $('.cap-next');
    var original = track.innerHTML;
    var SPEED = 38, RESUME = 2600;            /* px/s y espera (ms) para retomar tras arrastrar o usar flechas */
    var W0 = 0, step = 0, x = 0, vel = 0, factor = reduce ? 0 : 1;
    var hover = false, dragging = false, resumeAt = 0, tween = null, visible = true, last = 0, lastX = 0, lastT = 0, lastW = 0;

    function build() {
      var frac = W0 ? x / W0 : 0;
      track.innerHTML = original;
      var cards = $$('.cap', track), n = cards.length, guard = 0;
      function addSet() { cards.forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); track.appendChild(k); }); }
      addSet();
      W0 = $$('.cap', track)[n].offsetLeft - cards[0].offsetLeft;       /* ancho de un juego completo de tarjetas */
      step = cards[1].offsetLeft - cards[0].offsetLeft;                 /* avance de una tarjeta */
      while (track.offsetWidth < mq.clientWidth + W0 + 4 && guard++ < 6) addSet();
      x = frac * W0; lastW = mq.clientWidth; draw();
    }
    function draw() { track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)'; }
    function kbFocus() { try { return mq.matches(':focus-visible'); } catch (e) { return false; } }

    function frame(t) {
      var dt = Math.min((t - last) || 16, 50) / 1000; last = t;
      if (visible && W0) {
        var paused = hover || dragging || t < resumeAt || kbFocus() || reduce, want = paused ? 0 : 1;
        factor += (want - factor) * Math.min(1, dt * (want ? 2.2 : 12));    /* frena al instante, retoma con suavidad */
        if (Math.abs(want - factor) < .002) factor = want;
        if (tween) {
          var p = Math.min((t - tween.t0) / tween.d, 1);
          x = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - p, 3)); if (p >= 1) tween = null;
        } else if (!dragging && Math.abs(vel) > 8) { x += vel * dt; vel *= Math.pow(.04, dt); }
        else if (!dragging) vel = 0;
        x += SPEED * factor * dt;
        var k = Math.floor(x / W0);                                            /* bucle infinito */
        if (k) { x -= k * W0; if (tween) { tween.from -= k * W0; tween.to -= k * W0; } }
        draw();
      }
      requestAnimationFrame(frame);
    }

    /* Arrastrar: ratón y dedo */
    mq.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; tween = null; vel = 0; lastX = e.clientX; lastT = e.timeStamp; mq.classList.add('is-drag');
      try { mq.setPointerCapture(e.pointerId); } catch (err) {}
    });
    mq.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dts = (e.timeStamp - lastT) / 1000; x -= dx;
      if (dts > 0) vel = Math.max(-3000, Math.min(3000, vel * .6 + (-dx / dts) * .4));
      lastX = e.clientX; lastT = e.timeStamp;
    });
    function endDrag(e) {
      if (!dragging) return; dragging = false; mq.classList.remove('is-drag');
      if (e.timeStamp - lastT > 80) vel = 0;
      resumeAt = performance.now() + RESUME;
    }
    mq.addEventListener('pointerup', endDrag); mq.addEventListener('pointercancel', endDrag);
    mq.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* Pausa al pasar el cursor */
    mq.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    mq.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; resumeAt = performance.now() + 500; } });

    /* Flechas y teclado: avanzan o retroceden tarjeta por tarjeta */
    function go(dir) {
      var now = performance.now(), to = (tween ? tween.to : x) + dir * step;
      tween = { from: x, to: to, t0: now, d: reduce ? 1 : 520 }; vel = 0; resumeAt = now + RESUME;
    }
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    mq.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '120px' }).observe(mq);
    var rt = null;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (mq.clientWidth !== lastW) build(); }, 200); });
    build(); requestAnimationFrame(frame);
  })();

  /* ---------- Tecnologías que uso ---------- */
  var TECH = [
    { n: 'Java', d: 'POO y estructuras de datos.', i: 'java' }, { n: 'SQL', d: 'Modelado y consultas relacionales.', i: 'sql' },
    { n: 'Python', d: 'Scripting y lógica de datos.', i: 'python' }, { n: 'JavaScript', d: 'Interfaces web con vida.', i: 'js' },
    { n: 'TypeScript', d: 'JavaScript con tipos y orden.', i: 'ts' }, { n: 'HTML5 / CSS', d: 'Estructura y diseño responsive.', i: 'html' },
    { n: 'LaTeX', d: 'Documentación técnica y ponencias.', i: 'latex' }, { n: 'Firebase', d: 'Base de datos y despliegue web.', i: 'firebase' }
  ];
  $('#tech').innerHTML = TECH.map(function (t) { return '<li class="rv"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC[t.i] + '</svg><h3>' + t.n + '</h3><p>' + t.d + '</p></li>'; }).join('');

  /* ---------- Visuales de respaldo (línea fina, sin degradados) ---------- */
  var HEX = '50,6 88,28 88,72 50,94 12,72 12,28';
  function svg(vb, body, fit) { return '<svg viewBox="' + vb + '" preserveAspectRatio="xMidYMid ' + (fit || 'slice') + '" aria-hidden="true">' + body + '</svg>'; }
  function panel(name) {
    return svg('0 0 400 250', '<rect width="400" height="250" fill="#EAEAE6"/><polygon points="200,36 248,64 248,120 200,148 152,120 152,64" fill="none" stroke="#334155" stroke-width="1.5" opacity=".45"/><text x="200" y="188" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-weight="600" font-size="20" fill="#111">' + name + '</text><text x="200" y="212" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="12" fill="#555b66">Agrega la imagen en ./assets/</text>');
  }
  var V = {
    mark: svg('0 0 100 100', '<polygon points="' + HEX + '" fill="#111"/><text x="50" y="62" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="32" fill="#F4F4F2">AL</text>', 'meet'),
    sign: svg('0 0 400 100', '<path d="M10 72C60-12 95 105 145 42S225 18 255 52s70 12 135-26" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>', 'meet'),
    troya: panel('TROYA'), greenhouse: panel('Green House Inmobiliaria'), semilleros: panel('Investigación &amp; Semilleros UDES')
  };
  function renderFallback(slot) {
    var k = slot.dataset.visual; if (!k) return; if (!V[k]) { slot.style.display = 'none'; return; }
    slot.classList.add('is-fallback');
    var im = $('img', slot); if (im) im.remove(); $$('.vis', slot).forEach(function (n) { n.style.display = 'none'; }); if (k === 'greenhouse') V[k] = V[k];
    slot.insertAdjacentHTML('afterbegin', V[k]);
  }

  /* ---------- Detección de imágenes locales (./assets/...) ---------- */
  var EXT = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
  function candidates(img) {
    var b = img.dataset.base, names = [b].concat((img.dataset.alt || '').split(',').map(function (n) { return n.trim(); }).filter(Boolean)), out = [], first = img.getAttribute('src');
    names.forEach(function (n) { EXT.forEach(function (e) { ['./assets/', './'].forEach(function (d) { var u = d + n + '.' + e; if (u !== first && out.indexOf(u) < 0) out.push(u); }); var u0 = null; }); });
    return out;
  }
  function recover(img) {
    var slot = img.closest('.vis'); if (!slot || img.dataset.tried) return; img.dataset.tried = '1';
    var list = candidates(img), i = 0;
    (function next() {
      if (i >= list.length) return renderFallback(slot);
      var t = new Image(), u = list[i++]; t.onload = function () { img.src = u; }; t.onerror = next; t.src = u;
    })();
  }
  $$('.vis img[data-base]').forEach(function (img) {
    img.addEventListener('error', function () { recover(img); });
    if (img.complete && img.naturalWidth === 0) recover(img);
  });

  /* ---------- Titular en palabras (entrada orquestada) ---------- */
  $$('[data-split]').forEach(function (h) {
    h.setAttribute('aria-label', h.textContent);
    h.innerHTML = h.textContent.trim().split(/\s+/).map(function (w, n) { return '<span class="w" aria-hidden="true"><i' + (n >= 5 ? ' class="acc"' : '') + ' style="--n:' + n + '">' + w + '</i></span>'; }).join(' ');
  });
  requestAnimationFrame(function () { setTimeout(function () { document.body.classList.add('ready'); }, 80); });

  /* ---------- Navegación ---------- */
  var nav = $('#nav'), btn = $('.menu-btn'), menu = $('#menu'), ind = $('.ind', menu), links = $$('a', menu);
  btn.addEventListener('click', function () { btn.setAttribute('aria-expanded', String(menu.classList.toggle('is-open'))); });
  menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') { menu.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { menu.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  function moveInd(a) { if (!a) { menu.style.removeProperty('--iw'); return; } menu.style.setProperty('--iw', a.offsetWidth + 'px'); menu.style.setProperty('--ix', a.offsetLeft + 'px'); }
  var activeLink = null;
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { activeLink = null; links.forEach(function (a) { var on = a.getAttribute('href') === '#' + en.target.id; a.classList.toggle('is-active', on); if (on) activeLink = a; }); moveInd(activeLink); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) spy.observe(t); });
  }
  window.addEventListener('resize', function () { moveInd(activeLink); });

  /* ---------- Revelados al hacer scroll + contadores ---------- */
  function countUp(el) {
    var n = +el.dataset.count, t0 = null;
    (function step(t) { t0 = t0 || t; var p = Math.min((t - t0) / 1100, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
  }
  if ('IntersectionObserver' in window) {
    var rv = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (!en.isIntersecting) return; en.target.classList.add('is-in'); rv.unobserve(en.target); if (!reduce) $$('[data-count]', en.target).forEach(countUp); });
    }, { threshold: 0.12 });
    $$('.rv').forEach(function (el) {
      var sibs = $$('.rv', el.parentNode).filter(function (s) { return s.parentNode === el.parentNode; });
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 110 + 'ms'); rv.observe(el);
    });
  } else { $$('.rv').forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- Fondo vivo: parallax, brillo que sigue al cursor, barra de progreso ---------- */
  var bar = $('#bar'), gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy, ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty('--sy', y); bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      nav.classList.toggle('is-stuck', y > 24); ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (fine && !reduce) {
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function glow() { gx += (tx - gx) * .06; gy += (ty - gy) * .06; root.style.setProperty('--gx', gx.toFixed(1) + 'px'); root.style.setProperty('--gy', gy.toFixed(1) + 'px'); requestAnimationFrame(glow); })();
    /* Monograma con parallax */
    var hv = $('#heroVisual'), stage = $('.mark-stage');
    hv.addEventListener('pointermove', function (e) { var r = hv.getBoundingClientRect(); stage.style.transform = 'translate(' + ((e.clientX - r.left) / r.width - .5) * 26 + 'px,' + ((e.clientY - r.top) / r.height - .5) * 26 + 'px) rotate(' + ((e.clientX - r.left) / r.width - .5) * 6 + 'deg)'; });
    hv.addEventListener('pointerleave', function () { stage.style.transform = ''; });
    /* Botones magnéticos */
    $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left) / r.width - .5) * 10 + 'px,' + ((e.clientY - r.top) / r.height - .5) * 8 + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
  /* Foco de luz en tarjetas */
  function spot(e) { var r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', (e.clientX - r.left) + 'px'); e.currentTarget.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
  $$('.hob,.tech li').forEach(function (el) { el.addEventListener('pointermove', spot); });

  /* ---------- Proyectos: detalle y filtro ---------- */
  var cases = $$('.case'), wrapC = $('#cases'), fts = $$('.ft'), find = $('.find');
  $$('.case .toggle').forEach(function (t) {
    t.addEventListener('click', function () { setOpen(t.closest('.case'), !t.closest('.case').classList.contains('is-open')); });
  });
  function setOpen(c, open) { c.classList.toggle('is-open', open); var t = $('.toggle', c); t.setAttribute('aria-expanded', String(open)); $('span', t).textContent = open ? 'Ocultar estructura' : 'Ver estructura'; }
  function moveFind(b) { find.style.setProperty('--fw', b.offsetWidth + 'px'); find.style.setProperty('--fx', b.offsetLeft + 'px'); }
  fts.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.filter, shown = [];
      fts.forEach(function (x) { x.classList.toggle('is-active', x === b); }); moveFind(b);
      cases.forEach(function (c) {
        var show = f === 'all' || (c.dataset.cat || '').split(' ').indexOf(f) > -1;
        c.classList.toggle('is-hidden', !show);
        if (show) { c.classList.add('is-in'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); shown.push(c); }
      });
      if (shown.length === 1) setOpen(shown[0], true);
    });
  });
  moveFind($('.ft.is-active')); window.addEventListener('resize', function () { moveFind($('.ft.is-active')); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { moveFind($('.ft.is-active')); moveInd(activeLink); });

})();
