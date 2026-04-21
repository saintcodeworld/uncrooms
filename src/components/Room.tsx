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
  const isSurviving = survivingRoom === room.id && gamePhase === 'result'
  const canClick = gamePhase === 'betting'

  const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)

  const overlayFill = isSurviving
    ? 'rgba(13, 13, 13, 0.06)'
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

  const borderColor = isSurviving
    ? '#0d0d0d'
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
        strokeWidth={isSelected || isKillerHere || isBeingKnocked || isBeingKilled ? 3 : 0}
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
          {room.name.toUpperCase()}
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

      {isSurviving && (
        <>
          <motion.rect
            x={room.x + 2} y={room.y + 2}
            width={room.width - 4} height={room.height - 4}
            fill="rgba(13, 13, 13, 0.05)"
            stroke="#0d0d0d"
            strokeWidth="4"
            strokeDasharray="8,4"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <motion.g
            transform={`translate(${labelCx}, ${room.y + room.height / 2 - 30}) rotate(-8)`}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <rect x={-52} y={-20} width={104} height={40} fill="#ffffff" stroke="#0d0d0d" strokeWidth="3" />
            <text x={0} y={12} textAnchor="middle" fill="#0d0d0d" fontSize="28" fontFamily="var(--font-bang), Impact" fontWeight="bold" letterSpacing="4">
              GMI
            </text>
          </motion.g>
        </>
      )}
    </motion.g>
  )
}
