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
       Desktop only, never under reduced motion or data saver; the placeholder scene shows otherwise or while loading. */
    var START = 53, END = 80, VID = 'R0XAL3NyN40';
    var ytWrap = document.getElementById('hero-yt-wrap');
    var hero = document.querySelector('.hero');
    var conn = navigator.connection || {};
    var wantsVideo = window.matchMedia('(min-width: 960px)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
