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
            p.classList.toggle('seen', progress >= at);
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
            p.classList.toggle('seen', progress >= t + 8);
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

    /* Hero video background: YouTube clip 0:53 to 1:20 on a muted loop.
       Demo wiring only; the build self-hosts a trimmed MP4/WebM instead.
       All devices; never under reduced motion or data saver; the placeholder scene shows otherwise or while loading. */
    var START = 53, END = 80, VID = 'R0XAL3NyN40';
    var ytWrap = document.getElementById('hero-yt-wrap');
    var hero = document.querySelector('.hero-card');
    var conn = navigator.connection || {};
    var wantsVideo = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !conn.saveData;
    if (ytWrap && wantsVideo) {
      var SRC = 'https://www.youtube.com/embed/' + VID
        + '?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1'
        + '&start=' + START + '&end=' + END;
      var fr = document.createElement('iframe');
      fr.setAttribute('allow', 'autoplay; encrypted-media');
      fr.setAttribute('tabindex', '-1');
      fr.setAttribute('title', '');
      fr.setAttribute('aria-hidden', 'true');
      function sizeYT() {
        var w = hero.clientWidth, h = hero.clientHeight, ratio = 16 / 9;
        var iw = w, ih = w / ratio;
        if (ih < h) { ih = h; iw = h * ratio; }
        fr.style.width = Math.ceil(iw * 1.06) + 'px';
        fr.style.height = Math.ceil(ih * 1.06) + 'px';
      }
      /* The iframe fades in only once YouTube reports it is PLAYING, so an error
         screen or blocked embed never covers the placeholder scene. */
      var playing = false;
      window.addEventListener('message', function (e) {
        if (e.origin.indexOf('youtube.com') === -1) return;
        var d; try { d = JSON.parse(e.data); } catch (err) { return; }
        var state = d && d.info && typeof d.info.playerState !== 'undefined' ? d.info.playerState
                  : (d && d.event === 'onStateChange' ? d.info : undefined);
        if (state === 1) { playing = true; ytWrap.classList.add('playing'); }
        if (state === 0 || state === 2) { ytWrap.classList.remove('playing'); }
      });
      fr.addEventListener('load', function () {
        var tries = 0;
        var t = setInterval(function () {
          if (playing || ++tries > 20) { clearInterval(t); return; }
          try { fr.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 'hero', channel: 'widget' }), '*'); } catch (err) {}
        }, 500);
      });
      sizeYT();
      fr.src = SRC;
      document.getElementById('hero-yt').appendChild(fr);
      window.addEventListener('resize', sizeYT);
      /* Loop the segment: fade to the placeholder, reload at the start time, fade back in. */
      setInterval(function () {
        if (!playing) return;
        playing = false;
        ytWrap.classList.remove('playing');
        setTimeout(function () { fr.src = SRC; }, 500);
      }, (END - START) * 1000 + 1500);
    }
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
     Desktop: the deck is pinned and the front card lifts away as the parent scrolls.
     Mobile: nothing is pinned, so scrolling stays free in both directions; the deck rises in
     once when it first appears, and a tap (or a sideways swipe) sends the front card away. */
  (function () {
    var sec = document.querySelector('.approach');
    if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cards = sec.querySelectorAll('.pillar');
    if (cards.length < 2) return;
    sec.classList.add('deck');
    var deck = sec.querySelector('.pillars');
    var inner = sec.querySelector('.approach-inner');
    var mq = window.matchMedia('(max-width: 960px)');
    var REST = [-4, 3, -2], N = cards.length - 1;
    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (x) { return x * x * (3 - 2 * x); };
    var vh = document.documentElement.clientHeight, lastW = window.innerWidth;
    var target = 0, current = 0, running = false, visible = false, idx = 0, introDone = false;

    /* hint under the mobile deck: "Tap to see the next" and three dots */
    var hint = document.createElement('p');
    hint.className = 'deck-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = '<span class="dh-text">Tap the card to see the next</span><span class="dh-dots">' + Array(cards.length + 1).join('<i></i>') + '</span>';
    deck.after(hint);
    var dots = hint.querySelectorAll('i'), hintText = hint.querySelector('.dh-text');

    var draw = function (p) {
      for (var i = 0; i < cards.length; i++) {
        var rest = REST[i % REST.length];
        var come = ease(clamp(p - (i - 1)));
        var leave = i === N ? 0 : ease(clamp(p - i));
        var rot = rest * (1 - come) - 10 * leave;
        var y = -112 * leave, x = -14 * leave;
        if (mq.matches) { y = -18 * leave; x = -118 * leave; rot = rest * (1 - come) - 14 * leave; }
        cards[i].style.transform = 'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,0) rotate(' + rot.toFixed(2) + 'deg)';
        cards[i].style.opacity = (1 - clamp((leave - .55) / .45)).toFixed(3);
        cards[i].setAttribute('aria-hidden', mq.matches && i !== Math.round(p) ? 'true' : 'false');
      }
    };
    var loop = function () {
      current += (target - current) * (mq.matches ? 0.2 : 0.42);
      if (Math.abs(target - current) < 0.0005) current = target;
      draw(current);
      if (current !== target) requestAnimationFrame(loop); else running = false;
    };
    var kick = function () { if (!running) { running = true; requestAnimationFrame(loop); } };

    /* desktop: scroll position drives the deck */
    var measure = function () {
      if (mq.matches) return;
      var box = inner.getBoundingClientRect();
      target = clamp(-box.top / Math.max(1, box.height - vh)) * N;
    };

    /* mobile: tap or swipe */
    var setIdx = function (k) {
      idx = (k + cards.length) % cards.length;
      target = idx;
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
      hintText.textContent = idx === N ? 'Tap to start again' : 'Tap the card to see the next';
      kick();
    };
    var mobileSetup = function () {
      if (mq.matches) {
        deck.setAttribute('role', 'button');
        deck.setAttribute('tabindex', '0');
        deck.setAttribute('aria-label', 'Show the next card');
        setIdx(idx);
      } else {
        deck.removeAttribute('role'); deck.removeAttribute('tabindex'); deck.removeAttribute('aria-label');
        cards.forEach(function (c) { c.removeAttribute('aria-hidden'); });
        measure(); kick();
      }
    };
    deck.addEventListener('click', function () { if (mq.matches) setIdx(idx + 1); });
    deck.addEventListener('keydown', function (e) {
      if (!mq.matches) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIdx(idx + 1); }
      if (e.key === 'ArrowRight') setIdx(idx + 1);
      if (e.key === 'ArrowLeft') setIdx(idx - 1);
    });
    var sx = 0, sy = 0, swiped = false;
    deck.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; }, { passive: true });
    deck.addEventListener('touchend', function (e) {
      if (!mq.matches) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        swiped = true; setIdx(idx + (dx < 0 ? 1 : -1));
        e.preventDefault();   /* the swipe already moved the deck; skip the click */
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && mq.matches && !introDone) { introDone = true; deck.classList.add('deck-intro'); }
        if (visible) { measure(); kick(); }
      }, { rootMargin: '0px 0px -15% 0px' }).observe(deck);
    }
    window.addEventListener('scroll', function () { if (!mq.matches && visible) { measure(); kick(); } }, { passive: true });
    window.addEventListener('resize', function () {
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; vh = document.documentElement.clientHeight; mobileSetup(); }
    });
    mobileSetup();
    current = target; draw(current);
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
