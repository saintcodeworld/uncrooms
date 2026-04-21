'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface KillerProps {
  position: { x: number; y: number }
  isKnocking?: boolean
  isKilling?: boolean
}

const SPRITE_W = 42
const SPRITE_H = 56

export function Killer({ position, isKnocking = false, isKilling = false }: KillerProps) {
  return (
    <motion.g
      initial={{ x: position.x, y: position.y }}
      animate={{ x: position.x, y: position.y }}
      transition={{
        type: 'spring',
        stiffness: 40,
        damping: 12,
        duration: 2,
      }}
    >
      {isKnocking && (
        <>
          <motion.text
            x={0} y={-SPRITE_H / 2 - 14}
            textAnchor="middle"
            fill="#0d0d0d"
            fontSize="11"
            fontFamily="var(--font-bang), Impact"
            fontWeight="bold"
            animate={{ opacity: [1, 0.3, 1], y: [-SPRITE_H / 2 - 14, -SPRITE_H / 2 - 18, -SPRITE_H / 2 - 14], rotate: [-3, 3, -3] }}
            transition={{ duration: 0.45, repeat: Infinity }}
          >
            KNOCK KNOCK
          </motion.text>
          <motion.circle
            cx={0} cy={0} r={SPRITE_W / 2}
            fill="none" stroke="#0d0d0d" strokeWidth={1.5}
            initial={{ r: SPRITE_W / 2, opacity: 0.8 }}
            animate={{ r: SPRITE_W + 10, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
          />
        </>
      )}

      {isKilling && (
        <>
          <motion.text
            x={0} y={-SPRITE_H / 2 - 10}
            textAnchor="middle"
            fill="#0d0d0d"
            fontSize="13"
            fontFamily="var(--font-bang), Impact"
            fontWeight="bold"
            animate={{ scale: [1, 1.2, 1], rotate: [-4, 4, -4] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            NGMI
          </motion.text>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.circle
              key={`blood-${i}`}
              cx={Math.cos(i * 1.05) * 14}
              cy={Math.sin(i * 1.05) * 12}
              r={1.6}
              fill="#0d0d0d"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.75] }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1, repeat: Infinity, repeatDelay: 0.2 }}
            />
          ))}
        </>
      )}

      <motion.image
        href="/unc.png"
        x={-SPRITE_W / 2}
        y={-SPRITE_H / 2}
        width={SPRITE_W}
        height={SPRITE_H}
        preserveAspectRatio="xMidYMid meet"
        animate={
          isKilling
            ? { rotate: [-6, 6, -6], scale: [1, 1.08, 1] }
            : isKnocking
            ? { rotate: [-3, 3, -3] }
            : { y: [-SPRITE_H / 2, -SPRITE_H / 2 - 1.2, -SPRITE_H / 2] }
        }
        transition={{
          duration: isKilling ? 0.3 : isKnocking ? 0.35 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '0px 0px', transformBox: 'fill-box' }}
      />

      {/* nametag */}
      <g>
        <rect
          x={-10} y={SPRITE_H / 2 + 1}
          width={20} height={7}
          fill="#ffffff"
          stroke="#0d0d0d"
          strokeWidth="1"
          transform={`rotate(-2 0 ${SPRITE_H / 2 + 4})`}
        />
        <text
          x={0} y={SPRITE_H / 2 + 6.3}
          textAnchor="middle"
          fill="#0d0d0d"
          fontSize="6"
          fontFamily="var(--font-bang), Impact"
          fontWeight="bold"
          letterSpacing="1"
          transform={`rotate(-2 0 ${SPRITE_H / 2 + 4})`}
        >
          UNC
        </text>
      </g>
    </motion.g>
  )
}
