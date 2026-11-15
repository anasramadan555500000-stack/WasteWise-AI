// Micro-interactions and precise easing animations

// cubic-bezier(0.16, 1, 0.3, 1) approximation for smooth deceleration
function easeOutExpoCustom(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Micro-interaction 1: Number Counter Slow-Motion
 * Over 800ms duration with cubic-bezier easing
 */
export function animateCounter(element, targetValue, duration = 800, prefix = '', suffix = ' EGP', isCurrency = true) {
  if (!element) return;

  const startValue = 0;
  const startTime = performance.now();
  const target = Number(targetValue) || 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpoCustom(progress);
    const currentVal = startValue + (target - startValue) * easedProgress;

    if (isCurrency) {
      element.textContent = `${prefix}${currentVal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}${suffix}`;
    } else {
      element.textContent = `${prefix}${Math.round(currentVal).toLocaleString()}${suffix}`;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (isCurrency) {
        element.textContent = `${prefix}${target.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}${suffix}`;
      } else {
        element.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
      }
    }
  }

  requestAnimationFrame(update);
}

/**
 * Micro-interaction 4: Progress Bar Fill
 * Animates fill-width smoothly upon page load (transition: width 0.6s ease-out)
 */
export function triggerProgressBars(container = document) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      const bars = container.querySelectorAll('.progress-fill');
      bars.forEach(bar => {
        const targetWidth = bar.getAttribute('data-target-width') || '0';
        bar.style.width = `${targetWidth}%`;
      });
    }, 50);
  });
}
