'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from '@/context/GameContext'
import { Clock, Coins, Play, Gift, Swords, TrendingUp, Trophy, Flame, Lock } from 'lucide-react'

interface BettingSidebarProps {
  onOpenFreeBet: () => void
  onOpenGambling: () => void
}

export function BettingSidebar({ onOpenFreeBet, onOpenGambling }: BettingSidebarProps) {
  const { publicKey } = useWallet()
  const {
    rooms,
    roundTimeRemaining,
    currentRound,
    gamePhase,
    killerKnockingRoom,
    killer2KnockingRoom,
    survivingRoom,
    killSequence,
    killStep,
    isRoomKilled,
    getTotalGamblingBetsForRoom,
    getFreeBetCountForRoom,
    getTotalPot,
    hasPlacedFreeBet,
    roundResult,
  } = useGame()

  const [sessionId, setSessionId] = useState('')
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('hide_session_id')
      if (!id) {
        id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
        localStorage.setItem('hide_session_id', id)
      }
      setSessionId(id)
    }
  }, [])

  const alreadyFreeBet = sessionId ? hasPlacedFreeBet(sessionId) : false
  const totalPot = getTotalPot()
  const bettableRooms = rooms

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const knockedRoom1Name = killerKnockingRoom
    ? rooms.find(r => r.id === killerKnockingRoom)?.name || ''
    : ''
  const knockedRoom2Name = killer2KnockingRoom
    ? rooms.find(r => r.id === killer2KnockingRoom)?.name || ''
    : ''
  const survivingRoomName = survivingRoom
    ? rooms.find(r => r.id === survivingRoom)?.name || ''
    : ''

  return (
    <div className="w-80 bg-white border-[3px] border-ink shadow-doodle-lg flex flex-col max-h-full overflow-y-auto custom-scrollbar relative">
      <div className="px-4 pt-4 pb-3 border-b-[3px] border-ink bg-white relative">
        <div className="flex items-center justify-between">
          <h2 className="font-bang text-2xl text-ink tracking-wider leading-none">STATUS</h2>
          <span className="stamp text-ink text-xs">RND #{currentRound}</span>
        </div>
      </div>

      {/* phase panel */}
      <div className="px-4 py-4 border-b-[3px] border-ink">
        {gamePhase === 'betting' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bang text-ink text-lg tracking-wider">BETS OPEN</span>
              <span className={`font-bang text-2xl ${roundTimeRemaining < 15 ? 'jitter-text' : ''} text-ink`}>
                {formatTime(roundTimeRemaining)}
              </span>
            </div>
            <p className="text-ink/70 font-hand text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> unc is pickin&apos; a room...
            </p>
          </div>
        )}
        {gamePhase === 'knocking' && (
          <div>
            <span className="font-bang text-ink text-lg tracking-wider jitter-text">UNC IS KNOCKIN&apos;</span>
            <div className="mt-2 space-y-1">
              {knockedRoom1Name && (
                <motion.p
                  className="font-hand text-sm text-ink"
                  animate={{ opacity: [1, 0.45, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  → {knockedRoom1Name}
                </motion.p>
              )}
              {knockedRoom2Name && (
                <motion.p
                  className="font-hand text-sm text-ink"
                  animate={{ opacity: [1, 0.45, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                >
                  → {knockedRoom2Name}
                </motion.p>
              )}
            </div>
          </div>
        )}
        {gamePhase === 'killing' && (
          <div>
            {killStep < killSequence.length - 1 ? (
              <>
                <span className="font-bang text-ink text-lg tracking-wider jitter-text">ROOM BY ROOM</span>
                <motion.p
                  className="font-bang text-xl text-ink mt-1"
                  key={killStep}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  NGMI {Math.min(killStep + 1, killSequence.length)}/{killSequence.length}
                </motion.p>
                <p className="font-hand text-sm text-ink/70">
                  {rooms.find(r => r.id === killSequence[killStep]?.roomId)?.name || '...'} — REKT
                </p>
              </>
            ) : (
              <>
                <motion.span
                  className="font-bang text-ink text-lg tracking-wider block"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  ☠ FINAL KILL ☠
                </motion.span>
                <motion.p
                  className="font-bang text-xl text-ink mt-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  BOTH UNCS CONVERGE
                </motion.p>
                <p className="font-hand text-sm text-ink/70">2 rooms left — only 1 gmi</p>
              </>
            )}
          </div>
        )}
        {gamePhase === 'result' && (
          <span className="font-bang text-xl text-ink tracking-wider">COPE ROUND OVER</span>
        )}
      </div>

      {/* betting buttons */}
      {gamePhase === 'betting' ? (
        <div className="px-4 py-4 space-y-3 border-b-[3px] border-ink">
          <button
            onClick={onOpenFreeBet}
            disabled={alreadyFreeBet}
            className={`w-full p-3 text-left border-[3px] border-ink transition-all group relative ${
              alreadyFreeBet
                ? 'bg-paper opacity-60 cursor-not-allowed'
                : 'bg-white shadow-doodle hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-ink bg-white flex items-center justify-center group-hover:bg-white">
                <Gift className="w-5 h-5 text-ink" />
              </div>
              <div className="flex-1">
                <p className="font-bang text-lg leading-none">
                  {alreadyFreeBet ? 'COPE LOGGED' : 'FREE GUESS'}
                </p>
                <p className="font-hand text-xs mt-0.5 opacity-80">
                  {alreadyFreeBet ? 'wait for the reveal' : 'pick who survives, get 0.01 SOL devbuy'}
                </p>
              </div>
              {!alreadyFreeBet && <span className="stamp text-xs">FREE</span>}
            </div>
          </button>

          <button
            onClick={onOpenGambling}
            className="group w-full p-3 text-left border-[3px] border-ink bg-white shadow-doodle hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-doodle-lg hover:bg-ink hover:text-white cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-ink bg-white flex items-center justify-center">
                <Swords className="w-5 h-5 text-ink" />
              </div>
              <div className="flex-1">
                <p className="font-bang text-lg leading-none">APE SOL</p>
                <p className="font-hand text-xs mt-0.5 opacity-80">bet SOL against other copers</p>
              </div>
              <span className="stamp text-xs">SOL</span>
            </div>
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 border-b-[3px] border-ink">
          <div className="border-[3px] border-ink bg-white p-4 flex flex-col items-center gap-2 text-center">
            <Lock className="w-7 h-7 text-ink" />
            <p className="font-bang text-xl text-ink leading-none">
              {gamePhase === 'knocking' && 'DOORS LOCKED'}
              {gamePhase === 'killing' && 'UNC IS COOKIN'}
              {gamePhase === 'result' && 'AFTERMATH'}
            </p>
            <p className="font-hand text-sm text-ink/70">
              no more bets. cope.
            </p>
            <motion.div
              className="w-full py-2 border-[2px] border-ink bg-white mt-1"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="font-bang text-ink text-sm tracking-wide">
                {gamePhase === 'result' ? 'NEXT ROUND SOON' : 'WATCH THE CARNAGE'}
              </p>
            </motion.div>
          </div>
        </div>
      )}

      {/* pot display */}
      {totalPot > 0 && (
        <div className="px-4 py-3 border-b-[3px] border-ink bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-ink" />
              <span className="font-bang text-ink text-sm tracking-wider">COPE POOL</span>
            </div>
            <span className="font-bang text-ink text-xl leading-none">{totalPot.toFixed(2)} SOL</span>
          </div>
        </div>
      )}

      {/* room leaderboard */}
      <div className="px-4 py-4 flex-1 overflow-hidden flex flex-col border-b-[3px] border-ink">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-ink" />
          <span className="font-bang text-ink text-sm tracking-wider">ROOMS</span>
        </div>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {bettableRooms.map(room => {
            const gamblingTotal = getTotalGamblingBetsForRoom(room.id)
            const freeCount = getFreeBetCountForRoom(room.id)
            const isKillTarget = isRoomKilled(room.id) && (gamePhase === 'killing' || gamePhase === 'result')
            const isSurvivor = survivingRoom === room.id && gamePhase === 'result'
            const pctOfPot = totalPot > 0 ? ((gamblingTotal / totalPot) * 100).toFixed(0) : '0'

            return (
              <div
                key={room.id}
                className={`relative px-3 py-2 border-[2px] border-ink transition-all ${
                  isSurvivor
                    ? 'bg-ink text-white'
                    : isKillTarget
                    ? 'bg-ink text-white line-through opacity-70'
                    : 'bg-white hover:bg-paper'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 flex items-center justify-center text-xs font-bang border-2 border-ink ${isSurvivor || isKillTarget ? 'bg-white text-ink' : 'bg-white text-ink'}`}>
                      {room.id}
                    </span>
                    <span className="font-bang text-sm tracking-wider">
                      {room.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {freeCount > 0 && (
                      <span className="font-hand text-xs opacity-80">
                        {freeCount} 😭
                      </span>
                    )}
                    <span className="font-bang text-xs">
                      {gamblingTotal > 0 ? `${gamblingTotal.toFixed(2)}` : '—'}
                    </span>
                    {totalPot > 0 && gamblingTotal > 0 && (
                      <span className="font-mono text-[10px] w-6 text-right opacity-60">
                        {pctOfPot}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {gamePhase === 'result' && roundResult && (
        <div className="px-4 py-4 border-b-[3px] border-ink bg-white">
          <div className="border-[3px] border-ink bg-white p-3 space-y-3">
            <div className="text-center border-b-2 border-ink pb-2">
              <p className="font-hand text-sm text-ink/70">GMI ROOM:</p>
              <p className="font-bang text-2xl text-ink tracking-wider leading-none">{survivingRoomName}</p>
              <p className="font-hand text-xs text-ink/70 mt-1">{roundResult.killedRooms.length} rooms REKT</p>
            </div>

            {roundResult.correctFreeBets.length > 0 && (
              <div className="border-2 border-ink bg-white p-2">
                <p className="font-bang text-ink text-sm tracking-wide">
                  {roundResult.correctFreeBets.length} FREE WINNERS
                </p>
                <p className="font-hand text-xs text-ink/70">
                  {(roundResult.correctFreeBets.length * 0.01).toFixed(2)} SOL devbuy incoming
                </p>
              </div>
            )}

            {roundResult.totalPot > 0 && (
              <>
                {roundResult.winnersExist ? (
                  <div className="border-2 border-ink bg-white p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-ink" />
                      <span className="font-bang text-ink text-sm">GMI CHADS ({roundResult.payouts.length})</span>
                    </div>
                    <div className="space-y-1">
                      {roundResult.payouts.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex justify-between font-mono text-xs">
                          <span className="text-ink/70">{p.wallet.slice(0, 4)}…{p.wallet.slice(-4)}</span>
                          <span className="text-ink font-bold">+{p.amount.toFixed(3)}</span>
                        </div>
                      ))}
                      {roundResult.payouts.length > 5 && (
                        <p className="font-hand text-xs text-ink/70 pt-1">+{roundResult.payouts.length - 5} more…</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-ink bg-ink text-white p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="font-bang text-sm">NOBODY SURVIVED</span>
                    </div>
                    <p className="font-hand text-xs">
                      {roundResult.totalPot.toFixed(2)} SOL → devbuy
                    </p>
                  </div>
                )}
              </>
            )}

            {roundResult.devBuyAmount > 0 && (
              <div className="flex items-center justify-between border-2 border-ink bg-white px-2 py-1">
                <span className="font-hand text-xs text-ink/70">TOTAL COPE $$$</span>
                <span className="font-bang text-ink text-sm">{roundResult.devBuyAmount.toFixed(3)} SOL</span>
              </div>
            )}

            <div className="w-full py-2 border-2 border-ink bg-white font-bang text-ink text-sm text-center flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5" />
              NEXT ROUND SOON
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-2 bg-white border-t-2 border-ink">
        <p className="font-hand text-xs text-ink/70 text-center">
          {gamePhase === 'betting' && 'pick the room that unc skips'}
          {gamePhase === 'knocking' && "shhh... he's listening"}
          {gamePhase === 'killing' && '6 rooms fall. 1 makes it.'}
          {gamePhase === 'result' && 'the cycle never ends'}
        </p>
      </div>
    </div>
  )
}
