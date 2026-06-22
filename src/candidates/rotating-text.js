function initRotatingText() {
  document.querySelectorAll('[data-rotating-title]').forEach((heading) => {

    const stepDuration = parseFloat(heading.getAttribute('data-step-duration') || '1.75');

    SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      linesClass: 'rotating-line',
      onSplit(instance) {
        const rotatingSpan = heading.querySelector('[data-rotating-words]');
        if (!rotatingSpan) return;

        const rawWords = rotatingSpan.getAttribute('data-rotating-words') || '';
        const words = rawWords
          .split(',')
          .map((w) => w.trim())
          .filter(Boolean);

        if (!words.length) return;

        // Build inner wrapper with stacked words
        const wrapper = document.createElement('span');
        wrapper.className = 'rotating-text__inner';

        const wordEls = words.map((word) => {
          const el = document.createElement('span');
          el.className = 'rotating-text__word';
          el.textContent = word;
          wrapper.appendChild(el);
          return el;
        });

        // Replace the original content of the highlight span
        rotatingSpan.textContent = '';
        rotatingSpan.appendChild(wrapper);

        requestAnimationFrame(() => {
          
          // Define duration of your in + out movement
          const inDuration = 0.75;
          const outDuration = 0.6;

          // Initial state: everyone hidden below
          gsap.set(wordEls, { yPercent: 150, autoAlpha: 0 });

          // Show first word immediately
          let activeIndex = 0;
          const firstWord = wordEls[activeIndex];
          gsap.set(firstWord, { yPercent: 0, autoAlpha: 1 });

          // Set initial width to first word
          const firstWidth = firstWord.getBoundingClientRect().width;
          wrapper.style.width = firstWidth + 'px';

          function showNext() {
            const nextIndex = (activeIndex + 1) % wordEls.length;
            const prev = wordEls[activeIndex];
            const current = wordEls[nextIndex];

            const targetWidth = current.getBoundingClientRect().width;

            // Animate wrapper width to match new word
            gsap.to(wrapper, {
              width: targetWidth,
              duration: inDuration,
              ease: 'power4.inOut'
            });

            // Move old word out
            if (prev && prev !== current) {
              gsap.to(prev, {
                yPercent: -150,
                autoAlpha: 0,
                duration: outDuration,
                ease: 'power4.inOut'
              });
            }

            // Reveal new word
            gsap.fromTo(
              current,
              { yPercent: 150, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: inDuration,
                ease: 'power4.inOut'
              }
            );

            activeIndex = nextIndex;

            gsap.delayedCall(stepDuration, showNext);
          }

          // First word is already visible, start rotating after a full step
          if (wordEls.length > 1) {
            gsap.delayedCall(stepDuration, showNext);
          }
        });
      }
    });
  });
}

// Initialize Rotating Text
  initRotatingText();