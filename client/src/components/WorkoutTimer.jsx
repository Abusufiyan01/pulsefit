import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { formatTimer } from '../utils/format'

// Web Audio API beep synthesizer
function playBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (e) {
    console.warn('Audio beep error', e)
  }
}

export function WorkoutTimer({
  initialSeconds = 60,
  autoStart = false,
  onComplete,
  className = '',
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isMuted, setIsMuted] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    setSecondsLeft(initialSeconds)
    if (autoStart) setIsRunning(true)
  }, [initialSeconds, autoStart])

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsRunning(false)
            if (!isMuted) {
              playBeep()
            }
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([200, 100, 200])
            }
            if (onComplete) onComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timerRef.current)
  }, [isRunning, secondsLeft, isMuted, onComplete])

  const toggleRun = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(initialSeconds)
      setIsRunning(true)
    } else {
      setIsRunning((prev) => !prev)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSecondsLeft(initialSeconds)
  }

  const addTime = (secs) => {
    setSecondsLeft((prev) => Math.max(0, prev + secs))
  }

  const percentage = initialSeconds > 0 ? (secondsLeft / initialSeconds) * 100 : 0

  return (
    <div
      className={`p-3 bg-surface border border-border rounded-xl flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold font-mono text-current">
          {formatTimer(secondsLeft)}
        </div>
        <span className="text-xs text-muted font-medium">Rest Timer</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => addTime(15)}
          className="p-1.5 rounded-lg bg-bg-card hover:bg-border text-muted hover:text-current text-xs font-bold transition-colors"
          title="Add 15 seconds"
        >
          +15s
        </button>

        <button
          type="button"
          onClick={toggleRun}
          className={`p-2 rounded-lg text-white font-semibold transition-all ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-primary-500 hover:bg-primary-600'
          }`}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-2 rounded-lg bg-bg-card hover:bg-border text-muted hover:text-current transition-colors"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsMuted((m) => !m)}
          className="p-2 rounded-lg text-muted hover:text-current transition-colors"
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default WorkoutTimer
