'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Database, Clock } from 'lucide-react'

interface HowItWorksPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function HowItWorksPopup({ isOpen, onClose }: HowItWorksPopupProps) {
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
            initial={{ opacity: 0, scale: 0.95, rotate: 1, y: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, rotate: -1, y: 20 }}
            className="relative w-full max-w-2xl bg-white border-[3px] border-ink shadow-doodle-lg p-6 font-hand"
          >
            <div className="flex justify-between items-start mb-6 border-b-[3px] border-ink pb-3">
              <h2 className="font-bang text-3xl text-ink tracking-wider leading-none">
                HOW IT ACTUALLY WORKS
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
                  <Database className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-bang text-ink text-lg tracking-wide mb-1">1. POSTGRES / SUPABASE</h3>
                  <p className="font-hand text-sm text-ink/80 leading-snug">
                    every bet, unc&apos;s position, room state, kill order — all locked in a Postgres DB via Supabase. no client tricks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-[3px] border-ink bg-white p-3">
                <div className="p-2 border-2 border-ink bg-white">
                  <Terminal className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-bang text-ink text-lg tracking-wide mb-1">2. REALTIME MULTIPLAYER</h3>
                  <p className="font-hand text-sm text-ink/80 leading-snug">
                    supabase realtime channels push live unc positions + kill steps to everyone at the same millisecond. the cope is synchronized.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-[3px] border-ink bg-white p-3">
                <div className="p-2 border-2 border-ink bg-white">
                  <Clock className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h3 className="font-bang text-ink text-lg tracking-wide mb-1">3. SERVER-SIDE AUTHORITY</h3>
                  <p className="font-hand text-sm text-ink/80 leading-snug">
                    unc&apos;s pathing, the surviving room RNG, and payout math live on protected API routes. your browser is just watching.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-[3px] border-ink flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 border-[3px] border-ink bg-white font-bang text-ink text-base shadow-doodle hover:-translate-y-0.5 hover:bg-ink hover:text-white transition"
              >
                COOL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
