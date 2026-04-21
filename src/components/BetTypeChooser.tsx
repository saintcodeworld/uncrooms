'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { X, Gift, Swords } from 'lucide-react'

interface BetTypeChooserProps {
  isOpen: boolean
  roomId: number | null
  onClose: () => void
  onChooseFreeBet: (roomId: number) => void
  onChooseGambling: (roomId: number) => void
}

export function BetTypeChooser({ isOpen, roomId, onClose, onChooseFreeBet, onChooseGambling }: BetTypeChooserProps) {
  const { rooms, hasPlacedFreeBet, getTotalGamblingBetsForRoom, getFreeBetCountForRoom } = useGame()

  if (!roomId) return null
  const room = rooms.find(r => r.id === roomId)
  if (!room) return null

  const gamblingTotal = getTotalGamblingBetsForRoom(roomId)
  const freeCount = getFreeBetCountForRoom(roomId)

  let alreadyFreeBet = false
  if (typeof window !== 'undefined') {
    const sessionId = localStorage.getItem('hide_session_id') || ''
    alreadyFreeBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center font-hand p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-[420px] max-w-[90vw] bg-white border-[3px] border-ink shadow-doodle-lg"
            initial={{ scale: 0.95, rotate: -2, y: 10 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.95, rotate: 2, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            <div className="bg-white border-b-[3px] border-ink px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bang text-2xl text-ink tracking-wider leading-none">
                  TARGET: {room.name}
                </h2>
                <p className="font-hand text-sm text-ink/70 mt-1">room #{room.id}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center hover:bg-ink hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 flex gap-3 border-b-[3px] border-ink">
              <div className="flex-1 border-2 border-ink bg-white px-3 py-2 text-center">
                <p className="font-hand text-xs text-ink/70">COPERS HIDING</p>
                <p className="font-bang text-xl text-ink leading-none">{freeCount} 😭</p>
              </div>
              <div className="flex-1 border-2 border-ink bg-white px-3 py-2 text-center">
                <p className="font-hand text-xs text-ink/70">COPE POOL</p>
                <p className="font-bang text-xl text-ink leading-none">{gamblingTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <button
                onClick={() => { onClose(); onChooseFreeBet(roomId) }}
                disabled={alreadyFreeBet}
                className={`group w-full p-3 text-left border-[3px] border-ink transition-all ${
                  alreadyFreeBet
                    ? 'bg-paper opacity-60 cursor-not-allowed'
                    : 'bg-white shadow-doodle hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-ink bg-white flex items-center justify-center">
                    <Gift className="w-5 h-5 text-ink" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bang text-lg leading-none">
                      {alreadyFreeBet ? 'COPE LOGGED' : 'FREE GUESS'}
                    </p>
                    <p className="font-hand text-xs mt-0.5 opacity-80">
                      {alreadyFreeBet ? 'wait for reveal' : 'survive → 0.01 SOL devbuy reward'}
                    </p>
                  </div>
                  {!alreadyFreeBet && <span className="stamp text-xs">FREE</span>}
                </div>
              </button>

              <button
                onClick={() => { onClose(); onChooseGambling(roomId) }}
                className="group w-full p-3 text-left border-[3px] border-ink bg-white shadow-doodle hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-ink bg-white flex items-center justify-center">
                    <Swords className="w-5 h-5 text-ink" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bang text-lg leading-none">APE SOL</p>
                    <p className="font-hand text-xs mt-0.5 opacity-80">real SOL, real cope, real gains</p>
                  </div>
                  <span className="stamp text-xs">SOL</span>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
