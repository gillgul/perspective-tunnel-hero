/**
 * Perspective Tunnel Hero — plain-JavaScript version of
 * components/ui/perspective-tunnel-hero.tsx. No libraries.
 * Scroll (or swipe) inside the section to fly the cards toward you;
 * the cursor gently pans the camera.
 */
;(function () {
  "use strict"

  // Swap these for your own images and titles.
  const IMAGES = [
    { src: "https://cdn.21st.dev/assets/mirror/c3/c3fbd2afa140223999a441b32ed986f61d473930002708df805a81532a326aac.jpg", title: "Chroma I" },
    { src: "https://cdn.21st.dev/assets/mirror/9d/9d8b2f675a5814476ada3736ce439bcda23c5c389e0ebf9b25d8a0c09f3bbcfe.jpg", title: "Prism III" },
    { src: "https://cdn.21st.dev/assets/mirror/8b/8bb738bf2f00d7f7ed3c3ec034adb9938ad38f4be4ac191d632a6a11ad525574.jpg", title: "Ether IV" },
    { src: "https://cdn.21st.dev/assets/mirror/ac/ac5ac700b188d7ef16ee9dab868098b59f15c440db3f71d4e8c03262a3287577.jpg", title: "Quantum V" },
    { src: "https://cdn.21st.dev/assets/mirror/ef/ef25eff6ce655fba459b3b7e7711524dc92499aa18f6c7dbea9a0fcc56a8f908.jpg", title: "Nebula VI" },
    { src: "https://cdn.21st.dev/assets/mirror/f2/f28b370a5dcbf76240f1504579c4b05fc0ff0bb990a42aff8dc2f73a5dc46072.jpg", title: "Cyber VII" },
    { src: "https://cdn.21st.dev/assets/mirror/f2/f26a1eac85704dda924820392dedfb72d51d8261d35354f83b35d683617295f3.jpg", title: "Flux VIII" },
    { src: "https://cdn.21st.dev/assets/mirror/77/7755d23eaaa0aa5b403343f44afa7a29b2d06d3065fe54c602b14ba01d00f2aa.jpg", title: "Aether IX" },
    { src: "https://cdn.21st.dev/assets/mirror/65/657317761fe9058a1d43711b13c543a71eb5199b7a5d9abf4c28479674e39cf7.jpg", title: "Chroma X" },
  ]

  const tunnel = document.getElementById("tunnel")
  const plane = document.getElementById("plane")
  const title = document.getElementById("title")
  const prompt = document.getElementById("prompt")
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // ---- helpers --------------------------------------------------------------
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

  // piecewise-linear map, clamped at both ends (like framer-motion's useTransform)
  function interp(v, input, output) {
    if (v <= input[0]) return output[0]
    for (let i = 1; i < input.length; i++) {
      if (v <= input[i]) {
        const t = (v - input[i - 1]) / (input[i] - input[i - 1] || 1)
        return output[i - 1] + (output[i] - output[i - 1]) * t
      }
    }
    return output[output.length - 1]
  }

  // a damped spring that chases a target value
  function spring(stiffness, damping, mass) {
    return { value: 0, velocity: 0, target: 0, stiffness, damping, mass }
  }
  function stepSpring(s, dt) {
    const force = -s.stiffness * (s.value - s.target) - s.damping * s.velocity
    s.velocity += (force / s.mass) * dt
    s.value += s.velocity * dt
  }

  // ---- cards ------------------------------------------------------------------
  const cards = IMAGES.map((item, i) => {
    const goldenAngle = i * 137.5 * (Math.PI / 180)
    const el = document.createElement("div")
    el.className = "card"
    el.style.zIndex = String(i + 1)
    const inner = document.createElement("div")
    inner.className = "card-inner"
    const img = document.createElement("img")
    img.src = item.src
    img.alt = item.title
    img.draggable = false
    const label = document.createElement("div")
    label.className = "card-label"
    const span = document.createElement("span")
    span.textContent = item.title
    label.append(span)
    inner.append(img, label)
    el.append(inner)
    plane.append(el)
    return {
      el,
      index: i,
      angleCos: Math.cos(goldenAngle),
      angleSin: Math.sin(goldenAngle),
      radiusFactorX: 0.28 + (i % 3) * 0.08,
      radiusFactorY: 0.26 + (i % 2) * 0.09,
      rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
    }
  })

  // ---- stage size -------------------------------------------------------------
  let stage = { width: 0, height: 0, isMobile: false }
  function measure() {
    const width = window.innerWidth
    const height = window.innerHeight
    const isMobile = width < 768
    const cardWidth = isMobile
      ? Math.max(130, Math.min(180, width * 0.38))
      : Math.max(180, Math.min(270, width * 0.18))
    stage = { width, height, isMobile }
    tunnel.style.perspective = isMobile ? "900px" : "1200px"
    for (const c of cards) c.el.style.width = cardWidth + "px"
  }

  // ---- input --------------------------------------------------------------------
  const progress = spring(80, 30, 1)
  const panX = spring(60, 25, 0.5)
  const panY = spring(60, 25, 0.5)

  // wheel moves through the tunnel without scrolling the page
  tunnel.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault()
      progress.target = clamp(progress.target + e.deltaY * 0.0008, 0, 1)
      wake()
    },
    { passive: false },
  )

  // swipe up / down on touch screens does the same
  let touchY = null
  tunnel.addEventListener("touchstart", (e) => (touchY = e.touches[0].clientY), { passive: true })
  tunnel.addEventListener(
    "touchmove",
    (e) => {
      if (touchY === null) return
      const y = e.touches[0].clientY
      progress.target = clamp(progress.target + (touchY - y) * 0.0025, 0, 1)
      touchY = y
      wake()
    },
    { passive: true },
  )
  tunnel.addEventListener("touchend", () => (touchY = null))

  // the cursor pans the camera a little
  if (!reduce) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return
        panX.target = (e.clientX / window.innerWidth - 0.5) * 2
        panY.target = (e.clientY / window.innerHeight - 0.5) * 2
        wake()
      },
      { passive: true },
    )
  }

  // ---- render loop ----------------------------------------------------------------
  const STAGGER = 0.55
  let running = false
  let last = 0

  function render() {
    const p = progress.value
    title.style.transform = "scale(" + interp(p, [0, 0.5, 1], [0.7, 1, 1.35]) + ")"
    title.style.opacity = interp(p, [0, 0.12, 0.85, 1], [0.25, 1, 1, 0])
    prompt.style.opacity = interp(p, [0, 0.12], [1, 0])

    const farZ = stage.isMobile ? -1200 : -1700
    const nearZ = stage.isMobile ? 350 : 500
    const pan = stage.isMobile ? 20 : 45

    for (const c of cards) {
      const start = (c.index / cards.length) * (1 - STAGGER)
      const local = interp(p, [start, start + STAGGER], [0, 1])
      const z = farZ + (nearZ - farZ) * local
      const x = c.angleCos * stage.width * c.radiusFactorX - panX.value * pan
      const y = c.angleSin * stage.height * c.radiusFactorY - panY.value * pan
      c.el.style.opacity = interp(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0])
      c.el.style.transform =
        "translate3d(calc(-50% + " + x + "px), calc(-50% + " + y + "px), " + z + "px) rotateZ(" + c.rotationZ + "deg)"
      // hidden cards should not catch the cursor
      c.el.style.visibility = local <= 0 || local >= 0.98 ? "hidden" : "visible"
    }
  }

  function frame(now) {
    // fixed small steps keep the springs stable whatever the frame rate
    let dt = Math.min(0.05, (now - last) / 1000)
    last = now
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240)
      stepSpring(progress, h)
      stepSpring(panX, h)
      stepSpring(panY, h)
      dt -= h
    }
    render()
    const springs = [progress, panX, panY]
    const settled = springs.every((s) => Math.abs(s.value - s.target) < 1e-4 && Math.abs(s.velocity) < 1e-4)
    if (settled) {
      for (const s of springs) {
        s.value = s.target
        s.velocity = 0
      }
      render()
      running = false
    } else requestAnimationFrame(frame)
  }

  function wake() {
    if (running) return
    running = true
    last = performance.now()
    requestAnimationFrame(frame)
  }

  measure()
  render()
  window.addEventListener("resize", () => {
    measure()
    render()
  })
})()
