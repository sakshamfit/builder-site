"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { readReducedMotion, subscribeReducedMotion } from "@/lib/playback";
import styles from "./cinematic.module.css";

/**
 * The guided tour — `/?showcase=1`.
 *
 * Ported from `components/showcase-controller.tsx` in the owner's
 * `gireeshkumarreddy/pk` repository (ASSET_CREDITS.md §11): the page scrolls
 * itself through every scene in under a minute, on a path of cue points joined
 * by monotone cubic interpolation so the speed never jumps between sections,
 * and it can record the browser tab for a presentation. It is for showing the
 * site to someone, not for visitors: it only exists behind the query string,
 * it stops on the first wheel, touch or Escape, and it does not run at all for
 * a reader who asks for reduced motion — a page that scrolls itself is motion.
 */

const DURATION = 55;
type Cue = { time: number; y: number };

function cuePath(): Cue[] {
  const h = window.innerHeight;
  const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 62;
  const max = document.documentElement.scrollHeight - h;
  const top = (element: Element | null) => (element ? element.getBoundingClientRect().top + window.scrollY : null);
  const scene = (name: string) => document.querySelector<HTMLElement>(`[data-scene="${name}"]`);

  const cues: Cue[] = [
    { time: 0, y: 0 },
    { time: 3, y: 0 },
  ];

  const journey = scene("journey");
  if (journey) {
    const start = (top(journey) ?? 0) - headerH;
    const end = (top(journey) ?? 0) + journey.offsetHeight - h;
    const span = end - start;
    cues.push(
      { time: 7, y: start + span * 0.05 },
      { time: 11, y: start + span * 0.24 },
      { time: 15, y: start + span * 0.4 },
      { time: 18, y: start + span * 0.57 },
      { time: 21, y: start + span * 0.74 },
      { time: 24, y: end },
    );
  }
  const wide = scene("wide");
  if (wide) cues.push({ time: 26, y: top(wide) ?? 0 }, { time: 29.5, y: (top(wide) ?? 0) + h * 0.3 });
  const world = scene("world");
  if (world) cues.push({ time: 34, y: (top(world) ?? 0) + world.offsetHeight - h });
  const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-j="chapter"]'));
  chapters.forEach((chapter, index) => cues.push({ time: 36.5 + index * 3.5, y: (top(chapter) ?? 0) - headerH - 24 }));
  const programme = document.getElementById("programme");
  if (programme) cues.push({ time: 48, y: (top(programme) ?? 0) - headerH });
  const end = scene("end");
  cues.push({ time: DURATION, y: end ? Math.min(max, top(end) ?? max) : max });

  /* Never backwards, never past the end of the page. */
  return cues.map((cue, index) => ({
    ...cue,
    y: Math.max(index ? cues[index - 1].y : 0, Math.min(max, cue.y)),
  }));
}

/* Monotone cubic interpolation keeps the velocity continuous across scenes. */
function position(cues: Cue[], t: number): number {
  const slopes = cues.slice(1).map((cue, i) => (cue.y - cues[i].y) / (cue.time - cues[i].time));
  const tangents = cues.map((_, i) => {
    if (!i || i === cues.length - 1) return 0;
    const a = slopes[i - 1];
    const b = slopes[i];
    return a > 0 && b > 0 ? (2 * a * b) / (a + b) : 0;
  });
  const i = Math.max(0, Math.min(cues.length - 2, cues.findIndex((cue) => cue.time >= t) - 1));
  const a = cues[i];
  const b = cues[i + 1];
  const dt = b.time - a.time;
  const u = Math.min(1, Math.max(0, (t - a.time) / dt));
  return (
    (2 * u ** 3 - 3 * u * u + 1) * a.y +
    (u ** 3 - 2 * u * u + u) * dt * tangents[i] +
    (-2 * u ** 3 + 3 * u * u) * b.y +
    (u ** 3 - u * u) * dt * tangents[i + 1]
  );
}

type Status = "preparing" | "running" | "done" | "stopped" | "unavailable";

export function ShowcaseTour({ brandName }: { brandName: string }) {
  /* The server cannot know; it renders the controls, and the client corrects it. */
  const reduced = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const [status, setStatus] = useState<Status>("preparing");
  const [message, setMessage] = useState("");
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const frame = useRef(0);
  const waitTimer = useRef<number | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const objectUrl = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (waitTimer.current) window.clearTimeout(waitTimer.current);
    window.cancelAnimationFrame(frame.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
    setStatus((value) => (value === "running" || value === "preparing" ? "stopped" : value));
  }, []);

  const begin = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    ScrollTrigger.refresh();
    setStatus("running");
    setMessage("");
    if (recorder.current?.state === "inactive" && stream.current?.active) recorder.current.start(1000);
    const cues = cuePath();
    const started = performance.now();
    window.cancelAnimationFrame(frame.current);
    const tick = (now: number) => {
      const seconds = Math.min(DURATION, (now - started) / 1000);
      window.scrollTo({ top: position(cues, seconds), behavior: "instant" });
      if (seconds < DURATION) frame.current = window.requestAnimationFrame(tick);
      else {
        if (recorder.current?.state === "recording") recorder.current.stop();
        setStatus("done");
      }
    };
    frame.current = window.requestAnimationFrame(tick);
  }, []);

  const play = useCallback(() => {
    if (waitTimer.current) window.clearTimeout(waitTimer.current);
    window.cancelAnimationFrame(frame.current);
    setStatus("preparing");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "instant" });
    const requested = performance.now();
    /* Start on a film that is actually moving, or after a short wait on its poster. */
    const ready = () => {
      const opening = document.querySelector<HTMLElement>('[data-media][data-priority="true"]');
      if (opening?.dataset.playing === "true" || performance.now() - requested > 6000) {
        begin();
        return;
      }
      waitTimer.current = window.setTimeout(ready, 200);
    };
    ready();
  }, [begin]);

  useEffect(() => {
    if (reduced) return;
    const root = document.documentElement;
    root.classList.add("showcase-mode");
    /* Begin on the next frame, once the page has painted its first screen. */
    const opening = window.requestAnimationFrame(() => play());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    return () => {
      window.cancelAnimationFrame(opening);
      if (waitTimer.current) window.clearTimeout(waitTimer.current);
      window.cancelAnimationFrame(frame.current);
      root.classList.remove("showcase-mode");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, [play, stop, reduced]);

  async function record() {
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") {
      setMessage("Recording needs desktop Chrome or Edge. The tour still plays here.");
      return;
    }
    stop();
    try {
      setMessage("Choose this tab in the sharing window. Recording starts with the tour.");
      const options = {
        video: { frameRate: { ideal: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      } as DisplayMediaStreamOptions;
      const capture = await navigator.mediaDevices.getDisplayMedia(options);
      stream.current = capture;
      const mime = ["video/mp4;codecs=avc1.42E01E", "video/webm;codecs=vp9", "video/webm;codecs=vp8"].find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recording = new MediaRecorder(capture, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 16_000_000 });
      recorder.current = recording;
      const chunks: BlobPart[] = [];
      recording.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recording.onstop = () => {
        capture.getTracks().forEach((track) => track.stop());
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        const type = recording.mimeType;
        const url = URL.createObjectURL(new Blob(chunks, { type }));
        objectUrl.current = url;
        const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        setDownload({ url, name: `${slug}-tour.${type.includes("mp4") ? "mp4" : "webm"}` });
      };
      capture.getVideoTracks()[0]?.addEventListener("ended", stop, { once: true });
      play();
    } catch (error) {
      setMessage(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Recording cancelled. The tour can be replayed at any time."
          : "This browser could not start recording. The tour can still be replayed.",
      );
    }
  }

  const shown: Status = reduced ? "unavailable" : status;
  const note = reduced
    ? "The tour scrolls the page by itself, so it stays off when your device asks for reduced motion."
    : message;

  const label: Record<Status, string> = {
    preparing: "Tour — starting",
    running: "Tour — playing",
    done: "Tour — finished",
    stopped: "Tour — stopped",
    unavailable: "Tour — off",
  };

  return (
    <div
      className={[styles.tour, shown === "running" ? styles.tourRunning : ""].filter(Boolean).join(" ")}
      data-overlay=""
      role="region"
      aria-label="Guided tour controls"
    >
      <span role="status">{label[shown]}</span>
      {shown !== "unavailable" ? (
        <>
          <button type="button" onClick={play}>
            Replay
          </button>
          {shown === "running" || shown === "preparing" ? (
            <button type="button" onClick={stop}>
              Stop
            </button>
          ) : null}
          <button type="button" onClick={record}>
            Record the tab
          </button>
        </>
      ) : null}
      {download ? (
        <a href={download.url} download={download.name}>
          Download the recording
        </a>
      ) : null}
      <Link href="/">Leave the tour</Link>
      {note ? <p className={styles.tourMessage}>{note}</p> : null}
    </div>
  );
}
