'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface UsernamePopupProps {
  isOpen: boolean
  onComplete: (username: string) => void
}

function WojakFace() {
  return (
    <svg viewBox="0 0 80 80" className="w-14 h-14" aria-label="wojak">
      <circle cx={40} cy={40} rx={30} ry={32} fill="#fbd4bc" stroke="#0d0d0d" strokeWidth="2.5" />
      <circle cx={40} cy={40} r={32} fill="#fbd4bc" stroke="#0d0d0d" strokeWidth="2.5" />
      <path d="M 14 36 Q 40 28 66 36" fill="none" stroke="#2a1a10" strokeWidth="2" opacity="0.5" />
      <circle cx={30} cy={40} r={2.6} fill="#0d0d0d" />
      <circle cx={50} cy={40} r={2.6} fill="#0d0d0d" />
      <circle cx={24} cy={48} r={3.5} fill="#ff7aa4" opacity="0.6" />
      <circle cx={56} cy={48} r={3.5} fill="#ff7aa4" opacity="0.6" />
      <path d="M 32 54 Q 40 50 48 54" fill="none" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx={28} cy={46} rx={1.3} ry={2.4} fill="#8fc8f2" stroke="#0d0d0d" strokeWidth="0.7" />
    </svg>
  )
}

export function UsernamePopup({ isOpen, onComplete }: UsernamePopupProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400)
  }, [isOpen])

  const handleSubmit = async () => {
    const trimmed = username.trim()
    if (trimmed.length < 2) { setError('at least 2 chars'); return }
    if (trimmed.length > 20) { setError('max 20 chars'); return }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) { setError('letters, numbers, _ and - only'); return }

    setError('')
    setIsSubmitting(true)

    try {
      let clientId = localStorage.getItem('hide_chat_id')
      if (!clientId) {
        clientId = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem('hide_chat_id', clientId)
      }

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, username: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || 'failed to save'); setIsSubmitting(false); return }

      localStorage.setItem('hide_username', trimmed)
      onComplete(trimmed)
    } catch (err) {
      setError('connection error, try again')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -2, y: 20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotate: 2, y: 20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-sm"
          >
            <div className="border-[3px] border-ink bg-white shadow-doodle-lg font-hand">
              <div className="px-6 pt-7 pb-4 flex flex-col items-center gap-3">
                <div className="border-[3px] border-ink bg-white p-2 shadow-doodle">
                  <WojakFace />
                </div>
                <div className="text-center">
                  <h2 className="font-bang text-2xl text-ink tracking-wider leading-none">
                    WHO IS U
                  </h2>
                  <p className="font-hand text-sm text-ink/70 mt-1">
                    pick a name. unc keeps the list.
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-3">
                <div className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError('') }}
                    onKeyDown={handleKeyDown}
                    placeholder="enter name..."
                    maxLength={20}
                    className="w-full bg-white border-[3px] border-ink text-ink font-hand text-lg px-4 py-3 placeholder:text-ink/30 focus:outline-none focus:bg-paper transition text-center"
                  />
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-ink" />
                      <span className="font-hand text-sm text-ink">{error}</span>
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || username.trim().length < 2}
                  className="w-full py-3 border-[3px] border-ink bg-white font-bang text-ink text-xl tracking-wider shadow-doodle hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                      ENTERING...
                    </motion.span>
                  ) : (
                    'ENTER UNC HOUSE'
                  )}
                </button>

                <p className="font-hand text-xs text-ink/50 text-center">
                  2-20 chars · letters, numbers, _ -
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
