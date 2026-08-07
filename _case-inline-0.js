
(function(){
'use strict';
var D = window.SophiclyAuthorFiles;
var main = document.getElementById('main');

/* Ported verbatim from their DOM. The tab shoulder: viewBox 0 0 62 44, preserveAspectRatio="none"
   so it stretches to 3.25rem. Most of the path lies off-viewBox to the left — only the shoulder
   shows. Do not "tidy" the coordinates. */
var TAG_PATH = 'M1.1449 -2.54901e-05L-521.145 -2.66006e-06C-531.065 -2.22644e-06 -540.343 4.90374 -545.932 13.0999L-558.55 31.6066C-563.837 39.3607 -572.615 44 -582 44L62 44C52.6151 44 43.8369 39.3607 38.5499 31.6066L25.9318 13.0999C20.3434 4.90373 11.0649 -2.59237e-05 1.1449 -2.54901e-05Z';
var CLIP_PATH = 'M2.05513 5.28193C4.21232 2.09502 7.8614 0.000174314 11.9995 3.55316e-05C18.6269 3.55316e-05 23.9995 5.37279 23.9996 12.0001L24.0003 95.0002C24.0003 101.628 18.6275 107 12.0002 107C5.37279 107 0.00010339 101.628 0.00010339 95.0002L0.00010339 42.905H1.99989L1.99989 95.0002C1.99989 100.523 6.47735 105.001 12.0002 105.001C17.5229 105 22.0005 100.523 22.0005 95.0002L21.9998 12.0001C21.9997 6.47745 17.5229 2.00066 12.0002 2.00051C8.34976 2.00051 5.15651 3.95666 3.41065 6.87775L2.05513 5.28193Z';

function tagSVG(cls){
  return '<svg class="tag__side ' + cls + '" viewBox="0 0 62 44" preserveAspectRatio="none" ' +
         'xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' + TAG_PATH + '" fill="currentColor"/></svg>';
}

function param(n){
  var m = new RegExp('[?&]' + n + '=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1]) : null;
}
function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

/* ══ SCRAPBOOK LAYOUT ════════════════════════════════════════════════════════════════════════
   Their desktop items are `position:absolute; left:var(--x); top:var(--y)`, and Vue writes those
   two variables per item from authored data (declared deviation 1: ours are derived).

   ⚠️ AND THE CONSEQUENCE THAT BITES: absolutely-positioned children contribute NOTHING to their
   parent's height, so the section collapses to 0 and the notes spill out of the folder. Theirs is
   held open by the authored page layout; ours has to measure and set it. Height is therefore
   computed AFTER placement, from the real boxes — never guessed from a note count. */
function layoutScrapbook(){
  var root = document.querySelector('.scrapbook');
  if (!root) return;
  var items = [].slice.call(root.querySelectorAll('.scrapbook-item'));
  if (!items.length){ root.style.height = ''; return; }

  /* ≤1024 is their stacked-column mode: the absolute positioning simply stops applying, so any
     height or offset we set here must be cleared or it leaks into the mobile layout. */
  if (!window.matchMedia('(min-width:1025px)').matches){
    root.style.height = '';
    items.forEach(function(it){ it.style.removeProperty('--x'); it.style.removeProperty('--y'); });
    return;
  }

  var W = root.clientWidth || root.parentNode.clientWidth || 0;
  var y = 0, bottom = 0, col = 0;
  items.forEach(function(it, i){
    var w = it.offsetWidth, h = it.offsetHeight;
    var isRuler = it.classList.contains('scrapbook-item--ruler');
    /* Alternate sides so a run of notes reads as a collage rather than a column, with a
       deterministic jitter — the same author lays out identically every load, which is what makes
       a rig frame comparable between runs. */
    var jitter = (((i * 37) % 11) - 5) * 6;
    var x = isRuler ? Math.max(0, W - w - 8)
                    : (col ? Math.max(0, W - w - 24 + jitter) : Math.max(0, 24 + jitter));
    var top = isRuler ? Math.max(0, y - 380) : y;
    it.style.setProperty('--x', Math.round(x) + 'px');
    it.style.setProperty('--y', Math.round(top) + 'px');
    if (!isRuler){                       /* the ruler is decorative and must not extend the page */
      y += h + 34;                       /* one container gutter between notes */
      bottom = Math.max(bottom, top + h);
      col = col ? 0 : 1;
    }
  });
  root.style.height = Math.ceil(bottom) + 'px';
}

/* ══ DRAG ════════════════════════════════════════════════════════════════════════════════════
   Their CSS encodes the model and it is easy to miss: `.draggable:has(.content-note){cursor:grab}`
   — a NOTE is draggable, everything else is merely clickable. The drag JS itself lives in their
   Vue bundle, so this is our implementation of their stated behaviour, not a port of their code.

   Pointer Events, not mouse+touch: one code path covers mouse, trackpad, pen and touch, and
   `setPointerCapture` keeps the note following even when the pointer leaves it — the classic
   "drag breaks if you move fast" bug, engineered out rather than discovered.
   ⚠️ It moves --x/--y on the ITEM, never a transform: the note's own `rotate(var(--rot))` lives on
   `.content-note`, and writing a transform here would silently flatten that rotation. */
function wireScrapbookDrag(){
  var root = document.querySelector('.scrapbook');
  if (!root) return;
  var dragging = null;

  root.addEventListener('pointerdown', function(e){
    var handle = e.target.closest && e.target.closest('.draggable');
    if (!handle || !handle.querySelector('.content-note')) return;   /* notes only — theirs */
    var item = handle.closest('.scrapbook-item');
    if (!item) return;
    if (!window.matchMedia('(min-width:1025px)').matches) return;    /* stacked mode: no dragging */
    dragging = {
      item: item, id: e.pointerId,
      x0: e.clientX, y0: e.clientY,
      ox: parseFloat(item.style.getPropertyValue('--x')) || 0,
      oy: parseFloat(item.style.getPropertyValue('--y')) || 0
    };
    handle.setPointerCapture(e.pointerId);
    handle.classList.add('is-dragging');
    e.preventDefault();
  });

  root.addEventListener('pointermove', function(e){
    if (!dragging || e.pointerId !== dragging.id) return;
    dragging.item.style.setProperty('--x', Math.round(dragging.ox + (e.clientX - dragging.x0)) + 'px');
    dragging.item.style.setProperty('--y', Math.round(dragging.oy + (e.clientY - dragging.y0)) + 'px');
  });

  /* One release path for every way a drag can end — up, cancel, or the pointer being taken away.
     Missing `pointercancel` is how a note gets stuck to the cursor after a browser gesture. */
  function end(e){
    if (!dragging || (e && e.pointerId !== dragging.id)) return;
    var h = dragging.item.querySelector('.draggable');
    if (h) h.classList.remove('is-dragging');
    dragging = null;
  }
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  /* Keyboard equivalent. A drag that only works with a pointer is not operable, and the notes are
     already focusable — so the arrows have to do something or the focus ring is a lie. */
  root.addEventListener('keydown', function(e){
    var handle = e.target.closest && e.target.closest('.draggable');
    if (!handle || !handle.querySelector('.content-note')) return;
    var d = { ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1] }[e.key];
    if (!d) return;
    var item = handle.closest('.scrapbook-item');
    var step = e.shiftKey ? 40 : 8;
    item.style.setProperty('--x', Math.round((parseFloat(item.style.getPropertyValue('--x')) || 0) + d[0] * step) + 'px');
    item.style.setProperty('--y', Math.round((parseFloat(item.style.getPropertyValue('--y')) || 0) + d[1] * step) + 'px');
    e.preventDefault();
  });
}

var author = D.bySlug(param('author') || '');

/* Fail loud and give a way forward, never a blank page. */
if (!author){
  document.title = 'File not found — The Author Files';
  main.innerHTML = '<p class="missing">No file for that author.<br><a href="' +
    esc(D.INDEX_PAGE) + '">Back to the cabinet</a></p>';
  window.__caseStats = { found:false };
} else {
  var group = D.groupOf(author);
  var sibs  = D.byGroup(author.g);
  document.title = author.name + ' — The Author Files';

  /* PORTRAIT. `portraitOf` returns null for the three writers with no free-licensed photograph —
     that branch draws a designed empty slot, never a broken image and never a substitute face.
     A CC licence REQUIRES the credit line to be visible, so it is rendered, not tucked away. */
  var pt = D.portraitOf(author);
  var clipSVG = '<span class="portrait__clip"><svg viewBox="0 0 24 107" fill="none" ' +
    'xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' + CLIP_PATH + '" fill="currentColor"/></svg></span>';
  var portraitHTML;
  if (pt){
    portraitHTML =
      '<div class="portrait">' +
        '<img class="portrait__img" src="' + esc(pt.src) + '" alt="Portrait of ' + esc(author.name) + '">' +
        clipSVG +
      '</div>' +
      '<p class="portrait__credit">' + esc(pt.by) + ' · ' + esc(pt.lic) + '</p>';
  } else {
    portraitHTML =
      '<div class="portrait portrait--none">' +
        '<span class="portrait__initials">' + esc(D.initials(author.name)) + '</span>' +
        clipSVG +
      '</div>' +
      '<p class="portrait__note">No photograph on file</p>';
  }

  var body = author.context
    ? '<p>' + esc(author.context) + '</p>'
    : '<p class="gap-note">Context note not yet written. It comes from this text’s own Contextual ' +
      'Framework in the Model Answers — not from general knowledge.</p>';

  /* ══ THE SCRAPBOOK ═══════════════════════════════════════════════════════════════════════════
     One paper note per contextual idea, plus their ruler as the decorative item. The notes come
     from `author.notes`, which is condensed from that text's Contextual Framework — §5c, same rule
     as the body copy: nothing here is authored from general knowledge.

     ⚠️ WHEN THERE ARE NO NOTES THE SECTION STATES WHY AND STOPS. It never renders an empty
     collage, and it never borrows another author's material to look full. */
  var notes = (author.notes || []);
  var scrapbookHTML;
  if (!notes.length){
    scrapbookHTML =
      '<section class="scrapbook scrapbook--empty" aria-label="Context notes">' +
        '<p class="scrapbook__gap">No context notes yet. They are written from this text’s own ' +
        'Contextual Framework in the Model Answers, and ' + esc(author.name) + '’s texts do not ' +
        'have one written yet.</p>' +
      '</section>';
  } else {
    /* Their six size steps, cycled so a run of notes does not read as a list of identical cards. */
    var SIZES = ['--size-s', '--size-xs', '--size-m', '--size-xs', '--size-s', '--size-l'];
    scrapbookHTML =
      '<p class="scrapbook__hint">Context — drag the notes around</p>' +
      '<section class="scrapbook" aria-label="Context notes">' +
        notes.map(function(n, i){
          /* Deterministic, not random: the same author always lays out the same way, so a frame
             from the rig is comparable run to run (and Math.random() would make the gate flaky). */
          var rot  = (((i * 37) % 9) - 4) * 0.55;                 /* ≈ −2.2° … +2.2° */
          var torn = (i % 3 === 1);                                /* not every note — see CSS */
          return '<div class="scrapbook-item" data-i="' + i + '">' +
            '<div class="scrapbook-item__inner">' +
              '<div class="draggable" tabindex="0" role="group" ' +
                   'aria-label="Context note: ' + esc(n.t) + '. Drag, or move with the arrow keys.">' +
                '<div class="content-note-wrapper">' +
                  '<article class="content-note ' + SIZES[i % SIZES.length] + ' ' +
                           (torn ? '--torn ' : '') + '--marks-' + (i % 2) + '" ' +
                           'style="--rot:' + rot.toFixed(2) + 'deg">' +
                    '<h2 class="content-note__title">' + esc(n.t) + '</h2>' +
                    '<p class="content-note__desc">' + esc(n.d) + '</p>' +
                    '<span class="note-marks" aria-hidden="true"></span>' +
                  '</article>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('') +
        /* Their ruler — decorative, pointer-transparent, and lifted out of the layout by that
           −100rem margin. Ours is drawn, not an image. */
        '<div class="scrapbook-item scrapbook-item--ruler" data-i="ruler">' +
          '<div class="scrapbook-item__inner">' +
            '<div class="decorative content-ruler" aria-hidden="true">' +
              '<svg class="content-ruler__image" viewBox="0 0 160 620" fill="none" ' +
                   'xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="0" y="0" width="160" height="620" rx="4" fill="#d9c48a"/>' +
                '<rect x="0" y="0" width="160" height="620" rx="4" fill="none" ' +
                      'stroke="#00000022" stroke-width="2"/>' +
                (function(){
                  var t = '';
                  for (var m = 0; m <= 30; m++){
                    var y = 12 + m * 19.8, long = (m % 5 === 0);
                    t += '<rect x="0" y="' + y.toFixed(1) + '" width="' + (long ? 44 : 26) +
                         '" height="2" fill="#6b5a2a"/>';
                    if (long) t += '<text x="54" y="' + (y + 7).toFixed(1) +
                      '" font-family="IBM Plex Mono, monospace" font-size="15" fill="#6b5a2a">' +
                      (m / 5 | 0) + '</text>';
                  }
                  return t;
                })() +
              '</svg>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  }

  main.innerHTML =
    '<h1 class="case__name">' + esc(author.name) + '</h1>' +
    '<div class="folder" style="--case-color:' + esc(group.colour) + '">' +
      '<nav class="sibs" aria-label="Other files in ' + esc(group.label) + '">' +
        sibs.map(function(s){
          return '<a class="sib" style="--tab:' + esc(group.colour) + '" href="' + esc(D.href(s)) + '"' +
                 (s.slug === author.slug ? ' aria-current="page"' : '') + '>' +
                 '<span class="tag">' + tagSVG('tag__start') +
                   '<span class="tag__middle"><span>' + esc(s.name) + '</span></span>' +
                   tagSVG('tag__end') +
                 '</span></a>';
        }).join('') +
      '</nav>' +
      '<div class="folder__inner">' +
        '<article class="sheet">' +
          '<span class="sheet__grain"></span>' +
          '<span class="sheet__clip"><span></span><span></span><span></span></span>' +
          '<div class="sheet__inner">' +
            '<div class="sheet__left">' +
              portraitHTML +
              '<p class="meta"><b>Born</b>' + esc(author.born) + '</p>' +
              '<p class="meta"><b>Died</b>' + esc(author.died || 'Living') + '</p>' +
            '</div>' +
            '<div class="sheet__right">' +
              '<p class="kicker">' + esc(group.label) + '</p>' +
              '<div class="body">' + body + '</div>' +
              '<section class="texts"><h2>Texts we teach</h2><ul>' +
                author.texts.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') +
              '</ul></section>' +
            '</div>' +
          '</div>' +
        '</article>' +
        scrapbookHTML +
      '</div>' +
    '</div>' +
    '<a class="back" href="' + esc(D.INDEX_PAGE) + '">← All files</a>';

  layoutScrapbook();
  wireScrapbookDrag();
  window.addEventListener('resize', layoutScrapbook);
  /* ⚠️ The first layout runs before the webfonts land, and a note's HEIGHT is set by its text —
     so every measurement above is provisional until Playfair and Plex Mono are actually in use.
     Re-run once they are, or the collage overlaps by roughly the difference between the fallback
     and the real face. Guarded: `document.fonts` is absent in some older engines. */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutScrapbook);

  /* The folder must be tall enough to hold the whole rail, and the rail's length varies by group
     (Shakespeare has 1 tab, Modern Prose has 8).
     ⚠️ `rail.offsetWidth` is NOT the answer and a constant buffer only hides it: the tags carry
     `margin-left:-.2rem; margin-right:-.75rem` (the overlap that makes them read as a stack), so
     the flex row's own box is ~15px per tab SHORTER than the run it actually paints. Measured on
     Modern Prose: offsetWidth 1094, real painted extent ~1220. So the height is taken from where
     the LAST tab actually ends. Post-transform rects are correct HERE — the visible extent is
     precisely what we are sizing to — which is the opposite of the WD-065 case, where the question
     was "how big is this element?" and `offsetWidth` was right.
     No feedback loop: the tabs are positioned from the folder's TOP, so growing it cannot move them. */
  (function syncFolderToRail(){
    var folder = document.querySelector('.folder');
    var rail = document.querySelector('.sibs');
    if (!folder || !rail) return;
    var apply = function(){
      folder.style.minHeight = '';
      if (getComputedStyle(rail).display === 'none') return;
      var tabs = rail.querySelectorAll('.sib');
      if (!tabs.length) return;
      var last = tabs[tabs.length - 1].getBoundingClientRect();
      var need = last.bottom - folder.getBoundingClientRect().top + 34;   /* + one container gutter */
      if (need > folder.offsetHeight) folder.style.minHeight = Math.ceil(need) + 'px';
    };
    apply();
    window.addEventListener('resize', apply);
  })();

  window.__caseStats = {
    found:true, slug:author.slug, name:author.name, group:group.id,
    siblings:sibs.length, texts:author.texts.length,
    hasContext:!!author.context, images:document.querySelectorAll('img').length,
    /* Scrapbook, for GATE S. Reported as MEASURED facts, not as "the section exists" — a present
       but zero-height collage is exactly the shape of defect this port has shipped before. */
    notes:(author.notes || []).length,
    noteEls:document.querySelectorAll('.content-note').length,
    scrapbookH:(function(){ var s=document.querySelector('.scrapbook'); return s ? Math.round(s.getBoundingClientRect().height) : 0; })(),
    draggables:document.querySelectorAll('.draggable').length,
    pageH:Math.round(document.documentElement.scrollHeight),
    currentMarked:document.querySelectorAll('.sib[aria-current="page"]').length,
    sibsRotated:(function(){
      var el=document.querySelector('.sibs');
      return el ? getComputedStyle(el).transform : null;
    })()
  };
}
})();
