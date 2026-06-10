import gsap from 'gsap'

export function animateOverlayIn(overlay: HTMLElement): gsap.core.Tween {
  gsap.set(overlay, { opacity: 0 })
  return gsap.to(overlay, { opacity: 1, duration: 0.22, ease: 'power2.out' })
}

export function animateModalPanelIn(panel: HTMLElement, y = 16): gsap.core.Timeline {
  gsap.set(panel, { opacity: 0, scale: 0.88, y })
  return gsap.timeline().to(panel, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.38,
    ease: 'back.out(1.6)',
  })
}

export function animateStaggerIn(
  container: HTMLElement,
  selector: string,
  options?: { y?: number; stagger?: number; delay?: number },
): gsap.core.Tween {
  const items = container.querySelectorAll<HTMLElement>(selector)
  if (!items.length) {
    return gsap.to([], { duration: 0 })
  }

  gsap.set(items, { opacity: 0, y: options?.y ?? 24 })
  return gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.45,
    stagger: options?.stagger ?? 0.06,
    delay: options?.delay ?? 0,
    ease: 'back.out(1.4)',
  })
}

export function animateSlideIn(
  el: HTMLElement,
  direction: 'top' | 'bottom' | 'left' | 'right',
  options?: { delay?: number; duration?: number },
): gsap.core.Tween {
  const offset = 20
  const from: gsap.TweenVars = { opacity: 0 }

  if (direction === 'top') from.y = -offset
  if (direction === 'bottom') from.y = offset
  if (direction === 'left') from.x = -offset
  if (direction === 'right') from.x = offset

  gsap.set(el, from)
  return gsap.to(el, {
    opacity: 1,
    x: 0,
    y: 0,
    duration: options?.duration ?? 0.5,
    delay: options?.delay ?? 0,
    ease: 'back.out(1.5)',
  })
}

export function animatePopIn(el: HTMLElement, delay = 0): gsap.core.Tween {
  gsap.set(el, { opacity: 0, scale: 0.85 })
  return gsap.to(el, {
    opacity: 1,
    scale: 1,
    delay,
    duration: 0.5,
    ease: 'back.out(1.7)',
  })
}

export function animateIdleFloat(el: HTMLElement): gsap.core.Tween {
  return gsap.to(el, {
    y: -8,
    duration: 2.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

export function animateToastIn(el: HTMLElement): gsap.core.Tween {
  gsap.set(el, { opacity: 0, y: 18, scale: 0.88, xPercent: -50 })
  return gsap.to(el, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.38,
    ease: 'back.out(1.5)',
  })
}

export function animateToastOut(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(el, {
      opacity: 0,
      y: 10,
      scale: 0.94,
      xPercent: -50,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: resolve,
    })
  })
}

export function animateNavActive(el: HTMLElement): gsap.core.Tween {
  return gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.08, duration: 0.24, ease: 'back.out(2.5)', yoyo: true, repeat: 1 },
  )
}

export function applyHubNavActiveState(
  items: HTMLElement[],
  glows: HTMLElement[],
  activeIndex: number,
): void {
  items.forEach((item, index) => {
    const isActive = index === activeIndex
    const icon = item.querySelector<HTMLElement>('.hub-nav__icon')
    const glow = glows[index]
    if (!icon) return

    gsap.to(icon, {
      scale: isActive ? 1.08 : 0.94,
      y: isActive ? -5 : 0,
      opacity: isActive ? 1 : 0.72,
      duration: 0.34,
      ease: isActive ? 'back.out(1.8)' : 'power2.out',
      overwrite: 'auto',
    })

    if (glow) {
      gsap.to(glow, {
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.72,
        duration: 0.28,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  })

  const activeIcon = items[activeIndex]?.querySelector<HTMLElement>('.hub-nav__icon')
  if (activeIcon) animateNavActive(activeIcon)
}

export function animateComboCallout(root: HTMLElement): gsap.core.Timeline {
  const chars = root.querySelectorAll<HTMLElement>('.combo-callout__char')
  const glow = root.querySelector<HTMLElement>('.combo-callout__glow')
  const badge = root.querySelector<HTMLElement>('.combo-callout__badge')
  const stars = root.querySelectorAll<HTMLElement>('.combo-callout__star')

  gsap.set(root, { opacity: 1, y: 0, scale: 1 })
  if (glow) gsap.set(glow, { scale: 0.35, opacity: 0 })
  gsap.set(chars, { opacity: 0, scale: 0.15, y: 22, rotation: -14 })
  if (badge) gsap.set(badge, { opacity: 0, scale: 0.4, y: 12 })
  gsap.set(stars, { opacity: 0, scale: 0, rotation: -120 })

  const tl = gsap.timeline()

  if (glow) {
    tl.to(
      glow,
      { scale: 1.45, opacity: 0.9, duration: 0.18, ease: 'power2.out' },
      0,
    ).to(glow, { scale: 1.05, opacity: 0.42, duration: 0.32, ease: 'sine.inOut' }, 0.14)
  }

  tl.to(
    chars,
    {
      opacity: 1,
      scale: 1,
      y: 0,
      rotation: 0,
      duration: 0.3,
      stagger: 0.045,
      ease: 'back.out(2.4)',
    },
    0.04,
  )
    .to(
      stars,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.28,
        stagger: 0.07,
        ease: 'back.out(2.2)',
      },
      0.1,
    )

  if (badge) {
    tl.to(
      badge,
      { opacity: 1, scale: 1, y: 0, duration: 0.26, ease: 'back.out(2.6)' },
      0.16,
    )
  }

  tl.to(
    root,
    { y: -26, opacity: 0, scale: 1.1, duration: 0.3, ease: 'power2.in' },
    0.4,
  )

  if (glow) {
    tl.to(glow, { scale: 1.75, opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.4)
  }

  return tl
}

export function animateRibbonIn(el: HTMLElement): gsap.core.Tween {
  gsap.set(el, { opacity: 0, y: -24, scale: 0.9, xPercent: -50 })
  return gsap.to(el, {
    opacity: 1,
    y: 0,
    scale: 1,
    xPercent: -50,
    duration: 0.45,
    delay: 0.1,
    ease: 'back.out(1.8)',
  })
}

export function animateScorePop(el: HTMLElement): gsap.core.Tween {
  gsap.set(el, { opacity: 0, scale: 0.6 })
  return gsap.to(el, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    delay: 0.15,
    ease: 'back.out(2)',
  })
}

export function animateStarSpin(el: HTMLElement): gsap.core.Tween {
  gsap.set(el, { opacity: 0, scale: 0, rotation: -180 })
  return gsap.to(el, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 0.6,
    ease: 'back.out(1.8)',
  })
}

export function animateHubShell(
  header: HTMLElement | null,
  content: HTMLElement | null,
  nav: HTMLElement | null,
): gsap.core.Timeline {
  const tl = gsap.timeline()

  if (header) {
    gsap.set(header, { opacity: 0, y: -16 })
    tl.to(header, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0)
  }

  if (content) {
    gsap.set(content, { opacity: 0, y: 12 })
    tl.to(content, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.08)
  }

  if (nav) {
    gsap.set(nav, { opacity: 0, y: 24 })
    tl.to(nav, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }, 0.12)
  }

  return tl
}

export function animateContentSwap(el: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline()
    .fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' })
}

export interface LoadingScreenTargets {
  root: HTMLElement
  logo: HTMLElement | null
  cats: HTMLElement | null
  label: HTMLElement | null
  bar: HTMLElement | null
}

export function animateLoadingScreenEnter(targets: LoadingScreenTargets): gsap.core.Timeline {
  const { root, logo, cats, label, bar } = targets
  const catItems = cats?.querySelectorAll<HTMLElement>('.loading-screen__cat-slot') ?? []
  const paws = root.querySelectorAll<HTMLElement>('.loading-screen__paw')

  gsap.set(root, { opacity: 0 })
  if (logo) gsap.set(logo, { opacity: 0, scale: 0.82, y: -18 })
  gsap.set(catItems, { opacity: 0, scale: 0.35, y: 28 })
  if (label) gsap.set(label, { opacity: 0, y: 12 })
  if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' })
  gsap.set(paws, { opacity: 0, scale: 0.5, y: 6 })

  const tl = gsap.timeline()

  tl.to(root, { opacity: 1, duration: 0.28, ease: 'power2.out' }, 0)

  if (logo) {
    tl.to(logo, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)' }, 0.05)
  }

  if (catItems.length) {
    tl.to(
      catItems,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.08,
        ease: 'back.out(2.2)',
      },
      0.12,
    )
  }

  if (bar) {
    tl.to(bar, { scaleX: 0.08, duration: 0.35, ease: 'power2.out' }, 0.22)
  }

  if (paws.length) {
    tl.to(
      paws,
      {
        opacity: 0.85,
        scale: 1,
        y: 0,
        duration: 0.24,
        stagger: 0.05,
        ease: 'back.out(1.8)',
      },
      0.28,
    )
  }

  if (label) {
    tl.to(label, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }, 0.3)
  }

  return tl
}

export function animateLoadingScreenIdle(cats: HTMLElement, dots: HTMLElement): void {
  const catItems = cats.querySelectorAll<HTMLElement>('.loading-screen__cat-slot')
  const paws = cats.closest('.loading-screen')?.querySelectorAll<HTMLElement>('.loading-screen__paw') ?? []

  catItems.forEach((item, index) => {
    gsap.to(item, {
      y: -9,
      duration: 0.62,
      delay: index * 0.11,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  })

  gsap.to(dots, {
    opacity: 0.35,
    duration: 0.55,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })

  paws.forEach((paw, index) => {
    gsap.to(paw, {
      y: -4,
      scale: 1.08,
      duration: 0.42,
      delay: index * 0.07,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })
  })
}

export function setLoadingProgress(bar: HTMLElement, value: number): gsap.core.Tween {
  const current = gsap.getProperty(bar, 'scaleX') as number
  const next = Math.max(0.08, Math.min(1, value))
  const delta = Math.abs(next - (Number.isFinite(current) ? current : 0))

  return gsap.to(bar, {
    scaleX: next,
    duration: Math.max(0.25, Math.min(0.9, delta * 1.4)),
    ease: 'power2.out',
    overwrite: 'auto',
    transformOrigin: 'left center',
  })
}

export function animateLoadingScreenOut(root: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(root, {
      opacity: 0,
      scale: 1.03,
      duration: 0.42,
      ease: 'power2.inOut',
      onComplete: resolve,
    })
  })
}
