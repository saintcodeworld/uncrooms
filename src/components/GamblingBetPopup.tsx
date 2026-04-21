'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '@/context/GameContext'
import { sendGamblingBetTransaction } from '@/utils/devbuy'
import { X, Swords, Coins, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'

interface GamblingBetPopupProps {
  isOpen: boolean
  onClose: () => void
  preSelectedRoom?: number | null
}

export function GamblingBetPopup({ isOpen, onClose, preSelectedRoom }: GamblingBetPopupProps) {
  const { publicKey, signTransaction } = useWallet()
  const {
    rooms,
    placeGamblingBet,
    getTotalGamblingBetsForRoom,
    getTotalPot,
    getMyGamblingBets,
    gamePhase,
    updatePlayerPosition,
  } = useGame()

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('0.1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  React.useEffect(() => {
    if (isOpen && preSelectedRoom) setSelectedRoom(preSelectedRoom)
  }, [isOpen, preSelectedRoom])

  const walletAddr = publicKey?.toBase58() || ''
  const bettableRooms = rooms
  const totalPot = getTotalPot()
  const myBets = walletAddr ? getMyGamblingBets(walletAddr) : []
  const myTotalBet = myBets.reduce((s, b) => s + b.amount, 0)

  const handlePlaceBet = async () => {
    setError('')
    setSuccessMsg('')

    const roomId = selectedRoom || preSelectedRoom
    if (!publicKey || !signTransaction || !roomId) return
    const amount = parseFloat(betAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('enter a valid cope amount')
      return
    }

    setIsSubmitting(true)
    try {
      const sig = await sendGamblingBetTransaction(amount, publicKey, signTransaction)
      if (sig) {
        await placeGamblingBet(roomId, amount, walletAddr)
        await updatePlayerPosition(walletAddr, roomId)
        setSuccessMsg(`coped: ${amount} SOL in Room #${roomId}`)
        setBetAmount('0.1')
        setTimeout(() => setSuccessMsg(''), 3000)
      } else {
        setError('tx failed. check your wallet.')
      }
    } catch (err) {
      setError('tx rejected. ngmi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccessMsg('')
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
            className="relative w-[500px] max-w-[92vw] max-h-[90vh] bg-white border-[3px] border-ink shadow-doodle-lg overflow-y-auto custom-scrollbar"
            initial={{ scale: 0.95, rotate: -1, y: 12 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.95, rotate: 1, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          >
            <div className="bg-white border-b-[3px] border-ink px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 border-2 border-ink bg-white flex items-center justify-center">
                  <Swords className="w-5 h-5 text-ink" />
                </div>
                <div>
                  <h2 className="font-bang text-2xl text-ink tracking-wider leading-none">APE SOL</h2>
                  <p className="font-hand text-sm text-ink/70 mt-0.5">bet SOL against other copers</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center hover:bg-ink hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="border-[3px] border-ink bg-white p-3 mb-4">
                <p className="font-bang text-ink text-base mb-1 tracking-wide">THE DEGEN MANUAL:</p>
                <p className="font-hand text-sm text-ink/80 leading-snug">
                  ape <strong>real SOL</strong> on a room. if unc skips it, you <strong>split the whole pot</strong> with other believers.
                </p>
                <p className="font-hand text-sm text-ink/80 leading-snug mt-1">
                  if <strong>everyone dies</strong>, the pot feeds the pump.fun devbuy.
                </p>
              </div>

              <div className="flex items-center justify-between border-[3px] border-ink bg-white px-3 py-2 mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-ink" />
                  <span className="font-bang text-ink text-sm tracking-wide">COPE POOL</span>
                </div>
                <span className="font-bang text-ink text-xl leading-none">{totalPot.toFixed(2)} SOL</span>
              </div>

              {myBets.length > 0 && (
                <div className="border-2 border-ink bg-white p-3 mb-4">
                  <p className="font-bang text-ink text-sm mb-2 tracking-wide">
                    YOUR APES ({myTotalBet.toFixed(2)} SOL):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {myBets.map((b, i) => {
                      const roomName = rooms.find(r => r.id === b.roomId)?.name || `Room ${b.roomId}`
                      return (
                        <span key={i} className="font-hand text-xs bg-white text-ink border-2 border-ink px-2 py-0.5">
                          {roomName}: {b.amount} SOL
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {preSelectedRoom ? (
                <>
                  {(() => {
                    const room = rooms.find(r => r.id === preSelectedRoom)
                    const roomBets = room ? getTotalGamblingBetsForRoom(room.id) : 0
                    const pctOfPot = totalPot > 0 ? ((roomBets / totalPot) * 100).toFixed(0) : '0'
                    return room ? (
                      <div className="mb-4 p-3 border-[3px] border-ink bg-white flex items-center gap-3">
                        <span className="w-11 h-11 border-2 border-ink bg-white font-bang text-ink text-xl flex items-center justify-center">
                          {room.id}
                        </span>
                        <div>
                          <p className="font-bang text-ink text-lg leading-none">{room.name}</p>
                          <p className="font-hand text-sm text-ink/70">
                            {roomBets.toFixed(2)} SOL • {pctOfPot}% of pot
                          </p>
                        </div>
                      </div>
                    ) : null
                  })()}
                </>
              ) : (
                <>
                  <p className="font-hand text-sm text-ink/80 mb-2">pick a target:</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {bettableRooms.map(room => {
                      const roomBets = getTotalGamblingBetsForRoom(room.id)
                      const isSelected = selectedRoom === room.id
                      const pct = totalPot > 0 ? (roomBets / totalPot) * 100 : 0
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room.id)}
                          className={`p-2 border-[3px] border-ink text-left transition-all ${
                            isSelected ? 'bg-ink text-white shadow-doodle' : 'bg-white text-ink hover:bg-paper'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 border-2 border-ink bg-white font-bang text-ink text-xs flex items-center justify-center">
                              {room.id}
                            </span>
                            <span className="font-bang text-sm">{room.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-hand text-xs opacity-70">{roomBets.toFixed(2)} SOL</span>
                            <span className="font-hand text-xs opacity-70">{pct.toFixed(0)}%</span>
                          </div>
                          <div className="mt-1 h-1.5 bg-white border border-ink w-full">
                            <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {(selectedRoom || preSelectedRoom) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4"
                >
                  <p className="font-hand text-sm text-ink/70 mb-2">cope amount (SOL):</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      min="0.01"
                      step="0.1"
                      className="flex-1 bg-white border-[3px] border-ink px-3 py-2 font-hand text-lg text-ink focus:outline-none focus:bg-paper"
                      placeholder="0.1"
                    />
                    <div className="w-16 flex items-center justify-center border-[3px] border-ink bg-white font-bang text-ink text-sm">
                      SOL
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {['0.05', '0.1', '0.5', '1'].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className={`flex-1 py-1.5 border-2 border-ink font-bang text-sm transition ${
                          betAmount === amt
                            ? 'bg-ink text-white'
                            : 'bg-white text-ink hover:bg-paper'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>

                  {parseFloat(betAmount) > 0 && (
                    <div className="mt-3 border-2 border-ink bg-white px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-ink" />
                          <span className="font-hand text-sm text-ink">max gmi reward:</span>
                        </div>
                        <span className="font-bang text-ink text-base">
                          ~{(totalPot + parseFloat(betAmount || '0')).toFixed(2)} SOL
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {error && (
                <div className="flex items-center gap-2 border-2 border-ink bg-ink text-white p-3 mb-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-hand text-sm">{error}</span>
                </div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 border-2 border-ink bg-white p-3 mb-3"
                >
                  <Coins className="w-4 h-4 text-ink flex-shrink-0" />
                  <span className="font-hand text-sm text-ink">{successMsg}</span>
                </motion.div>
              )}

              <button
                onClick={handlePlaceBet}
                disabled={!publicKey || !(selectedRoom || preSelectedRoom) || gamePhase !== 'betting' || isSubmitting}
                className={`w-full py-3 border-[3px] border-ink font-bang text-xl tracking-wider transition-all flex items-center justify-center gap-2 ${
                  publicKey && (selectedRoom || preSelectedRoom) && gamePhase === 'betting' && !isSubmitting
                    ? 'bg-white text-ink shadow-doodle hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white'
                    : 'bg-paper text-ink/50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    APING...
                  </>
                ) : !publicKey ? (
                  'CONNECT WALLET'
                ) : gamePhase !== 'betting' ? (
                  'TOO LATE'
                ) : !(selectedRoom || preSelectedRoom) ? (
                  'PICK A ROOM'
                ) : (
                  <>
                    <Swords className="w-5 h-5" />
                    APE {betAmount} SOL
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
