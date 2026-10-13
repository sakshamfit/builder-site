"use client"

import { useEffect, useRef, useState } from "react"

// ─────────────────────────────────────────────────────────────
// THE CITY OPENS — locked scroll-scrub video hero
// While active, the page cannot move: body is pinned with
// position:fixed (plain overflow:hidden alone isn't reliable across
// browsers). Wheel / touch / arrow-key input drives video.currentTime,
// forward and backward.
//
// Site adaptation (differs from the original snippet):
//  • Pushing past the final frame releases the lock, fades the intro
//    out and calls `onEnter` so the parent can unmount it. The
//    original had no release path at all, which would trap visitors.
//  • A visible "Skip intro" button, and arrow/page keys, so keyboard
//    users and anyone who doesn't want to scrub can get in.
//  • Video error or no load within LOAD_TIMEOUT_MS also releases, so a
//    failed CDN never leaves the reader stuck behind the overlay.
//  • Reduced motion: the intro is not run at all (calls onEnter).
//  • Typography and accent use the site's own tokens (Anton, Barlow,
//    DM Sans, crimson) defined in app/globals.css.
// ─────────────────────────────────────────────────────────────

export interface MetroHeroProps {
  videoSrc?: string
  title?: string
  scrollHint?: string
  tagline?: string
  signature?: { name: string; url: string } | false
  /** Label of the skip control. Pass "" to hide it. */
  skipLabel?: string
  /** Total input distance (px) needed to scrub the full video. Tune to taste. */
  scrubDistance?: number
  /** Called once the intro has been scrubbed, pushed past and faded out. */
  onEnter?: () => void
  className?: string
  style?: React.CSSProperties
}

const DEFAULT_VIDEO = "https://cdn.21st.dev/assets/mirror/21/21a77eac28eacbb7e142016eefeaa0b4a766619e51113629a3bc6df6af066c0f.mp4"
const DEFAULT_SIGNATURE = { name: "guglielmogiannattasio.exe", url: "https://www.guglielmogiannattasio.it" }

const DISPLAY = "var(--font-display), 'Arial Narrow', Impact, sans-serif"
const LABEL = "var(--font-label), 'Arial Narrow', Arial, sans-serif"
const BODY = "var(--font-body), system-ui, -apple-system, sans-serif"

const COL_BG = "#05070d"
const COL_TEXT = "#f2f4f8"
const COL_RED = "#c1121f"

/** Extra scroll input needed past the final frame before the site opens. */
const EXIT_PUSH_PX = 360
/** If the video has not loaded by then, stop blocking the page. */
const LOAD_TIMEOUT_MS = 12000
const FADE_MS = 700
const END_HINT = "KEEP SCROLLING TO ENTER"

const KEY_DELTAS: Record<string, number> = {
  ArrowDown: 60,
  ArrowUp: -60,
  PageDown: 400,
  PageUp: -400,
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export default function MetroHero({
  videoSrc = DEFAULT_VIDEO,
  title = "MADHUBAN METRO",
  scrollHint = "SCROLL TO ENTER",
  tagline = "Every door in the city is already open.",
  signature = DEFAULT_SIGNATURE,
  skipLabel = "Skip intro",
  scrubDistance = 3200,
  onEnter,
  className,
  style,
}: MetroHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const hintStartRef = useRef<HTMLSpanElement>(null)
  const hintEndRef = useRef<HTMLSpanElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<(() => void) | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const videoEl = videoRef.current
    const sectionEl = sectionRef.current
    if (!videoEl || !sectionEl) return
    // Narrowed once, so the hoisted helpers below can use them without re-checking.
    const video: HTMLVideoElement = videoEl
    const section: HTMLDivElement = sectionEl

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    if (reduceMotion) {
      // No scrubbing for reduced-motion readers: nothing to lock, go straight in.
      onEnter?.()
      return
    }

    let duration = 0
    let rafId = 0
    let targetProgress = 0
    let currentProgress = 0
    let hasStartedScrolling = false
    let isSeeking = false
    let pendingTime: number | null = null
    let locked = false
    let lockedScrollY = 0
    let touchStartY = 0
    let released = false
    let atEnd = false
    let overscroll = 0
    let fadeTimer = 0
    let loadTimer = 0

    const onLoadedData = () => {
      duration = video.duration || 0
      window.clearTimeout(loadTimer)
      setReady(true)
    }
    video.addEventListener("loadeddata", onLoadedData)

    const onVideoError = () => release()
    video.addEventListener("error", onVideoError)

    // The clip is server-rendered and starts downloading before hydration, so
    // it can finish buffering before this effect attaches its listener. Read
    // the current state first, or duration would stay 0 and nothing would scrub.
    if (video.error) {
      release()
    } else if (video.readyState >= 2) {
      onLoadedData()
    } else {
      loadTimer = window.setTimeout(() => {
        if (duration === 0) release()
      }, LOAD_TIMEOUT_MS)
    }

    // iOS Safari often won't buffer any video data — even with
    // preload="auto" — until playback actually starts, to save mobile
    // data. Since we only ever seek (never call play() elsewhere), the
    // video can stay permanently blank on iPhone. Force a silent
    // play-then-immediately-pause on mount to kick off real loading.
    const kickstartLoad = () => {
      const p = video.play()
      if (p && typeof p.then === "function") {
        p.then(() => video.pause()).catch(() => {})
      } else {
        video.pause()
      }
    }
    kickstartLoad()

    const onSeeked = () => {
      isSeeking = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        isSeeking = true
        video.currentTime = t
      }
    }
    video.addEventListener("seeked", onSeeked)

    function seekTo(t: number) {
      if (isSeeking) {
        pendingTime = t
        return
      }
      isSeeking = true
      video.currentTime = t
    }

    // Locked until the reader pushes past the end of the film.
    function engageLock() {
      if (locked || typeof document === "undefined") return
      locked = true
      lockedScrollY = window.scrollY
      const b = document.body.style
      b.position = "fixed"
      b.top = `-${lockedScrollY}px`
      b.left = "0"
      b.right = "0"
      b.width = "100%"
      b.height = "100%"
      b.overscrollBehavior = "none"
    }

    function releaseLock() {
      if (!locked || typeof document === "undefined") return
      locked = false
      const y = lockedScrollY
      const b = document.body.style
      b.position = ""
      b.top = ""
      b.left = ""
      b.right = ""
      b.width = ""
      b.height = ""
      b.overscrollBehavior = ""
      window.scrollTo(0, y)
    }

    /** One-way: unlock, fade the intro away, then tell the parent. */
    function release() {
      if (released) return
      released = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(loadTimer)
      releaseLock()
      section.style.transition = `opacity ${FADE_MS}ms ease`
      section.style.opacity = "0"
      section.style.pointerEvents = "none"
      fadeTimer = window.setTimeout(() => onEnter?.(), FADE_MS)
    }
    skipRef.current = release

    engageLock()

    function addDelta(deltaY: number) {
      const next = clamp(targetProgress + deltaY / scrubDistance, 0, 1)
      targetProgress = next
      if (targetProgress > 0.001) hasStartedScrolling = true
    }

    /** All forward/back input funnels through here. */
    function handleInput(deltaY: number) {
      if (released) return
      if (atEnd && deltaY > 0) {
        // Film is finished: keep pushing forward to walk into the site.
        overscroll += deltaY
        if (overscroll >= EXIT_PUSH_PX) release()
        return
      }
      overscroll = 0
      addDelta(deltaY)
    }

    const onWheel = (e: WheelEvent) => {
      if (released) return
      handleInput(e.deltaY)
      e.preventDefault()
    }

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0
    }
    const onTouchMove = (e: TouchEvent) => {
      if (released) return
      const y = e.touches[0]?.clientY ?? touchStartY
      const deltaY = touchStartY - y
      touchStartY = y
      handleInput(deltaY)
      e.preventDefault()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (released) return
      const delta = KEY_DELTAS[e.key]
      if (delta === undefined) return
      e.preventDefault()
      handleInput(delta)
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("keydown", onKeyDown)
    // Also bind directly on the element itself, with capture — on some
    // iOS versions a window-level listener alone can lose the race
    // against the browser's own native scroll handling.
    section.addEventListener("touchstart", onTouchStart, { passive: true, capture: true })
    section.addEventListener("touchmove", onTouchMove, { passive: false, capture: true })

    let lastHintEnd = false

    function frame() {
      currentProgress += (targetProgress - currentProgress) * 0.18
      atEnd = targetProgress >= 0.999 && currentProgress >= 0.985

      if (duration > 0) {
        seekTo(currentProgress * duration)
      }

      if (videoRef.current) {
        const scale = 1 + currentProgress * 0.06
        videoRef.current.style.transform = `scale(${scale})`
      }
      if (titleRef.current) {
        const t = 1 - clamp(currentProgress / 0.35, 0, 1)
        titleRef.current.style.opacity = String(t)
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`
        titleRef.current.style.filter = `blur(${(1 - t) * 10}px)`
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = !hasStartedScrolling || atEnd ? "1" : "0"
      }
      if (atEnd !== lastHintEnd) {
        lastHintEnd = atEnd
        if (hintStartRef.current) hintStartRef.current.style.opacity = atEnd ? "0" : "1"
        if (hintEndRef.current) hintEndRef.current.style.opacity = atEnd ? "1" : "0"
      }
      if (taglineRef.current) {
        // Mirrors the title's blur-focus treatment, timed as the payoff
        // once the reveal is nearly complete — not a background afterthought.
        const t = clamp((currentProgress - 0.82) / 0.18, 0, 1)
        taglineRef.current.style.opacity = String(t)
        taglineRef.current.style.transform = `translateY(${(1 - t) * 20}px) scale(${0.97 + t * 0.03})`
        taglineRef.current.style.filter = `blur(${(1 - t) * 8}px)`
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${currentProgress})`
      }

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      released = true
      video.removeEventListener("loadeddata", onLoadedData)
      video.removeEventListener("error", onVideoError)
      video.removeEventListener("seeked", onSeeked)
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("keydown", onKeyDown)
      section.removeEventListener("touchstart", onTouchStart, true)
      section.removeEventListener("touchmove", onTouchMove, true)
      window.clearTimeout(loadTimer)
      window.clearTimeout(fadeTimer)
      cancelAnimationFrame(rafId)
      skipRef.current = null
      releaseLock()
    }
    // onEnter is expected to be a stable callback (useCallback) from the parent.
  }, [scrubDistance, onEnter])

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        position: "relative",
        height: "100dvh",
        width: "100%",
        overflow: "hidden",
        background: COL_BG,
        touchAction: "none",
        ...style,
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: ready ? 1 : 0,
          transformOrigin: "center center",
          willChange: "transform",
          transition: "opacity 0.6s ease",
          touchAction: "none",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,7,13,0.45), rgba(5,7,13,0.05) 30%, rgba(5,7,13,0.25) 70%, rgba(5,7,13,0.7))",
          pointerEvents: "none",
        }}
      />

      <div
        ref={titleRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6%",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY,
            fontWeight: 400,
            fontSize: "clamp(48px, 13vw, 200px)",
            lineHeight: 0.92,
            letterSpacing: "0.005em",
            textTransform: "uppercase",
            color: COL_TEXT,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            display: "inline-block",
            willChange: "transform, filter, opacity",
          }}
        >
          {title}
        </span>
      </div>

      {tagline && (
        <div
          ref={taglineRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8%",
            textAlign: "center",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: "clamp(20px, 3.4vw, 40px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: COL_TEXT,
              textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            {tagline}
          </span>
        </div>
      )}

      <div
        ref={hintRef}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(40px, 9vh, 72px)",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "rgba(242,244,248,0.85)",
          fontFamily: LABEL,
          fontSize: "clamp(11px, 1.4vw, 13px)",
          fontWeight: 600,
          letterSpacing: "0.3em",
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      >
        {/* Both labels share one grid cell so the swap never shifts the layout. */}
        <div style={{ display: "grid", justifyItems: "center" }}>
          <span
            ref={hintStartRef}
            style={{ gridArea: "1 / 1", transition: "opacity 0.3s ease", whiteSpace: "nowrap" }}
          >
            {scrollHint}
          </span>
          <span
            ref={hintEndRef}
            style={{ gridArea: "1 / 1", opacity: 0, transition: "opacity 0.3s ease", whiteSpace: "nowrap" }}
          >
            {END_HINT}
          </span>
        </div>
        <svg width="14" height="18" viewBox="0 0 14 18" style={{ animation: "metro-hero-bounce 1.6s ease-in-out infinite" }}>
          <style>{`
            @keyframes metro-hero-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.5; }
              50% { transform: translateY(5px); opacity: 1; }
            }
          `}</style>
          <path d="M7 1 L7 17 M2 12 L7 17 L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {skipLabel && (
        <button
          type="button"
          onClick={() => skipRef.current?.()}
          style={{
            position: "absolute",
            top: "clamp(16px, 3vh, 28px)",
            right: "clamp(12px, 2.5vw, 24px)",
            pointerEvents: "auto",
            appearance: "none",
            border: "1px solid rgba(242,244,248,0.45)",
            background: "rgba(5,7,13,0.35)",
            color: COL_TEXT,
            fontFamily: LABEL,
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            padding: "8px 14px",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          {skipLabel} <span aria-hidden="true">→</span>
        </button>
      )}

      {/* Thin progress line — fills as the video advances. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          background: "rgba(255,255,255,0.12)",
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "100%",
            background: `linear-gradient(90deg, ${COL_RED}, rgba(255,255,255,0.95))`,
            transform: "scaleX(0)",
            transformOrigin: "left center",
          }}
        />
      </div>

      {signature && (
        <span
          style={{
            position: "absolute",
            right: "clamp(12px, 2.5vw, 24px)",
            bottom: "clamp(10px, 2vw, 18px)",
            fontFamily: LABEL,
            fontWeight: 500,
            fontSize: "clamp(11px, 1.4vw, 13px)",
            letterSpacing: "0.01em",
            color: "rgba(220,224,232,0.6)",
            zIndex: 2,
          }}
        >
          by{" "}
          <a
            href={signature.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "rgba(220,224,232,0.6)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.color = COL_TEXT
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.color = "rgba(220,224,232,0.6)"
            }}
          >
            {signature.name}
          </a>
        </span>
      )}
    </div>
  )
}
