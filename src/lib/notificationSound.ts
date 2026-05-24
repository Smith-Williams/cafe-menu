let audioCtx: AudioContext | null = null

/** Short premium double-chime for new orders (no external file). */
export function playNewOrderSound() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return

    if (!audioCtx) audioCtx = new Ctx()
    if (audioCtx.state === 'suspended') void audioCtx.resume()

    const now = audioCtx.currentTime
    const notes = [
      { freq: 880, start: 0, dur: 0.12 },
      { freq: 1174.66, start: 0.14, dur: 0.18 },
    ]

    for (const n of notes) {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = n.freq
      gain.gain.setValueAtTime(0.0001, now + n.start)
      gain.gain.exponentialRampToValueAtTime(0.22, now + n.start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now + n.start)
      osc.stop(now + n.start + n.dur + 0.05)
    }
  } catch {
    /* ignore if autoplay blocked */
  }
}
