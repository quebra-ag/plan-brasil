/* =========================================================
   Proposta 30 anos Plan Brasil — Agência Quebra
   Navegação · abertura · acordeões · cases scroll-driven
   ========================================================= */
(function(){
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  if(hasGsap && typeof window.ScrollTrigger !== "undefined"){ gsap.registerPlugin(ScrollTrigger); }

  function navHeight(){
    var v = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
    return parseInt(v, 10) || 72;
  }

  /* ---------------------------------------------------------
     Navegação: estado rolado, barra de progresso, item ativo
     --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  var bar = document.querySelector("#progress span");
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a, .nav__mobile a[href^="#"]'));
  var targets = links.map(function(a){ return document.querySelector(a.getAttribute("href")); })
                     .filter(function(el, i, arr){ return el && arr.indexOf(el) === i; });

  function setActive(){
    var y = (window.scrollY || document.documentElement.scrollTop) + navHeight() + Math.min(window.innerHeight * 0.35, 260);
    var current = targets[0];
    for(var i = 0; i < targets.length; i++){
      if(targets[i].offsetTop <= y) current = targets[i];
    }
    var atBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 4;
    if(atBottom) current = targets[targets.length - 1];
    links.forEach(function(a){
      a.classList.toggle("is-active", current && a.getAttribute("href") === "#" + current.id);
    });
  }

  function onScroll(){
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("is-scrolled", y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if(bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    setActive();
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  window.addEventListener("resize", setActive);
  onScroll();

  /* rolagem suave com compensação do header fixo */
  function scrollToHash(hash){
    var el = document.querySelector(hash);
    if(!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - navHeight() + 1;
    if(prefersReduced){ window.scrollTo(0, top); }
    else { window.scrollTo({top: top, behavior: "smooth"}); }
    if(history.pushState) history.pushState(null, "", hash);
  }
  links.forEach(function(a){
    a.addEventListener("click", function(e){
      var hash = a.getAttribute("href");
      if(hash && hash.charAt(0) === "#"){ e.preventDefault(); scrollToHash(hash); }
    });
  });

  /* menu móvel */
  var burger = document.getElementById("burger");
  var mobile = document.getElementById("mobileMenu");
  function closeMenu(){
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menu");
    mobile.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", function(){
    var open = burger.getAttribute("aria-expanded") === "true";
    if(open){ closeMenu(); return; }
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Fechar menu");
    mobile.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });
  mobile.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && mobile.classList.contains("is-open")) closeMenu(); });

  /* ---------------------------------------------------------
     Abertura: título por palavras + 30 barras (1997 → 2027)
     --------------------------------------------------------- */
  var genBars = document.getElementById("genBars");
  var gen = document.getElementById("gen");
  var genLabel = document.getElementById("genLabel");
  var YEAR0 = 1997, YEARS = 30;
  var bars = [];
  for(var y = 0; y <= YEARS; y++){
    var b = document.createElement("span");
    b.className = "gen__bar";
    b.setAttribute("data-year", String(YEAR0 + y));
    genBars.appendChild(b);
    bars.push(b);
  }
  /* altura de repouso: cresce suavemente ao longo da geração */
  var REST = bars.map(function(_, i){ return 22 + (i / YEARS) * 30; });
  function applyRest(){
    bars.forEach(function(b, i){ b.style.setProperty("--h", REST[i] + "%"); b.classList.remove("is-hot", "is-peak"); });
  }
  applyRest();

  var live = false, idleTimer = null;
  function pointerAt(clientX){
    var rect = genBars.getBoundingClientRect();
    var x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    var idx = Math.round((x / rect.width) * YEARS);
    var peak = -1, peakD = 1e9;
    bars.forEach(function(b, i){
      var d = Math.abs(i - idx);
      var boost = Math.exp(-(d * d) / 9) * 62; /* onda gaussiana em torno do cursor */
      b.style.setProperty("--h", Math.min(100, REST[i] + boost) + "%");
      b.classList.toggle("is-hot", d <= 3);
      b.classList.toggle("is-peak", d === 0);
      if(d < peakD){ peakD = d; peak = i; }
    });
    var target = bars[peak];
    var r = target.getBoundingClientRect(), gr = gen.getBoundingClientRect();
    genLabel.style.left = (r.left - gr.left + r.width / 2) + "px";
    genLabel.textContent = target.getAttribute("data-year");
    gen.classList.add("is-live");
    live = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){ live = false; gen.classList.remove("is-live"); applyRest(); }, 1400);
  }
  genBars.addEventListener("pointermove", function(e){ pointerAt(e.clientX); });
  genBars.addEventListener("pointerdown", function(e){ pointerAt(e.clientX); });
  genBars.addEventListener("pointerleave", function(){
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){ live = false; gen.classList.remove("is-live"); applyRest(); }, 500);
  });

  if(hasGsap && !prefersReduced){
    /* sequência única de abertura */
    var words = document.querySelectorAll(".hero__h1 .word i");
    gsap.set(words, {yPercent: 110});
    var tl = gsap.timeline({defaults:{ease:"power4.out"}});
    tl.to(words, {yPercent: 0, duration: 1.1, stagger: 0.12}, 0.1)
      .from(bars, {scaleY: 0, duration: 0.8, ease: "power3.out", stagger: {each: 0.022, from: "start"}}, 0.45)
      .from(".gen__axis", {opacity: 0, y: 8, duration: 0.6}, 0.9)
      .from(".ctx", {opacity: 0, y: 24, duration: 0.9}, 1.0);

    /* varredura ociosa: uma onda percorre a geração a cada tanto tempo */
    var sweep = {i: -6};
    function sweepOnce(){
      if(live) return;
      gsap.fromTo(sweep, {i: -6}, {i: YEARS + 6, duration: 2.6, ease: "sine.inOut",
        onUpdate: function(){
          if(live) return;
          bars.forEach(function(b, k){
            var d = Math.abs(k - sweep.i);
            var boost = Math.exp(-(d * d) / 12) * 26;
            b.style.setProperty("--h", (REST[k] + boost) + "%");
          });
        },
        onComplete: function(){ if(!live) applyRest(); }
      });
    }
    setTimeout(function(){
      sweepOnce();
      setInterval(sweepOnce, 7000);
    }, 2400);
  } else {
    /* sem GSAP ou com movimento reduzido: tudo visível de imediato */
    document.querySelectorAll(".hero__h1 .word i").forEach(function(w){ w.style.transform = "none"; });
  }

  /* ---------------------------------------------------------
     Acordeões (cases e considerações)
     --------------------------------------------------------- */
  function setupAccordion(btnSel, itemSel){
    document.querySelectorAll(btnSel).forEach(function(btn){
      btn.addEventListener("click", function(){
        var item = btn.closest(itemSel);
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        item.classList.toggle("is-open", !open);
        /* fora do bloco pinado a altura da página muda: recalcula os gatilhos */
        if(window.ScrollTrigger && !btn.closest(".cases")){ setTimeout(function(){ ScrollTrigger.refresh(); }, 450); }
      });
    });
  }
  setupAccordion(".acc__btn", ".acc__item");
  setupAccordion(".facc__btn", ".facc__item");

  /* ---------------------------------------------------------
     Cases: scroll-driven storytelling (desktop, sem reduced-motion)
     --------------------------------------------------------- */
  var casesEl = document.getElementById("cases");
  var casePanels = Array.prototype.slice.call(casesEl.querySelectorAll(".case"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".cases__dot"));
  var hint = document.getElementById("caseHint");

  if(hasGsap && window.ScrollTrigger && casePanels.length > 1){
    var mm = gsap.matchMedia();
    mm.add("(min-width: 961px) and (prefers-reduced-motion: no-preference)", function(){
      casesEl.classList.add("is-pinned");
      var n = casePanels.length;
      var steps = n - 1;
      gsap.set(casePanels, {yPercent: 0, scale: 1, autoAlpha: 1});
      gsap.set(casePanels.slice(1), {yPercent: 100});

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: casesEl,
          start: "top top",
          end: function(){ return "+=" + (window.innerHeight * steps); },
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          snap: {
            snapTo: 1 / steps,
            duration: {min: 0.25, max: 0.7},
            delay: 0.02,
            ease: "power2.inOut",
            directional: true,
            inertia: false
          },
          onUpdate: function(self){
            var idx = Math.round(self.progress * steps);
            dots.forEach(function(d, i){ d.classList.toggle("is-active", i === idx); });
            if(hint) hint.style.opacity = idx === steps ? "0" : "1";
          }
        }
      });
      for(var i = 1; i < n; i++){
        tl.to(casePanels[i - 1], {scale: 0.96, yPercent: -4, autoAlpha: 0.45, ease: "none", duration: 1}, i - 1)
          .to(casePanels[i], {yPercent: 0, ease: "none", duration: 1}, i - 1);
      }
      var st = tl.scrollTrigger;

      function gotoCase(idx){
        var pos = st.start + (st.end - st.start) * (idx / steps);
        window.scrollTo({top: pos, behavior: "smooth"});
      }
      dots.forEach(function(d){ d.onclick = function(){ gotoCase(parseInt(d.getAttribute("data-goto"), 10)); }; });

      /* abrir um acordeão em um case que ainda não está visível não gera etapa de scroll:
         garantimos que o painel de texto role internamente. */
      return function(){
        casesEl.classList.remove("is-pinned");
        dots.forEach(function(d){ d.onclick = null; });
        gsap.set(casePanels, {clearProps: "all"});
      };
    });
  }

  /* re-calcula posições após carregar imagens/fontes */
  window.addEventListener("load", function(){ if(window.ScrollTrigger) ScrollTrigger.refresh(); setActive(); });
})();
