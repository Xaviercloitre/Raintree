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
    var sel = '.approach-cta a, .day-link a, .voices-cta a, .adm-link, .ht-name, .ht-creds a, .fc-card .fc-link, .faq .answer a';
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

  /* Approach pillars: card deck. Each card is slightly turned behind the one in front;
     as the parent scrolls, the front card lifts away and the next straightens up. */
  (function () {
    var sec = document.querySelector('.approach');
    if (!sec || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cards = sec.querySelectorAll('.pillar');
    if (cards.length < 2) return;
    sec.classList.add('deck');
    var stage = sec.querySelector('.pillars-stage');
    var REST = [-5, 4, -3];
    var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
    var ease = function (x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
    var tick = false;
    var paint = function () {
      tick = false;
      var mobile = window.matchMedia('(max-width: 960px)').matches;
      var box = (mobile ? stage : sec.querySelector('.approach-inner')).getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var span = Math.max(1, box.height - vh);
      var p = clamp(-box.top / span) * (cards.length - 1);   /* 0 .. number of hand-offs */
      cards.forEach(function (c, i) {
        var rest = REST[i % REST.length];
        var come = ease(clamp(p - (i - 1)));   /* straightening as it becomes the front card */
        var leave = ease(clamp(p - i));        /* lifting away once it is done */
        if (i === cards.length - 1) leave = 0;
        var rot = rest * (1 - come) + leave * -12;
        var y = leave * -115;
        var x = leave * -18;
        c.style.transform = 'translate(' + x + '%,' + y + '%) rotate(' + rot + 'deg)';
        c.style.opacity = String(1 - clamp((leave - .75) / .25));
      });
    };
    var onScroll = function () { if (!tick) { tick = true; requestAnimationFrame(paint); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  })();
