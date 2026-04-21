'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { X, Gift, CheckCircle, AlertCircle } from 'lucide-react'

interface FreeBetPopupProps {
  isOpen: boolean
  onClose: () => void
  preSelectedRoom?: number | null
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('hide_session_id')
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem('hide_session_id', id)
  }
  return id
}

export function FreeBetPopup({ isOpen, onClose, preSelectedRoom }: FreeBetPopupProps) {
  const {
    rooms,
    placeFreeBet,
    hasPlacedFreeBet,
    getFreeBetCountForRoom,
    gamePhase,
    updatePlayerPosition,
  } = useGame()

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'already'>('idle')
  const [sessionId, setSessionId] = useState('')

  useEffect(() => { setSessionId(getOrCreateSessionId()) }, [])

  useEffect(() => {
    if (isOpen && preSelectedRoom) setSelectedRoom(preSelectedRoom)
  }, [isOpen, preSelectedRoom])

  const alreadyBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  const bettableRooms = rooms

  const handlePlaceBet = async () => {
    if (!sessionId || !selectedRoom) return
    if (alreadyBet) { setStatus('already'); return }
    const success = await placeFreeBet(selectedRoom, sessionId)
    if (success) {
      await updatePlayerPosition(sessionId, selectedRoom)
      setStatus('success')
      setTimeout(() => onClose(), 1500)
    } else {
      setStatus('already')
    }
  }

  const handleClose = () => {
    setStatus('idle')
    setSelectedRoom(null)
    onClose()
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
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            className="relative w-[460px] max-w-[92vw] bg-white border-[3px] border-ink shadow-doodle-lg"
            initial={{ scale: 0.95, rotate: -1, y: 12 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.95, rotate: 1, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            <div className="bg-white border-b-[3px] border-ink px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 border-2 border-ink bg-white flex items-center justify-center">
                  <Gift className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h2 className="font-bang text-2xl text-ink tracking-wider leading-none">FREE GUESS</h2>
                  <p className="font-hand text-sm text-ink/70 mt-0.5">survive → 0.01 SOL devbuy</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center hover:bg-ink hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="border-[3px] border-ink bg-white p-3 mb-4">
                <p className="font-bang text-ink text-base mb-1 tracking-wide">THE RULEZ:</p>
                <p className="font-hand text-sm text-ink/80 leading-snug">
                  pick a room. it costs nothing. if unc skips your room you survive and <strong className="text-ink">0.01 SOL</strong> auto-buys the token.
                </p>
                <p className="font-hand text-xs text-ink/70 mt-2 border-t-2 border-dashed border-ink/30 pt-2">
                  1 guess per round. no take-backsies.
                </p>
              </div>

              {alreadyBet && (
                <div className="flex items-center gap-2 border-2 border-ink bg-white p-3 mb-4">
                  <CheckCircle className="w-4 h-4 text-ink flex-shrink-0" />
                  <span className="font-hand text-sm text-ink">u already copiumed this round</span>
                </div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 border-2 border-ink bg-ink text-white p-3 mb-4"
                >
                  <span className="font-bang text-lg">HOPIUM LOGGED. PRAY.</span>
                </motion.div>
              )}

              {!alreadyBet && status !== 'success' && (
                <>
                  {preSelectedRoom ? (
                    <>
                      {(() => {
                        const room = rooms.find(r => r.id === preSelectedRoom)
                        const freeCount = room ? getFreeBetCountForRoom(room.id) : 0
                        return room ? (
                          <div className="mb-4 p-3 border-[3px] border-ink bg-white flex items-center gap-3">
                            <span className="w-11 h-11 border-2 border-ink bg-white font-bang text-ink text-xl flex items-center justify-center">
                              {room.id}
                            </span>
                            <div>
                              <p className="font-bang text-ink text-lg leading-none">{room.name}</p>
                              {freeCount > 0 && (
                                <p className="font-hand text-sm text-ink/70">{freeCount} copers already here 😭</p>
                              )}
                            </div>
                          </div>
                        ) : null
                      })()}

                      <button
                        onClick={handlePlaceBet}
                        disabled={gamePhase !== 'betting'}
                        className={`w-full py-3 border-[3px] border-ink font-bang text-xl tracking-wider transition-all ${
                          gamePhase === 'betting'
                            ? 'bg-white text-ink shadow-doodle hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white'
                            : 'bg-paper text-ink/50 cursor-not-allowed'
                        }`}
                      >
                        {gamePhase !== 'betting' ? 'TOO LATE' : `LOCK IN ROOM #${preSelectedRoom}`}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-hand text-sm text-ink/80 mb-3">pick your hiding spot:</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {bettableRooms.map(room => {
                          const freeCount = getFreeBetCountForRoom(room.id)
                          const isSelected = selectedRoom === room.id
                          return (
                            <button
                              key={room.id}
                              onClick={() => setSelectedRoom(room.id)}
                              className={`relative p-2 border-[3px] border-ink text-left transition-all ${
                                isSelected
                                  ? 'bg-ink text-white shadow-doodle'
                                  : 'bg-white text-ink hover:bg-paper'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 border-2 border-ink bg-white flex items-center justify-center font-bang text-ink text-xs">
                                  {room.id}
                                </span>
                                <span className="font-bang text-sm tracking-wide">{room.name}</span>
                              </div>
                              {freeCount > 0 && (
                                <span className="absolute top-1 right-1 font-hand text-xs opacity-70">{freeCount} 😭</span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={handlePlaceBet}
                        disabled={!selectedRoom || gamePhase !== 'betting'}
                        className={`w-full py-3 border-[3px] border-ink font-bang text-xl tracking-wider transition-all ${
                          selectedRoom && gamePhase === 'betting'
                            ? 'bg-white text-ink shadow-doodle hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white'
                            : 'bg-paper text-ink/50 cursor-not-allowed'
                        }`}
                      >
                        {gamePhase !== 'betting' ? 'TOO LATE' : !selectedRoom ? 'PICK A ROOM' : 'LOCK IN COPE'}
                      </button>
                    </>
                  )}
                </>
              )}

              {status === 'already' && (
                <div className="flex items-center gap-2 border-2 border-ink bg-ink text-white p-3 mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-hand text-sm">ONE GUESS PER NIGHTMARE</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
