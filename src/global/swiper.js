(function () {
  // Configura cada swiper-group de forma independente
  // "Self-contained" = cada grupo gerencia seu próprio swiper + progress bar
  function setupSwiperGroup(group) {
    const swiperEl = group.querySelector("[data-swiper-wrap]");
    const prevBtn = group.querySelector("[data-swiper-prev]");
    const nextBtn = group.querySelector("[data-swiper-next]");
    const fill = group.querySelector(".swiper-progress-fill");

    if (!swiperEl || !fill) return;

    // Remove bullet pagination se ainda existir
    const bullets = group.querySelector(".swiper-pagination");
    if (bullets) bullets.remove();

    // Detecta params originais pelo class name (myswiper vs myswiper3)
    const isSecond = swiperEl.classList.contains("myswiper3");

    // Inicializa o Swiper com os params corretos para cada instância
    const swiper = new Swiper(swiperEl, {
      slidesPerView: isSecond ? 3.5 : 3.5, // ajuste se os dois tiverem configs diferentes
      spaceBetween: 0,
      loop: false,
      navigation: {
        prevEl: prevBtn,
        nextEl: nextBtn,
      },
      breakpoints: {
        // mobile
        0: { slidesPerView: 1.2, spaceBetween: 0 },
        // tablet
        768: { slidesPerView: 2.2, spaceBetween: 0 },
        // desktop
        992: { slidesPerView: isSecond ? 3.5 : 3.5, spaceBetween: 0 },
      },
    });

    // Atualiza a progress bar
    function updateProgress() {
      const total = swiper.slides.length;
      const visible = swiper.params.slidesPerView;
      const scrollable = Math.max(total - Math.floor(visible), 1);
      const ratio = Math.min(Math.max(swiper.activeIndex / scrollable, 0), 1);

      // scaleX explícito para evitar o matrix(0,0,0,x) bug
      fill.style.transform = `matrix(${ratio}, 0, 0, 1, 0, 0)`;
    }

    swiper.on("slideChange", updateProgress);
    swiper.on("setTranslate", updateProgress); // atualiza durante drag também
    swiper.on("breakpoint", updateProgress); // atualiza quando muda breakpoint
    updateProgress(); // estado inicial
  }

  // Roda após tudo estar carregado para garantir que o DOM está pronto
  window.addEventListener("load", () => {
    document.querySelectorAll(".swiper-group").forEach(setupSwiperGroup);
  });
})();
