'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useGame, Room as RoomType } from '@/context/GameContext'

interface RoomProps {
  room: RoomType
  isSelected: boolean
  onClick: () => void
}

export function Room({ room, isSelected, onClick }: RoomProps) {
  const { getTotalGamblingBetsForRoom, getFreeBetCountForRoom, killerTargetRoom, killer2TargetRoom, killerKnockingRoom, killer2KnockingRoom, isRoomKilled, survivingRoom, killSequence, killStep, gamePhase, isKilling, playerPositions } = useGame()
  const totalGambling = getTotalGamblingBetsForRoom(room.id)
  const freeCount = getFreeBetCountForRoom(room.id)
  const isKillerHere = killerTargetRoom === room.id || killer2TargetRoom === room.id
  const isBeingKnocked = killerKnockingRoom === room.id || killer2KnockingRoom === room.id
  const isActiveKill = gamePhase === 'killing' && isKilling && killStep >= 0 && killStep < killSequence.length && killSequence[killStep]?.roomId === room.id
  const isAlreadyDead = isRoomKilled(room.id) && !isActiveKill
  const isBeingKilled = isActiveKill
  // Winner UI only after all eliminations (result phase), not while kills are still playing out
  const isWinnerRoom = survivingRoom === room.id && gamePhase === 'result'
  const canClick = gamePhase === 'betting'

  const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)

  const overlayFill = isWinnerRoom
    ? 'rgba(34, 197, 94, 0.1)'
    : isActiveKill
    ? 'rgba(232, 51, 51, 0.25)'
    : isAlreadyDead
    ? 'rgba(13, 13, 13, 0.18)'
    : isBeingKnocked
    ? 'rgba(13, 13, 13, 0.08)'
    : isKillerHere
    ? 'rgba(13, 13, 13, 0.04)'
    : isSelected
    ? 'rgba(13, 13, 13, 0.06)'
    : 'transparent'

  const hoverFill = canClick ? 'rgba(13, 13, 13, 0.05)' : overlayFill

  const borderColor = isWinnerRoom
    ? '#22c55e'
    : isActiveKill
    ? '#e83333'
    : isAlreadyDead
    ? '#0d0d0d'
    : isBeingKnocked
    ? '#0d0d0d'
    : isKillerHere
    ? '#0d0d0d'
    : isSelected
    ? '#0d0d0d'
    : 'transparent'

  const labelCx = room.x + room.width / 2
  const labelY = room.y + room.height - 18
  const roomNameLen = room.name.length

  const elimPad = Math.max(10, Math.min(room.width, room.height) * 0.08)
  const elimStrokeW = Math.max(5, Math.min(room.width, room.height) * 0.09)
  const elimX1 = room.x + elimPad
  const elimY1 = room.y + elimPad
  const elimX2 = room.x + room.width - elimPad
  const elimY2 = room.y + room.height - elimPad

  return (
    <motion.g
      onClick={canClick ? onClick : undefined}
      style={{ cursor: canClick ? 'pointer' : 'default' }}
    >
      <rect
        x={room.x} y={room.y}
        width={room.width} height={room.height}
        fill="transparent"
      />

      <motion.rect
        x={room.x + 2} y={room.y + 2}
        width={room.width - 4} height={room.height - 4}
        fill={overlayFill}
        stroke={borderColor}
        strokeWidth={isSelected || isKillerHere || isBeingKnocked || isBeingKilled || isWinnerRoom ? 3 : 0}
        strokeDasharray={isSelected ? '6,4' : '0'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={canClick ? { fill: hoverFill } : undefined}
      />

      {/* room number tag */}
      <g transform={`translate(${room.x + 18}, ${room.y + 18}) rotate(-4)`}>
        <rect
          x={-14} y={-11}
          width={28} height={22}
          fill={isBeingKilled ? '#0d0d0d' : '#ffffff'}
          stroke="#0d0d0d"
          strokeWidth="1.5"
        />
        <text
          x={0} y={5}
          textAnchor="middle"
          fill={isBeingKilled ? '#ffffff' : '#0d0d0d'}
          fontSize="14"
          fontFamily="var(--font-bang), Impact"
          fontWeight="bold"
        >
          {room.id}
        </text>
      </g>

      {/* room name sticker */}
      <g transform={`translate(${labelCx}, ${labelY}) rotate(-1.5)`}>
        <rect
          x={-roomNameLen * 4.2 - 8} y={-9}
          width={roomNameLen * 8.4 + 16} height={18}
          fill="#ffffff"
          stroke="#0d0d0d"
          strokeWidth="1.5"
        />
        <text
          x={0} y={5}
          textAnchor="middle"
          fill="#0d0d0d"
          fontSize="11"
          fontFamily="var(--font-bang), Impact"
          fontWeight="bold"
          letterSpacing="1"
        >
          {room.name}
        </text>
      </g>

      {totalGambling > 0 && (
        <g transform={`translate(${room.x + room.width - 34}, ${room.y + 28}) rotate(6)`}>
          <rect x={-28} y={-10} width={56} height={20} fill="#ffffff" stroke="#0d0d0d" strokeWidth="1.5" />
          <text
            x={0} y={5}
            textAnchor="middle"
            fill="#0d0d0d"
            fontSize="10"
            fontFamily="var(--font-bang), Impact"
            fontWeight="bold"
          >
            {totalGambling} SOL
          </text>
        </g>
      )}

      {freeCount > 0 && (
        <g transform={`translate(${room.x + 42}, ${room.y + 18}) rotate(3)`}>
          <rect x={-18} y={-10} width={36} height={20} fill="#ffffff" stroke="#0d0d0d" strokeWidth="1.5" />
          <text
            x={0} y={5}
            textAnchor="middle"
            fill="#0d0d0d"
            fontSize="11"
            fontFamily="var(--font-bang), Impact"
            fontWeight="bold"
          >
            {freeCount} 😭
          </text>
        </g>
      )}

      {playersInRoom.map((player: any, index: number) => {
        const avatarX = room.x + 15 + (index * 22)
        const avatarY = room.y + 52
        const shortAddress = player.walletAddress ? player.walletAddress.slice(0, 4) + '...' + player.walletAddress.slice(-4) : '???'
        return (
          <g key={player.walletAddress || index} transform={`translate(${avatarX}, ${avatarY}) rotate(-3)`}>
            <circle cx={0} cy={0} r={8} fill="#ffffff" stroke="#0d0d0d" strokeWidth="1.4" />
            <text x={0} y={3} textAnchor="middle" fontSize="10">👤</text>
            <rect x={-20} y={11} width={40} height={11} fill="#ffffff" stroke="#0d0d0d" strokeWidth="1" />
            <text x={0} y={19} textAnchor="middle" fill="#0d0d0d" fontSize="6" fontFamily="monospace" letterSpacing="0.5">
              {shortAddress}
            </text>
          </g>
        )
      })}

      {isBeingKnocked && (
        <motion.rect
          x={room.x + 4} y={room.y + 4}
          width={room.width - 8} height={room.height - 8}
          fill="none"
          stroke="#0d0d0d"
          strokeWidth="2.5"
          strokeDasharray="4,5"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}

      {isBeingKilled && (
        <>
          <rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4}
            fill="url(#crosshatch)"
            opacity="0.7"
          />
          <g transform={`translate(${labelCx}, ${room.y + room.height / 2 - 40}) rotate(-12)`}>
            <rect x={-52} y={-18} width={104} height={38} fill="#0d0d0d" stroke="#0d0d0d" strokeWidth="3" />
            <text x={0} y={11} textAnchor="middle" fill="#ffffff" fontSize="26" fontFamily="var(--font-bang), Impact" fontWeight="bold" letterSpacing="4">
              NGMI
            </text>
          </g>
        </>
      )}

      {isAlreadyDead && gamePhase === 'killing' && (
        <>
          <rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4}
            fill="url(#crosshatch)"
            opacity="0.55"
          />
          <g transform={`translate(${labelCx}, ${room.y + room.height / 2 - 20}) rotate(-6)`} opacity="0.85">
            <text x={0} y={0} textAnchor="middle" fill="#0d0d0d" fontSize="28" fontFamily="var(--font-bang), Impact" fontWeight="bold" letterSpacing="3">
              REKT
            </text>
          </g>
        </>
      )}

      {isRoomKilled(room.id) && (
        <motion.g
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          style={{ pointerEvents: 'none' }}
        >
          <line x1={elimX1} y1={elimY1} x2={elimX2} y2={elimY2} stroke="#ffffff" strokeWidth={elimStrokeW + 3} strokeLinecap="round" opacity={0.35} />
          <line x1={elimX2} y1={elimY1} x2={elimX1} y2={elimY2} stroke="#ffffff" strokeWidth={elimStrokeW + 3} strokeLinecap="round" opacity={0.35} />
          <line x1={elimX1} y1={elimY1} x2={elimX2} y2={elimY2} stroke="#e83333" strokeWidth={elimStrokeW} strokeLinecap="round" />
          <line x1={elimX2} y1={elimY1} x2={elimX1} y2={elimY2} stroke="#e83333" strokeWidth={elimStrokeW} strokeLinecap="round" />
        </motion.g>
      )}

      {isWinnerRoom && (
        <>
          <motion.rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4}
            fill="rgba(34, 197, 94, 0.08)"
            stroke="#22c55e"
            strokeWidth="4"
            strokeDasharray="8,4"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <motion.g
            transform={`translate(${labelCx}, ${room.y + room.height / 2 - 30}) rotate(-8)`}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <rect x={-88} y={-24} width={176} height={48} fill="#ffffff" stroke="#22c55e" strokeWidth="3" />
            <g transform="translate(-6, 0)">
              <text
                x={-26}
                y={14}
                textAnchor="middle"
                fill="#16a34a"
                fontSize="36"
                fontFamily="var(--font-bang), Impact"
                fontWeight="bold"
                letterSpacing="6"
              >
                WIN
              </text>
              <g transform="translate(32, 2)">
                <path
                  d="M -14 2 L -4 14 L 22 -12"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          </motion.g>
        </>
      )}
    </motion.g>
  )
}
