'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, Ghost, Trophy } from 'lucide-react'

interface HowToPlayPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function HowToPlayPopup({ isOpen, onClose }: HowToPlayPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: -1, y: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotate: 1, y: 20 }}
            className="relative w-full max-w-2xl bg-white border-[3px] border-ink shadow-doodle-lg p-6 font-hand"
          >
            <div className="flex justify-between items-start mb-6 border-b-[3px] border-ink pb-3">
              <h2 className="font-bang text-3xl text-ink tracking-wider leading-none">
                HOW 2 PLAY
              </h2>
              <button
                onClick={onClose}
                className="border-2 border-ink bg-white px-3 py-1 font-bang text-sm hover:bg-ink hover:text-white transition"
              >
                [X]
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 border-[3px] border-ink bg-white p-3">
                <div className="p-2 border-2 border-ink bg-white">
                  <Coins className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-bang text-ink text-lg tracking-wide mb-1">1. PICK A ROOM</h3>
                  <p className="font-hand text-sm text-ink/80 leading-snug">
                    7 rooms. 2 uncs. pick the <span className="font-bang">ONE</span> room unc skips.
                    free guess for fun, or ape real <span className="font-bang">SOL</span> for real cope.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-[3px] border-ink bg-white p-3">
                <div className="p-2 border-2 border-ink bg-white">
                  <Ghost className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-bang text-ink text-lg tracking-wide mb-1">2. UNC STRIKES</h3>
                  <p className="font-hand text-sm text-ink/80 leading-snug">
                    bets close. <span className="font-bang">2 uncs</span> start knocking. they clear <span className="font-bang">6 of 7</span> rooms.
                    exactly <span className="font-bang">1</span> room survives.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-[3px] border-ink bg-white p-3">
                <div className="p-2 border-2 border-ink bg-white">
                  <Trophy className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-bang text-ink text-lg tracking-wide mb-1">3. COLLECT COPE</h3>
                  <p className="font-hand text-sm text-ink/80 leading-snug">
                    picked right? winners split the full SOL pot proportionally.<br />
                    free-guess winners trigger a <span className="font-bang">0.01 SOL devbuy</span> on the token.
                  </p>
                </div>
              </div>

              <div className="border-[3px] border-ink bg-ink text-white p-4 text-center">
                <p className="font-hand text-sm opacity-80 mb-1">tl;dr:</p>
                <h1 className="font-bang text-5xl tracking-[0.2em] leading-none">
                  DON&apos;T DIE
                </h1>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-[3px] border-ink flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border-[3px] border-ink bg-white font-bang text-ink text-base shadow-doodle hover:-translate-y-0.5 hover:bg-ink hover:text-white transition"
              >
                GOT IT
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
