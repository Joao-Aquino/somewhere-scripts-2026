function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');

  wrappers.forEach((wrapper) => {
    const contentItems = wrapper.querySelectorAll('[data-tabs="content-item"]');
    const visualItems = wrapper.querySelectorAll('[data-tabs="visual-item"]');

    const autoplay = wrapper.dataset.tabsAutoplay === "true";
    const autoplayDuration =
      parseInt(wrapper.dataset.tabsAutoplayDuration) || 5000;

    let activeContent = null;
    let activeVisual = null;
    let isAnimating = false;
    let progressBarTween = null;

    function startProgressBar(index) {
      if (progressBarTween) progressBarTween.kill();
      const bar = contentItems[index].querySelector(
        '[data-tabs="item-progress"]'
      );
      if (!bar) return;

      // ✅ scaleX: 1 garante que o eixo X nunca fique zerado
      gsap.set(bar, { scaleX: 1, scaleY: 0, transformOrigin: "top center" });
      progressBarTween = gsap.to(bar, {
        scaleY: 1,
        duration: autoplayDuration / 1000,
        ease: "power1.inOut",
        onComplete: () => {
          if (!isAnimating) {
            const nextIndex = (index + 1) % contentItems.length;
            switchTab(nextIndex);
          }
        },
      });
    }

    function switchTab(index) {
      if (isAnimating || contentItems[index] === activeContent) return;

      isAnimating = true;
      if (progressBarTween) progressBarTween.kill();

      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;
      const outgoingBar = outgoingContent?.querySelector(
        '[data-tabs="item-progress"]'
      );

      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];
      const incomingBar = incomingContent.querySelector(
        '[data-tabs="item-progress"]'
      );

      const tl = gsap.timeline({
        defaults: { duration: 0.65, ease: "power3" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;
          if (autoplay) startProgressBar(index);
        },
      });

      if (outgoingContent) {
        outgoingContent.classList.remove("active");
        outgoingVisual?.classList.remove("active");
        // ✅ scaleX: 1 no set do outgoing também
        tl.set(outgoingBar, { scaleX: 1, transformOrigin: "bottom center" })
          .to(outgoingBar, { scaleY: 0, duration: 0.3 }, 0)
          .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0)
          .to(
            outgoingContent.querySelector('[data-tabs="item-details"]'),
            { height: 0 },
            0
          );
      }

      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");
      tl.fromTo(
        incomingVisual,
        { autoAlpha: 0, xPercent: 3 },
        { autoAlpha: 1, xPercent: 0 },
        0.3
      )
        .fromTo(
          incomingContent.querySelector('[data-tabs="item-details"]'),
          { height: 0 },
          { height: "auto" },
          0
        )
        // ✅ scaleX: 1 no set do incoming também
        .set(
          incomingBar,
          { scaleX: 1, scaleY: 0, transformOrigin: "top center" },
          0
        );
    }

    switchTab(0);

    contentItems.forEach((item, i) =>
      item.addEventListener("click", () => {
        if (item === activeContent) return;
        switchTab(i);
      })
    );
  });
}

initTabSystem();
