(function () {

    /* Mobile menu */
    var menuBtn = document.getElementById('menu-btn');
    var menu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
      menu.classList.toggle('open', !open);
      document.body.classList.toggle('menu-open', !open);
      if (!open) closeSheet();
    });
    menu.querySelectorAll('.mm-toggle').forEach(function (t) {
      t.addEventListener('click', function () {
        var open = t.getAttribute('aria-expanded') === 'true';
        t.setAttribute('aria-expanded', String(!open));
        document.getElementById(t.getAttribute('aria-controls')).hidden = open;
      });
    });

    /* Call sheet */
    var callBtn = document.getElementById('call-btn');
    var sheet = document.getElementById('call-sheet');
    var backdrop = document.getElementById('sheet-backdrop');
    function openSheet() {
      sheet.hidden = false; backdrop.hidden = false;
      requestAnimationFrame(function () { sheet.classList.add('open'); backdrop.classList.add('open'); });
    }
    function closeSheet() {
      sheet.classList.remove('open'); backdrop.classList.remove('open');
      setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; }, 200);
    }
    callBtn.addEventListener('click', function () { sheet.hidden ? openSheet() : closeSheet(); });
    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

    /* Parent voices carousel */
    var track = document.getElementById('voice-track');
    if (track) {
      var slides = track.querySelectorAll('.voice-slide');
      var dotsBox = document.getElementById('voice-dots');
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.type = 'button';
        d.addEventListener('click', function () { go(i); });
        dotsBox.appendChild(d);
      });
      var dots = dotsBox.querySelectorAll('button');
      function current() { return Math.round(track.scrollLeft / track.clientWidth); }
      function paint() { var c = current(); dots.forEach(function (d, i) { d.setAttribute('aria-current', String(i === c)); }); }
      function go(i) {
        i = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: i * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      document.getElementById('voice-prev').addEventListener('click', function () { go(current() - 1); });
      document.getElementById('voice-next').addEventListener('click', function () { go(current() + 1); });
      var vt;
      track.addEventListener('scroll', function () { clearTimeout(vt); vt = setTimeout(paint, 80); }, { passive: true });
      paint();
    }


    /* Footprints in wet sand: a print presses in when the walk reaches it, holds for a while,
       then is slowly washed away (fading, softening and spreading) as the walk moves on.
       Fully tied to the scroll, so scrolling back brings the prints back. */
    var washPrint = function (p, since, maxOp) {
      var inF = Math.max(0, Math.min(1, since / 6));                  /* quick press-in */
      var wash = Math.max(0, Math.min(1, (since - 22) / 40));         /* long, slow wash-out */
      var op = maxOp * inF * (1 - wash);
      p.style.opacity = op.toFixed(3);
      p.style.filter = 'blur(' + (0.3 + wash * 2).toFixed(2) + 'px)';   /* always slightly soft, like a shadow in sand */
      p.style.transform = 'translate(' + (wash * 4).toFixed(1) + 'px,' + ((1 - inF) * 6).toFixed(1) + 'px) scale(' + (0.94 + 0.06 * inF + 0.08 * wash).toFixed(3) + ')';
    };
    /* Desktop baby steps: the child walks from step 1 to step 3 as the parent scrolls.
       Each print appears when the scroll reaches it and stays; scrolling back above it hides it again. */
    var trail = document.querySelector('.steps-trail');
    if (trail) {
      var tprints = trail.querySelectorAll('svg');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        tprints.forEach(function (p) { p.classList.add('seen'); });
      } else {
        var tTick = false;
        var tWalk = function () {
          tTick = false;
          var r = trail.parentElement.getBoundingClientRect();
          var vh = window.innerHeight || 1;
          /* 0 when the steps enter at 90% of the viewport, 100 when they reach 30% */
          var progress = (vh * 0.9 - r.top) / (vh * 0.6) * 100;
          tprints.forEach(function (p) {
            var at = parseFloat(p.style.left);
            washPrint(p, progress - at, .5);
          });
        };
        var tScroll = function () { if (!tTick) { tTick = true; requestAnimationFrame(tWalk); } };
        window.addEventListener('scroll', tScroll, { passive: true });
        window.addEventListener('resize', tScroll);
        tWalk();
      }
    }

    /* Baby steps: the child walks down the section as the parent scrolls (mobile).
       Each print appears when the scroll reaches it and stays;
       scrolling back above it hides it again. */
    var stepsBg = document.querySelector('.baby-steps');
    var prints = document.querySelectorAll('.baby-steps svg');
    if (stepsBg && prints.length) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        prints.forEach(function (p) { p.classList.add('seen'); });
      } else {
        var sec = stepsBg.parentElement, ticking = false;
        var walk = function () {
          ticking = false;
          var r = sec.getBoundingClientRect();
          var vh = window.innerHeight || 1;
          var progress = (vh - r.top) / (r.height + vh * 0.25) * 100;
          prints.forEach(function (p) {
            var t = parseFloat(p.getAttribute('data-t'));
            washPrint(p, progress - (t + 8), .55);
          });
        };
        var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(walk); } };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        walk();
      }
    }

    /* Day section: video loads only on tap, behind the poster, per the brief */
    var dayPlay = document.getElementById('day-play');
    if (dayPlay) dayPlay.addEventListener('click', function () {
      var p = document.getElementById('day-player');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/R0XAL3NyN40?autoplay=1&playsinline=1&rel=0';
      f.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
      f.setAttribute('allowfullscreen', '');
      f.setAttribute('title', 'A day at Raintree, the campus film');
      p.appendChild(f);
      dayPlay.remove();
    });

  })();

  /* Hero campus walk: scrolling walks the visitor from the street into the Sathorn garden.
     106 stills cut from the Prestige Perspective film are drawn to a canvas; scroll position
     picks the frame. One rAF loop, frame-rate independent easing, and a crossfade between
     neighbouring frames so the motion stays continuous. Phones get a lighter portrait set.
     Reduced motion or data saver: no scrubbing, one still, the card stays as it was. */
  (function () {
    var hero = document.querySelector('.hero');
    var canvas = document.getElementById('hero-walk');
    if (!hero || !canvas || !canvas.getContext) return;
    var card = hero.querySelector('.hero-card');
    var content = hero.querySelector('.hero-content');
    var scrim = hero.querySelector('.hero-scrim');
    var endCtas = hero.querySelector('.hero-end');
    var cue = hero.querySelector('.hero-cue');
    var cueFill = cue && cue.querySelector('i');
    var header = document.querySelector('.site-header');
    var bar = document.querySelector('.mobile-bar');
    var ctx = canvas.getContext('2d', { alpha: false });

    var COUNT = 106, START_AT = 24, SMOOTH_MS = 90, STILL_FRAME = 46;
    var mobile = window.matchMedia('(max-width: 760px)').matches;
    var dir = '/assets/video/campus-walk/' + (mobile ? 'mobile' : 'desktop') + '/raintree-sathorn-campus-walk-';
    var url = function (i) { return dir + String(i + 1).padStart(4, '0') + '.webp'; };
    var conn = navigator.connection || {};
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || conn.saveData;

    var imgs = new Array(COUNT), cw = 0, ch = 0;
    function ok(i) { var im = imgs[i]; return !!(im && im.complete && im.naturalWidth); }
    function nearest(i) { for (var d = 0; d < COUNT; d++) { if (ok(i - d)) return i - d; if (ok(i + d)) return i + d; } return -1; }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cw = canvas.clientWidth; ch = canvas.clientHeight;
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function cover(im, alpha) {
      var s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
      ctx.globalAlpha = alpha; ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
    }
    function draw(f) {
      f = Math.max(0, Math.min(COUNT - 1, f));
      var i0 = Math.floor(f), frac = f - i0, base = ok(i0) ? i0 : nearest(i0);
      if (base < 0) return;
      cover(imgs[base], 1);
      if (base === i0 && frac > 0.01 && ok(i0 + 1)) cover(imgs[i0 + 1], frac);
      ctx.globalAlpha = 1;
    }

    if (still) {
      var im = new Image();
      im.onload = function () { imgs[STILL_FRAME] = im; resize(); draw(STILL_FRAME); canvas.classList.add('ready'); };
      im.src = url(STILL_FRAME);
      window.addEventListener('resize', function () { if (ok(STILL_FRAME)) { resize(); draw(STILL_FRAME); } });
      return;
    }

    document.documentElement.classList.add('walk-on');
    endCtas.removeAttribute('aria-hidden');
    function measure() {
      var root = document.documentElement.style;
      root.setProperty('--hdr', (header ? header.offsetHeight : 0) + 'px');
      root.setProperty('--bar', (bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0) + 'px');
    }
    measure();

    /* 0 when the card first pins under the header, 1 when it is about to scroll away */
    var padTop = 0, pinTop = 0;
    function readPin() {
      padTop = parseFloat(getComputedStyle(hero).paddingTop) || 0;
      pinTop = parseFloat(getComputedStyle(card).top) || 0;
    }
    function progress() {
      var total = hero.offsetHeight - padTop - card.offsetHeight;
      if (total <= 0) return 0;
      var scrolled = pinTop - (hero.getBoundingClientRect().top + padTop);
      return Math.max(0, Math.min(1, scrolled / total));
    }
    var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var endOn = false, lastP = -1;
    function ui(p) {
      if (Math.abs(p - lastP) < 0.0005) return;
      lastP = p;
      /* intro copy fades and lifts away over the first stretch of the walk, the scrim with it */
      var out = clamp01((p - 0.06) / 0.16);
      content.style.opacity = (1 - out).toFixed(3);
      content.style.transform = 'translate3d(0,' + (-24 * out).toFixed(1) + 'px,0)';
      content.style.visibility = out >= 1 ? 'hidden' : '';
      scrim.style.opacity = (1 - out * 0.85).toFixed(3);
      var on = p > 0.86;
      if (on !== endOn) {
        endOn = on; endCtas.classList.toggle('on', on);
        endCtas.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      }
      if (cueFill) cueFill.style.width = (clamp01(p / 0.86) * 100).toFixed(1) + '%';
      if (cue) cue.classList.toggle('off', on);
    }

    var started = false, current = 0, lastDrawn = -1, last = 0, running = false, visible = true;
    function loop(now) {
      if (!visible) { running = false; return; }
      var dt = Math.min(50, now - last); last = now;
      var p = progress(), target = p * (COUNT - 1);
      current += (target - current) * (1 - Math.exp(-dt / SMOOTH_MS));
      if (Math.abs(target - current) < 0.001) current = target;
      if (Math.abs(current - lastDrawn) > 0.002) { draw(current); lastDrawn = current; }
      ui(p);
      requestAnimationFrame(loop);
    }
    function run() { if (!running && started) { running = true; last = performance.now(); requestAnimationFrame(loop); } }
    function start() {
      if (started) return;
      started = true; resize();
      current = progress() * (COUNT - 1); draw(current); lastDrawn = current;
      canvas.classList.add('ready'); run();
    }
    readPin();
    ui(progress());

    /* load in order, six at a time; start once the first frames are in */
    var next = 0, inflight = 0, loaded = 0;
    function pump() {
      while (inflight < 6 && next < COUNT) {
        var n = next++, img = new Image();
        img.decoding = 'async'; inflight++;
        img.onload = img.onerror = function () { inflight--; loaded++; if (!started && loaded >= START_AT) start(); else lastDrawn = -1; pump(); };
        img.src = url(n); imgs[n] = img;
      }
    }
    pump();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) run(); }).observe(hero);
    }
    window.addEventListener('resize', function () { measure(); readPin(); if (started) { resize(); draw(current); } lastP = -1; ui(progress()); });
  })();

  /* Chalk underlines: draw each one in once, the first time it comes into view */
  (function () {
    var sel = '.approach-cta a, .day-link a, .vc-more, .adm-link, .ht-team, .fc-card .fc-link, .faq .answer a';
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    document.documentElement.classList.add('chalk-js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add('drawing');
        requestAnimationFrame(function () { el.classList.add('drawn'); });
        setTimeout(function () { el.classList.remove('drawing'); }, 1200);
      });
    }, { threshold: 1, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* Stage cards on mobile: dot navigation for the swipe carousel */
  (function () {
    var track = document.querySelector('.stage-cards');
    if (!track) return;
    var cards = track.querySelectorAll('.stage-card');
    var dots = document.createElement('div');
    dots.className = 'stage-dots';
    dots.setAttribute('aria-label', 'Choose a stage');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach(function (card, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (card.querySelector('h3') || {}).textContent || ('Stage ' + (i + 1)));
      b.addEventListener('click', function () {
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0), behavior: reduce ? 'auto' : 'smooth' });
      });
      dots.appendChild(b);
    });
    track.after(dots);
    var btns = dots.querySelectorAll('button');
    var mark = function () {
      var x = track.scrollLeft, best = 0, bestD = Infinity, pad = parseFloat(getComputedStyle(track).paddingLeft || 0);
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - track.offsetLeft - pad - x); if (d < bestD) { bestD = d; best = i; } });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = cards.length - 1;
      btns.forEach(function (b, i) { b.setAttribute('aria-current', i === best ? 'true' : 'false'); });
    };
    var tick = false;
    track.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; mark(); }); } }, { passive: true });
    window.addEventListener('resize', mark);
    mark();
  })();

  /* Approach pillars: card deck. Each card is slightly turned behind the one in front.
     Desktop and mobile alike: the deck is pinned and the front card lifts away as the parent
     scrolls down; scrolling back up brings the cards back. No taps, hints or dots. */
  (function () {
    var sec = document.querySelector('.approach');
    if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cards = sec.querySelectorAll('.pillar');
    if (cards.length < 2) return;
    sec.classList.add('deck');
    var inner = sec.querySelector('.approach-inner');
    var head = sec.querySelector('.approach-head');
    var stage = sec.querySelector('.pillars-stage');
    var mq = window.matchMedia('(max-width: 960px)');
    var N = cards.length - 1;
    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (x) { return x * x * (3 - 2 * x); };
    var vh = document.documentElement.clientHeight;
    var target = 0, current = 0, running = false, visible = false;

    /* Fanned deck, after the Indygo reference: cards waiting behind are visibly turned
       (alternating left and right, more the further back they are) and slightly smaller;
       the front card sits straight; when it leaves it swings up and away. */
    var FAN = [11, -10, 12, -11, 10];
    var draw = function (p) {
      for (var i = 0; i < cards.length; i++) {
        var d = i - p;                                   /* 0 = front, >0 waiting, <0 leaving */
        var x = 0, y = 0, rot, sc, op = 1;
        if (d >= 0) {
          var depth = Math.min(d, 3);
          rot = FAN[i % FAN.length] * Math.min(depth, 1) * (1 + 0.35 * Math.max(0, depth - 1));
          sc = 1 - 0.035 * depth;
          y = 2.2 * depth;
        } else {
          var leave = ease(clamp(-d));
          if (i === N) leave = 0;
          rot = -16 * leave; sc = 1; x = -10 * leave; y = -118 * leave;
          op = 1 - clamp((leave - .5) / .5);
        }
        cards[i].style.transform = 'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        cards[i].style.opacity = op.toFixed(3);
      }
    };
    var loop = function () {
      current += (target - current) * 0.42;
      if (Math.abs(target - current) < 0.0005) current = target;
      draw(current);
      if (current !== target) requestAnimationFrame(loop); else running = false;
    };
    var kick = function () { if (!running) { running = true; requestAnimationFrame(loop); } };

    /* the scroll position drives the deck */
    var measure = function () {
      var box = inner.getBoundingClientRect(), cs = getComputedStyle(inner);
      var pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
      if (mq.matches) {
        /* mobile: the heading scrolls away first, then the deck pins for one run of spacer */
        var run = Math.max(1, parseFloat(cs.getPropertyValue('--run-m')) / 100 * vh);
        var hs = getComputedStyle(head);
        var natural = box.top + pt + head.offsetHeight + parseFloat(hs.marginBottom);
        target = clamp((parseFloat(getComputedStyle(stage).top) - natural) / run) * N;
      } else {
        var runD = Math.max(1, box.height - pt - pb - stage.offsetHeight);
        target = clamp(-box.top / runD) * N;
      }
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) { measure(); kick(); }
      }).observe(inner);
    }
    window.addEventListener('scroll', function () { if (visible || inner.getBoundingClientRect().bottom < vh) { measure(); kick(); } }, { passive: true });
    window.addEventListener('resize', function () { vh = document.documentElement.clientHeight; measure(); kick(); });
    measure(); current = target; draw(current);
  })();

  /* Tour request: "A visit in three small steps". One Netlify form split into three steps;
     the tree grows with the child's age, footprints walk to the door as steps advance,
     and the thank-you uses the child's name. GA4: tour_booked / bangna_interest per campus. */
  (function () {
    var form = document.getElementById('tour-form');
    if (!form) return;
    var card = form.closest('.tj-card');
    var steps = form.querySelectorAll('.tj-step');
    var back = document.getElementById('tj-back'), next = document.getElementById('tj-next'), submit = document.getElementById('tf-submit');
    var err = document.getElementById('tf-error'), done = document.getElementById('tf-done'), status = document.getElementById('tj-status');
    var range = document.getElementById('tj-age'), out = document.getElementById('tj-age-out'), ageVal = document.getElementById('tj-age-val');
    var child = document.getElementById('tj-child');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = 0;
    card.classList.add('tj-js');
    window.dataLayer = window.dataLayer || [];

    /* tree grows from a seedling at 1 to a full canopy at 6 */
    var grow = function () {
      var a = +range.value, t = (a - 1) / 5;
      var label = a + (a === 1 ? ' year old' : ' years old');
      out.textContent = label; ageVal.value = label; range.setAttribute('aria-valuetext', label);
      card.style.setProperty('--grow', (0.38 + 0.62 * t).toFixed(3));
      card.style.setProperty('--trunk', (0.45 + 0.55 * t).toFixed(3));
      card.style.setProperty('--lift', (34 * (1 - t)).toFixed(1) + 'px');
    };
    range.addEventListener('input', grow); grow();

    var campusVal = function () { var c = form.querySelector('input[name="campus"]:checked'); return c ? c.value : ''; };
    var setSubmit = function () {
      var bn = campusVal() === 'Bang Na';
      submit.textContent = bn ? 'Register interest' : 'Book a School Tour';
      submit.classList.toggle('is-interest', bn);
    };
    form.querySelectorAll('input[name="campus"]').forEach(function (r) { r.addEventListener('change', function () { setSubmit(); form.querySelector('.tj-campuses').classList.remove('is-invalid'); err.hidden = true; }); });

    var show = function (i, focus) {
      cur = i;
      steps.forEach(function (s, k) { s.classList.toggle('is-current', k === i); });
      for (var k = 1; k <= 3; k++) {
        var stop = card.querySelector('.tj-stop-' + k); if (stop) stop.classList.toggle('on', k <= i + 1);
        var pr = card.querySelector('.tj-pair-' + k); if (pr) pr.classList.toggle('on', k <= i);
      }
      back.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      submit.hidden = i !== steps.length - 1;
      err.hidden = true;
      status.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      if (focus) steps[i].querySelector('.tj-q').focus({ preventScroll: true });
      if (focus) window.dataLayer.push({ event: 'tour_form_step', step: i + 1 });
    };

    var valid = function (i) {
      var s = steps[i], ok = true, first = null;
      s.querySelectorAll('.tj-input').forEach(function (f) {
        var good = f.checkValidity(); f.classList.toggle('is-invalid', !good);
        if (!good && !first) first = f; ok = ok && good;
      });
      if (i === 1 && !campusVal()) { ok = false; form.querySelector('.tj-campuses').classList.add('is-invalid'); first = first || form.querySelector('input[name="campus"]'); }
      if (!ok) {
        err.textContent = i === 0 ? "Please add your child's first name." : i === 1 ? 'Please choose a campus.' : 'Please add your name and a valid email address.';
        err.hidden = false; if (first) first.focus();
      }
      return ok;
    };
    form.addEventListener('input', function (e) { if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) e.target.classList.remove('is-invalid'); });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && cur < steps.length - 1) { e.preventDefault(); next.click(); }
    });
    next.addEventListener('click', function () { if (valid(cur)) show(cur + 1, true); });
    back.addEventListener('click', function () { show(cur - 1, true); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      for (var i = 0; i < steps.length; i++) { if (!valid(i)) { show(i, false); valid(i); return; } }
      submit.disabled = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); })
        .then(function () {
          var c = campusVal(), name = child.value.trim().split(/\s+/)[0];
          window.dataLayer.push({ event: c === 'Bang Na' ? 'bangna_interest' : 'tour_booked', campus: c, form_location: 'homepage_final' });
          document.getElementById('tj-done-title').textContent = c === 'Bang Na'
            ? 'Thank you. We will tell you about places for ' + name + ' at Bang Na first.'
            : "We can't wait to meet " + name + ' at ' + c + '.';
          card.querySelectorAll('.tj-stop, .tj-pair, .tj-door').forEach(function (el) { el.classList.add('on'); });
          form.hidden = true; done.hidden = false; done.focus();
        })
        .catch(function () {
          submit.disabled = false;
          err.textContent = 'Sorry, something went wrong sending your request. Please try again, or call the campus directly.';
          err.hidden = false;
        });
    });
    show(0, false);
  })();

  /* Typewriter placeholders on the tour form's name fields: example names type and erase
     so it is obvious the line is a field to write in. Stops on focus or once filled. */
  (function () {
    var fields = document.querySelectorAll('.tj-input[data-type]');
    if (!fields.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    fields.forEach(function (f) {
      var words = f.getAttribute('data-type').split(','), base = f.getAttribute('placeholder');
      var w = 0, i = 0, del = false, timer = null, caret = true;
      var visible = function () { var r = f.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; };
      var step = function () {
        if (document.activeElement === f || f.value) { f.setAttribute('placeholder', base); timer = null; return; }
        if (!visible()) { timer = setTimeout(step, 600); return; }
        var word = words[w];
        if (!del) { i++; if (i === word.length) { del = true; caret = true; f.setAttribute('placeholder', word + '|'); timer = setTimeout(step, 1600); return; } }
        else { i--; if (i === 0) { del = false; w = (w + 1) % words.length; f.setAttribute('placeholder', '|'); timer = setTimeout(step, 450); return; } }
        f.setAttribute('placeholder', word.slice(0, i) + '|');
        timer = setTimeout(step, del ? 55 : 110 + Math.random() * 60);
      };
      var start = function () { if (!timer && !f.value && document.activeElement !== f) { i = 0; del = false; timer = setTimeout(step, 500); } };
      f.addEventListener('focus', function () { clearTimeout(timer); timer = null; f.setAttribute('placeholder', base); });
      f.addEventListener('blur', start);
      start();
    });
  })();

  /* Tour buttons across the page lead to the tour form; a campus button preselects its campus */
  (function () {
    var card = document.querySelector('.tour-card');
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href="#book-a-tour"]');
      if (!a || !card) return;
      var c = a.getAttribute('data-campus');
      if (c) { var r = document.querySelector('input[name="campus"][value="' + c + '"]'); if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); } }
      card.classList.remove('is-arrived'); void card.offsetWidth; card.classList.add('is-arrived');
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'tour_cta_click', cta_location: (a.closest('section, header, .mobile-bar, footer') || {}).className || 'page', campus: c || '' });
      setTimeout(function () { var f = document.getElementById('tj-child'); if (f) f.focus({ preventScroll: true }); }, 700);
    });
  })();

/* Gentle reveal on scroll: fade and rise once, never replays. Off for reduced motion. */
(function () {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var GROUPS = '.stage-cards, .campus-cards, .steps, .bento, .guide-panels';
  var DIG = '.steps-wrap, .teachers-head, .spaces-head, .day-copy';
  var SKIP = '.steps-trail, svg, script, [aria-hidden="true"]';
  var inners = document.querySelectorAll('.stages-inner, .campuses-inner, .day-inner, .teachers-inner, .voices-inner, .admissions-inner, .final-inner, .spaces-inner, .guides-inner, .faq-inner, .closing-inner');
  if (!inners.length) return;
  document.documentElement.classList.add('rv-js');

  function show(el) {
    el.classList.add('in');
    var d = parseInt(el.style.getPropertyValue('--rv-d'), 10) || 0;
    setTimeout(function () { el.classList.remove('rv', 'in'); el.style.removeProperty('--rv-d'); }, 800 + d);
  }
  var itemIO = new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { show(e.target); itemIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  var groupIO = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      [].forEach.call(e.target.children, function (c) { if (c.classList.contains('rv')) show(c); });
      groupIO.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  function prep(el, i) {
    el.classList.add('rv');
    el.style.setProperty('--rv-d', Math.min(i, 4) * 70 + 'ms');
  }
  function collect(el, i) {
    if (el.matches(SKIP)) return;
    if (!el.getClientRects().length) return; /* hidden at this size: never trap it invisible */
    if (el.getBoundingClientRect().bottom < 0) return; /* already scrolled past: leave visible */
    if (el.matches(GROUPS)) {
      [].forEach.call(el.children, function (c, j) { prep(c, j); });
      groupIO.observe(el);
    } else if (el.matches(DIG)) {
      [].forEach.call(el.children, collect);
    } else {
      prep(el, i);
      itemIO.observe(el);
    }
  }
  inners.forEach(function (inner) { [].forEach.call(inner.children, collect); });
})();
