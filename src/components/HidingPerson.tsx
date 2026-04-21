'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface HidingPersonProps {
  roomX: number
  roomY: number
  roomWidth: number
  roomHeight: number
  personIndex: number
  isKilled: boolean
}

const HAIR_VARIANTS = [
  { d: 'M -5 -11 Q 0 -15 5 -11 L 4 -8 Q 0 -10 -4 -8 Z', color: '#2a1a10' },
  { d: 'M -5 -12 Q 0 -15 5 -12 L 5 -7 Q 0 -11 -5 -7 Z', color: '#6b3a1a' },
  { d: 'M -5 -11 Q 0 -14 5 -11 L 5 -8 L -5 -8 Z', color: '#d8b66b' },
  { d: '', color: 'transparent' },
  { d: 'M -5 -11 Q 0 -16 5 -11 L 5 -8 Q 0 -9 -5 -8 Z', color: '#1a1a1a' },
]

export function HidingPerson({ roomX, roomY, roomWidth, roomHeight, personIndex, isKilled }: HidingPersonProps) {
  const pad = 28
  const minX = roomX + pad
  const maxX = roomX + roomWidth - pad
  const minY = roomY + pad
  const maxY = roomY + roomHeight - pad

  const walkPath = useMemo(() => {
    const seed = personIndex * 137.5
    const points = 6
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < points; i++) {
      xs.push(minX + ((Math.sin(seed + i * 2.1) * 0.5 + 0.5) * (maxX - minX)))
      ys.push(minY + ((Math.cos(seed + i * 3.7) * 0.5 + 0.5) * (maxY - minY)))
    }
    xs.push(xs[0])
    ys.push(ys[0])
    return { xs, ys }
  }, [minX, maxX, minY, maxY, personIndex])

  const hair = HAIR_VARIANTS[personIndex % HAIR_VARIANTS.length]
  const skinTone = personIndex % 3 === 0 ? '#fbd4bc' : personIndex % 3 === 1 ? '#f4c2a1' : '#e8b090'

  if (isKilled) {
    const bx = walkPath.xs[0]
    const by = walkPath.ys[0]
    return (
      <g>
        <g style={{ transformOrigin: `${bx}px ${by}px`, transform: 'rotate(90deg)', opacity: 0.85 }}>
          <ellipse cx={bx} cy={by} rx={6} ry={4} fill={skinTone} stroke="#0d0d0d" strokeWidth="0.8" />
          <circle cx={bx - 7} cy={by} r={3.5} fill={skinTone} stroke="#0d0d0d" strokeWidth="0.8" />
        </g>
        <ellipse cx={bx} cy={by + 2} rx={12} ry={6} fill="#e83333" stroke="#0d0d0d" strokeWidth="0.6" opacity="0.85" />
        {[0, 1, 2, 3].map(i => (
          <circle
            key={i}
            cx={bx + Math.cos(i * 1.5) * 9}
            cy={by + Math.sin(i * 1.5) * 7}
            r={1.4}
            fill="#e83333"
            stroke="#0d0d0d"
            strokeWidth="0.4"
          />
        ))}
        {/* X eyes */}
        <g stroke="#0d0d0d" strokeWidth="0.9" strokeLinecap="round">
          <line x1={bx - 10} y1={by - 2} x2={bx - 6} y2={by + 2} />
          <line x1={bx - 6} y1={by - 2} x2={bx - 10} y2={by + 2} />
        </g>
        {/* NGMI tag */}
        <g transform={`translate(${bx + 14}, ${by - 6}) rotate(-8)`}>
          <rect x={-10} y={-5} width={20} height={8} fill="#fff8a6" stroke="#0d0d0d" strokeWidth="0.8" />
          <text x={0} y={1} textAnchor="middle" fill="#e83333" fontSize="6" fontFamily="var(--font-bang), Impact" fontWeight="bold">
            NGMI
          </text>
        </g>
      </g>
    )
  }

  const startX = walkPath.xs[0]
  const startY = walkPath.ys[0]

  return (
    <motion.g
      initial={{ translateX: startX, translateY: startY }}
      animate={{
        translateX: walkPath.xs,
        translateY: walkPath.ys,
      }}
      transition={{
        duration: 10 + personIndex * 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* shadow */}
      <ellipse cx={0} cy={11} rx={5} ry={1.3} fill="rgba(13,13,13,0.28)" />

      {/* body / shirt */}
      <path
        d="M -5 0 Q -5 -2 -3 -3 L 3 -3 Q 5 -2 5 0 L 5 9 L -5 9 Z"
        fill={personIndex % 2 === 0 ? '#5a7fb8' : '#c45a5a'}
        stroke="#0d0d0d"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* head */}
      <circle cx={0} cy={-7} r={4.5} fill={skinTone} stroke="#0d0d0d" strokeWidth="0.9" />

      {/* hair */}
      {hair.d && <path d={hair.d} fill={hair.color} stroke="#0d0d0d" strokeWidth="0.6" />}

      {/* sad wojak eyes - dots */}
      <circle cx={-1.6} cy={-7} r={0.7} fill="#0d0d0d" />
      <circle cx={1.6} cy={-7} r={0.7} fill="#0d0d0d" />

      {/* sad mouth (frown) */}
      <path d="M -1.8 -4.6 Q 0 -5.6 1.8 -4.6" fill="none" stroke="#0d0d0d" strokeWidth="0.7" strokeLinecap="round" />

      {/* tear */}
      <motion.ellipse
        cx={-1.6} cy={-5.2}
        rx={0.55} ry={0.9}
        fill="#8fc8f2"
        stroke="#0d0d0d"
        strokeWidth="0.3"
        animate={{ cy: [-5.2, -3, -1], opacity: [1, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: personIndex * 0.2 }}
      />

      {/* blush */}
      <circle cx={-3} cy={-5.5} r={0.9} fill="#ff7aa4" opacity="0.55" />
      <circle cx={3} cy={-5.5} r={0.9} fill="#ff7aa4" opacity="0.55" />

      {/* arms (hugging knees vibe) */}
      <line x1={-4} y1={2} x2={-6} y2={7} stroke="#0d0d0d" strokeWidth="0.9" strokeLinecap="round" />
      <line x1={4} y1={2} x2={6} y2={7} stroke="#0d0d0d" strokeWidth="0.9" strokeLinecap="round" />

      {/* legs */}
      <line x1={-2} y1={9} x2={-3} y2={13} stroke="#0d0d0d" strokeWidth="1" strokeLinecap="round" />
      <line x1={2} y1={9} x2={3} y2={13} stroke="#0d0d0d" strokeWidth="1" strokeLinecap="round" />
    </motion.g>
  )
}
