'use client'

import React, { useEffect, useState } from 'react'
import { useGame } from '@/context/GameContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins } from 'lucide-react'

export function DevBuyToast() {
  const { roundResult, gamePhase } = useGame()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (gamePhase === 'result' && roundResult) {
      if (roundResult.devBuyAmount > 0) {
        setMessage(`cope buy: ${roundResult.devBuyAmount} sol`)
        setShow(true)
        const timer = setTimeout(() => setShow(false), 6000)
        return () => clearTimeout(timer)
      }
    }
  }, [gamePhase, roundResult])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, rotate: -3, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotate: -2, scale: 1 }}
          exit={{ opacity: 0, y: -40, rotate: -4, scale: 0.9 }}
          className="fixed top-28 left-1/2 -translate-x-1/2 z-[10000] border-[3px] border-ink bg-white px-5 py-3 shadow-doodle-lg font-bang text-ink text-lg tracking-wider flex items-center gap-2"
        >
          <Coins className="w-5 h-5" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
