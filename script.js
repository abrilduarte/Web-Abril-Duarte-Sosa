(function(){
  "use strict";

  /* ---------- ESTRELLAS ---------- */
  function makeStars(container, count, avoidZone){
    var html = '';
    var added = 0;
    var attempts = 0;
    while(added < count && attempts < count * 20){
      attempts++;
      var top = Math.random()*100;
      var left = Math.random()*100;
      if(avoidZone &&
         left > avoidZone.left && left < avoidZone.right &&
         top > avoidZone.top && top < avoidZone.bottom){
        continue; // cae en la zona del personaje, se descarta y se prueba otra
      }
      var size = (Math.random()*2 + 1).toFixed(1);
      var delay = (Math.random()*4).toFixed(1);
      html += '<span style="width:'+size+'px;height:'+size+'px;top:'+top.toFixed(1)+'%;left:'+left.toFixed(1)+'%;animation-delay:'+delay+'s;"></span>';
      added++;
    }
    container.innerHTML = html;
  }

  var introStarsEl = document.getElementById('introStars');
  if(introStarsEl){ makeStars(introStarsEl, 110); }
  var heroStarsEl = document.getElementById('heroStars');
  if(heroStarsEl){ makeStars(heroStarsEl, 90, { left:25, right:75, top:35, bottom:100 }); }

  /* ---------- FUNDIDO ENTRADA ---------- */
  var siteRootFade = document.getElementById('siteRoot');
  function revealSiteRoot(){
    window.requestAnimationFrame(function(){
      window.requestAnimationFrame(function(){ siteRootFade.classList.add('is-loaded'); });
    });
  }
  if(siteRootFade && !siteRootFade.classList.contains('is-hidden')){
    revealSiteRoot();
  }

  /* ---------- INTRO FLOW ---------- */
  var introGate = document.getElementById('introGate');
  if(introGate){
    var body = document.body;
    var steps = document.querySelectorAll('.intro-screen');
    var doorScreen = document.getElementById('doorScreen');
    var siteRoot = document.getElementById('siteRoot');
    var introBgVideo = document.getElementById('introBgVideo');

    // Si el usuario recarga la página (F5), queremos que la intro
    // vuelva a aparecer. Si solo está navegando no.
    var navEntries = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation') : [];
    var isReload = navEntries && navEntries.length && navEntries[0].type === 'reload';
    if(isReload){ sessionStorage.removeItem('khIntroDone'); }

    if(sessionStorage.getItem('khIntroDone')){
      introGate.style.display = 'none';
      siteRoot.classList.remove('is-hidden');
      body.classList.remove('intro-locked');
      revealSiteRoot();
    }

    var showStep = function(i){
      steps.forEach(function(s){
        s.classList.remove('is-active');
        s.style.display = 'none';
      });
      var next = steps[i];
      if(next){
        next.style.display = 'flex';
        void next.offsetWidth;
        next.classList.add('is-active');
        if(next === doorScreen){ prepDoorVideo(); }
      }
    };

    var doorVideo = document.getElementById('doorVideo');

    function prepDoorVideo(){
      if(!doorVideo) return;
      doorVideo.style.display = 'block';
      doorVideo.classList.remove('is-playing');
    }

    var FADE_MS = 550;
    var PAUSE_MS = 3200;
    var FINAL_PAUSE_MS = 3800;

    var quotes = {
      0: {
        lugar: "Incluso los corazones que vagan buscan un lugar al que llamar hogar.",
        sueno: "Algunos caminos comienzan con algo que todavía no existe.",
        amistad: "Hay vínculos que pueden encontrar el camino incluso cuando los mundos se separan.",
        verdad: "Hay respuestas que solo aparecen cuando estás dispuesto a mirar más allá."
      },
      1: {
        oscuridad: "La oscuridad no siempre llega para ser enfrentada. A veces, llega para mostrarte qué escondías.",
        perder: "Cuanto más importante es alguien para ti, más difícil resulta imaginar un mundo sin él.",
        solo: "Hay silencios que pesan más cuando no tienes a nadie con quien compartirlos.",
        olvidar: "Algunas cosas desaparecen de la memoria mucho antes de desaparecer del corazón."
      },
      2: {
        fuerza: "La fuerza tiene un precio cuando decides usarla por alguien más.",
        recuerdo: "Hay recuerdos que pesan. Y otros que pesan precisamente porque no quieres perderlos.",
        hogar: "A veces, para encontrar otro mundo, primero hay que dejar atrás el que conoces.",
        tiempo: "No hay nada más valioso que aquello que no puede recuperarse."
      }
    };

    function fadeIn(el, display){
      el.style.display = display || 'flex';
      void el.offsetWidth;
      el.classList.add('is-visible');
    }
    function fadeOut(el, cb){
      el.classList.remove('is-visible');
      window.setTimeout(function(){
        el.style.display = 'none';
        if(cb){ cb(); }
      }, FADE_MS);
    }

    steps.forEach(function(screen){
      var buttons = screen.querySelectorAll('.intro-options button');
      if(!buttons.length){ return; }
      buttons.forEach(function(btn){
        btn.addEventListener('click', function(){
          if(screen.classList.contains('is-answering')){ return; }
          screen.classList.add('is-answering');
          buttons.forEach(function(b){ b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');

          var idx = parseInt(screen.dataset.step, 10);
          var phaseQuestion = screen.querySelector('.phase-question');
          var phaseQuote = screen.querySelector('.phase-quote');
          var quoteEl = phaseQuote.querySelector('.intro-quote');

          window.setTimeout(function(){
            phaseQuestion.classList.add('is-fading');
            window.setTimeout(function(){
              phaseQuestion.style.display = 'none';
              quoteEl.textContent = quotes[idx][btn.dataset.value] || '';
              fadeIn(phaseQuote);

              function advanceFromQuote(){
                fadeOut(phaseQuote, function(){
                  if(idx < 2){
                    showStep(idx + 1);
                  } else {
                    var phaseFinal = screen.querySelector('.phase-final');
                    fadeIn(phaseFinal);

                    function advanceFromFinal(){
                      fadeOut(phaseFinal, function(){
                        showStep(3);
                      });
                    }
                    var finalTimer = window.setTimeout(advanceFromFinal, FINAL_PAUSE_MS);
                    screen.addEventListener('click', function skipFinal(){
                      window.clearTimeout(finalTimer);
                      screen.removeEventListener('click', skipFinal);
                      advanceFromFinal();
                    }, { once:true });
                  }
                });
              }
              var quoteTimer = window.setTimeout(advanceFromQuote, PAUSE_MS);
              screen.addEventListener('click', function skipQuote(){
                window.clearTimeout(quoteTimer);
                screen.removeEventListener('click', skipQuote);
                advanceFromQuote();
              }, { once:true });
            }, FADE_MS);
          }, 100);
        });
      });
    });

    function revealSite(){
      sessionStorage.setItem('khIntroDone', '1');
      introGate.style.transition = 'opacity 700ms ease';
      introGate.style.opacity = '0';
      window.setTimeout(function(){
        introGate.style.display = 'none';
        siteRoot.classList.remove('is-hidden');
        body.classList.remove('intro-locked');
        revealSiteRoot();
      }, 700);
    }

    if(doorVideo){
      doorVideo.addEventListener('ended', function(){
        revealSite();
      });
      doorVideo.addEventListener('error', function(){
        revealSite();
      });
    }

    var doorTriggered = false;

    function openDoor(){
      if(!doorVideo){
        revealSite();
        return;
      }
      doorVideo.style.display = 'block';
      doorVideo.currentTime = 0;
      doorVideo.classList.add('is-playing');
      window.setTimeout(function(){
        var playPromise = doorVideo.play();
        if(playPromise && playPromise.catch){
          playPromise.catch(function(){
            revealSite();
          });
        }
      }, 700);
      // Red de seguridad: si el video nunca dispara "ended" (archivo dañado,
      // se cuelga, o el navegador nunca resuelve el error), no dejamos la
      // pantalla en negro para siempre.
      window.setTimeout(function(){
        revealSite();
      }, 20000);
    }

    doorScreen.addEventListener('click', function(e){
      if(doorTriggered){ return; }
      doorTriggered = true;
      if(introBgVideo){ introBgVideo.classList.add('is-active'); }
      var doorCue = doorScreen.querySelector('.door-cue');
      if(doorCue){ doorCue.classList.add('is-fading'); }
      openDoor();
    });

    var introSkipBtn = document.getElementById('introSkip');
    if(introSkipBtn){ introSkipBtn.addEventListener('click', revealSite); }
  }

  /* ---------- Mobile nav (todas las páginas) ---------- */
  var burger = document.getElementById('navBurger');
  var navLinks = document.getElementById('navLinks');
  if(burger && navLinks){
    burger.addEventListener('click', function(){
      var open = navLinks.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navLinks.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Gallery (solo existe en galeria.html) ---------- */
  var galleryGrid = document.getElementById('galleryGrid');
  if(galleryGrid){
       var galleryItems = [
        { game:'kh1', tag:'Kingdom Hearts', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0469.JPG' },
        { game:'kh2', tag:'Kingdom Hearts II', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0451.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0453.WEBP' },
        { game:'kh1', tag:'Kingdom Hearts', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0454.WEBP' },
        { game:'kh2', tag:'Kingdom Hearts II', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0455.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0456.JPG' },
        { game:'kh2', tag:'Kingdom Hearts II', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0458.jpg' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0459.WEBP' },
        { game:'kh1', tag:'Kingdom Hearts', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0460.AVIF' },
        { game:'kh2', tag:'Kingdom Hearts II', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0461.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0462.AVIF' },
        { game:'kh1', tag:'Kingdom Hearts', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0464.JPG' },
        { game:'kh2', tag:'Kingdom Hearts II', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0465.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0466.JPG' },
        { game:'kh1', tag:'Kingdom Hearts', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0467.WEBP' },
        { game:'kh2', tag:'Kingdom Hearts II', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0468.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0470.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0471.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0472.WEBP' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0473.webp' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0474.JPG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0475.WEBP' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0476.WEBP' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0477.WEBP' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0478.PNG' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0479.jpg' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0480.jpg' },
        { game:'bbs', tag:'Birth by Sleep', caption:'Escribí aquí tu descripción.', src:'Galeria/IMG_0481.jpeg' }
      ];

    var currentList = [];
    var currentIndex = 0;

    function renderGallery(filter){
      galleryGrid.innerHTML = '';
      currentList = galleryItems.filter(function(item){ return filter === 'all' || item.game === filter; });
      currentList.forEach(function(item, i){
        var btn = document.createElement('button');
        btn.className = 'gallery-item'; btn.type = 'button';
        btn.innerHTML =
        '<span class="gallery-art"><img src="'+item.src+'" alt="'+item.tag+'" loading="lazy" onerror="this.closest(\'.gallery-item\').style.display=\'none\'"></span>';
        btn.addEventListener('click', function(){ openLightbox(i); });
        galleryGrid.appendChild(btn);
      });
    }
    renderGallery('all');
    document.querySelectorAll('.filter-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        document.querySelectorAll('.filter-btn').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
        btn.setAttribute('aria-pressed','true');
        renderGallery(btn.dataset.filter);
      });
    });

    var lightbox = document.getElementById('lightbox');
    var lightboxArt = document.getElementById('lightboxArt');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var lastFocused = null;

    function showLightboxItem(){
      var item = currentList[currentIndex];
      if(!item) return;
      lightboxArt.innerHTML = '<img src="'+item.src+'" alt="'+item.tag+'" style="opacity:0;">';
      var img = lightboxArt.querySelector('img');
      void img.offsetWidth;
      img.style.opacity = '1';
    }

    function openLightbox(index){
      currentIndex = index;
      lastFocused = document.activeElement;
      showLightboxItem();
      lightbox.classList.add('is-open'); lightboxClose.focus();
      document.addEventListener('keydown', onKey);
    }
    function stepLightbox(dir){
      if(!currentList.length) return;
      var img = lightboxArt.querySelector('img');
      function advance(){
        currentIndex = (currentIndex + dir + currentList.length) % currentList.length;
        showLightboxItem();
      }
      if(img){
        img.style.opacity = '0';
        window.setTimeout(advance, 120);
      } else {
        advance();
      }
    }
    function closeLightbox(){ lightbox.classList.remove('is-open'); document.removeEventListener('keydown', onKey); if(lastFocused){ lastFocused.focus(); } }
    function onKey(e){
      if(e.key === 'Escape'){ closeLightbox(); }
      else if(e.key === 'ArrowLeft'){ stepLightbox(-1); }
      else if(e.key === 'ArrowRight'){ stepLightbox(1); }
    }
    if(lightboxClose){ lightboxClose.addEventListener('click', closeLightbox); }
    if(lightboxPrev){ lightboxPrev.addEventListener('click', function(){ stepLightbox(-1); }); }
    if(lightboxNext){ lightboxNext.addEventListener('click', function(){ stepLightbox(1); }); }
    if(lightbox){
      lightbox.addEventListener('click', function(e){ if(e.target === lightbox){ closeLightbox(); } });
    }
  }

  /* ---------- Cápsula del tiempo (solo existe en tucamino.html) ---------- */
  (function(){
    var capsule = document.getElementById('capsule');
    if(!capsule) return;

    var stepsCap = {};
    capsule.querySelectorAll('.capsule-step').forEach(function(s){ stepsCap[s.dataset.step] = s; });

    var CAP_FADE_MS = 550;
    function capFadeIn(el){
      el.style.display = 'block';
      void el.offsetWidth;
      el.classList.add('is-visible');
    }
    function capFadeOut(el, cb){
      el.classList.remove('is-visible');
      window.setTimeout(function(){ el.style.display = 'none'; if(cb){ cb(); } }, CAP_FADE_MS);
    }
    function goTo(key, cb){
      var current = capsule.querySelector('.capsule-step.is-visible');
      if(current && current !== stepsCap[key]){
        capFadeOut(current, function(){ capFadeIn(stepsCap[key]); if(cb){ cb(); } });
      } else {
        capFadeIn(stepsCap[key]);
        if(cb){ cb(); }
      }
    }

    var started = false;
    function startCapsule(){
      if(started) return;
      started = true;
      capFadeIn(stepsCap['0']);
      window.setTimeout(function(){ goTo('1'); }, 2600);
    }
    if('IntersectionObserver' in window){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ if(entry.isIntersecting){ startCapsule(); obs.disconnect(); } });
      }, { threshold:.35 });
      obs.observe(capsule);
    } else {
      startCapsule();
    }

    /* Paso 1 — identidad */
    var capNombre = document.getElementById('capNombre');
    var next1 = document.getElementById('capsuleNext1');
    function checkStep1(){ next1.disabled = !capNombre.value.trim(); }
    capNombre.addEventListener('input', checkStep1);
    next1.addEventListener('click', function(){ goTo('2'); });

    /* Paso 2 — correo */
    var capEmail = document.getElementById('capEmail');
    var next2 = document.getElementById('capsuleNext2');
    function checkStep2(){ next2.disabled = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(capEmail.value.trim()); }
    capEmail.addEventListener('input', checkStep2);
    next2.addEventListener('click', function(){ goTo('3'); });

    /* Paso 3 — elección */
    var choiceRow = document.getElementById('capsuleChoiceRow');
    var selectedChoice = null;
    choiceRow.querySelectorAll('.choice-card').forEach(function(card){
      function select(){
        choiceRow.querySelectorAll('.choice-card').forEach(function(c){ c.classList.remove('is-selected'); c.setAttribute('aria-checked','false'); });
        card.classList.add('is-selected'); card.setAttribute('aria-checked','true');
        selectedChoice = card.dataset.choice;
        window.setTimeout(function(){ goTo('4'); }, 500);
      }
      card.addEventListener('click', select);
      card.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); select(); } });
    });

    /* Paso 4 — recuerdo */
    var next4 = document.getElementById('capsuleNext4');
    next4.addEventListener('click', function(){ goTo('5'); });

    /* Paso 5 — guardar */
    var capFecha = document.getElementById('capFecha');
    var capsuleError = document.getElementById('capsuleError');
    var sealBtn = document.getElementById('capsuleSeal');
    var todayStr = new Date().toISOString().slice(0,10);
    capFecha.setAttribute('min', todayStr);

    function formatFecha(str){
      var d = new Date(str + 'T00:00:00');
      return d.toLocaleDateString('es-AR', { day:'numeric', month:'long', year:'numeric' });
    }

    sealBtn.addEventListener('click', function(){
      capsuleError.textContent = '';
      if(!capNombre.value.trim()){ capsuleError.textContent = 'Falta tu nombre.'; goTo('1'); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(capEmail.value.trim())){ capsuleError.textContent = 'El correo no tiene forma de correo.'; goTo('2'); return; }
      if(!selectedChoice){ capsuleError.textContent = 'Elige qué llevar contigo.'; goTo('3'); return; }
      if(!capFecha.value || capFecha.value < todayStr){ capsuleError.textContent = 'Elige una fecha futura para recibir tu cápsula.'; return; }
      sealCapsule();
    });

    function sealCapsule(){
      goTo('6', function(){
        var sealPath = document.getElementById('sealHeart');
        sealPath.style.animation = 'none';
        void sealPath.offsetWidth;
        sealPath.style.animation = '';

        var lines = stepsCap['6'].querySelectorAll('.capsule-recap p');
        lines.forEach(function(p, i){
          window.setTimeout(function(){ p.classList.add('is-visible'); }, 500 + i * 650);
        });
        var finalEl = document.getElementById('capsuleFinal');
        window.setTimeout(function(){
          finalEl.textContent = 'Nos vemos el ' + formatFecha(capFecha.value) + '.';
          finalEl.classList.add('is-visible');
        }, 500 + lines.length * 650 + 400);
      });
    }
  })();

    /* ---------- LIGHTBOX CRÓNICAS ---------- */
  (function(){
    var gamesLightbox = document.getElementById('gamesLightbox');
    if(!gamesLightbox) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.game-card'));
    var items = cards.map(function(card){
      var img = card.querySelector('.game-art img');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        title: card.querySelector('.game-head h3') ? card.querySelector('.game-head h3').textContent : '',
        desc: card.querySelector('.game-hook') ? card.querySelector('.game-hook').textContent : ''
      };
    });

    var gamesArt = document.getElementById('gamesLightboxArt');
    var gamesTitle = document.getElementById('gamesLightboxTitle');
    var gamesDesc = document.getElementById('gamesLightboxDesc');
    var gamesClose = document.getElementById('gamesLightboxClose');
    var gamesPrev = document.getElementById('gamesLightboxPrev');
    var gamesNext = document.getElementById('gamesLightboxNext');
    var gamesIndex = 0;
    var gamesLastFocused = null;

    function showGamesItem(){
      var item = items[gamesIndex];
      if(!item) return;
      gamesArt.innerHTML = '<img src="'+item.src+'" alt="'+item.alt+'" style="opacity:0;">';
      var img = gamesArt.querySelector('img');
      gamesTitle.textContent = item.title;
      gamesDesc.textContent = item.desc;
      gamesTitle.style.opacity = '0';
      gamesDesc.style.opacity = '0';
      void img.offsetWidth;
      img.style.opacity = '1';
      gamesTitle.style.opacity = '1';
      gamesDesc.style.opacity = '1';
    }
    function openGamesLightbox(i){
      gamesIndex = i;
      gamesLastFocused = document.activeElement;
      showGamesItem();
      gamesLightbox.classList.add('is-open');
      gamesClose.focus();
      document.addEventListener('keydown', onGamesKey);
    }
    function stepGamesLightbox(dir){
      if(!items.length) return;
      var img = gamesArt.querySelector('img');
      function advance(){
        gamesIndex = (gamesIndex + dir + items.length) % items.length;
        showGamesItem();
      }
      if(img){
        img.style.opacity = '0';
        gamesTitle.style.opacity = '0';
        gamesDesc.style.opacity = '0';
        window.setTimeout(advance, 120);
      } else {
        advance();
      }
    }
    function closeGamesLightbox(){
      gamesLightbox.classList.remove('is-open');
      document.removeEventListener('keydown', onGamesKey);
      if(gamesLastFocused){ gamesLastFocused.focus(); }
    }
    function onGamesKey(e){
      if(e.key === 'Escape'){ closeGamesLightbox(); }
      else if(e.key === 'ArrowLeft'){ stepGamesLightbox(-1); }
      else if(e.key === 'ArrowRight'){ stepGamesLightbox(1); }
    }

    cards.forEach(function(card, i){
      var art = card.querySelector('.game-art');
      if(art){ art.addEventListener('click', function(){ openGamesLightbox(i); }); }
    });

    if(gamesClose){ gamesClose.addEventListener('click', closeGamesLightbox); }
    if(gamesPrev){ gamesPrev.addEventListener('click', function(){ stepGamesLightbox(-1); }); }
    if(gamesNext){ gamesNext.addEventListener('click', function(){ stepGamesLightbox(1); }); }
    if(gamesLightbox){
      gamesLightbox.addEventListener('click', function(e){ if(e.target === gamesLightbox){ closeGamesLightbox(); } });
    }
  })();

  /* ---------- SCROLL CORAZÓN ---------- */
  (function(){
    var crestWrap = document.querySelector('.crest-wrap');
    var crest = crestWrap ? crestWrap.querySelector('.content-crest') : null;
    var zoneStart = document.getElementById('crestZoneStart');
    if(!crestWrap || !crest || !zoneStart) return;
    var PIN_LINE = 150; // debe coincidir con el padding-top del .content-crest en CSS
    var TRIGGER_LINE = 300; // qué tan antes (en px desde arriba de la pantalla) dispara la aparición
    var ticking = false;
    function update(){
      ticking = false;
      var startTop = zoneStart.getBoundingClientRect().top;
      var wrapBottom = crestWrap.getBoundingClientRect().bottom;
      var visible = startTop <= TRIGGER_LINE && wrapBottom > PIN_LINE;
      crest.classList.toggle('is-visible', visible);
    }
    function onScroll(){
      if(!ticking){ ticking = true; window.requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

})();