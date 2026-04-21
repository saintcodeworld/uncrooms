'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('WAKING UP UNC')

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99
        return Math.min(prev + Math.random() * 15, 99)
      })
    }, 200)

    const textInterval = setInterval(() => {
      const texts = [
        'WAKING UP UNC...',
        'SHARPENING KNIVES...',
        'MIXING HOPIUM...',
        'COUNTING COPERS...',
        'CHECKING ROOMS...',
        'BREWING COFFEE FOR UNC...',
      ]
      setLoadingText(texts[Math.floor(Math.random() * texts.length)])
    }, 1300)

    return () => {
      clearInterval(interval)
      clearInterval(textInterval)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 mb-8"
      >
        <motion.div
          className="border-[5px] border-ink bg-white p-4 shadow-doodle-lg"
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="/unc.png"
            alt="Unc"
            className="w-40 h-52 object-contain"
          />
        </motion.div>
        <div className="mt-4 text-center">
          <p className="font-bang text-5xl text-ink tracking-wider leading-none">$UNCKILLER</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 flex flex-col items-center w-full max-w-md px-8"
      >
        <div className="flex justify-between w-full mb-2 font-bang text-ink text-base tracking-wider">
          <motion.span
            key={loadingText}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loadingText}
          </motion.span>
          <span className="tabular-nums">{Math.floor(progress)}%</span>
        </div>

        <div className="w-full h-5 bg-white border-[3px] border-ink relative overflow-hidden">
          <motion.div
            className="h-full bg-ink"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'linear', duration: 0.2 }}
          />
        </div>

        <div className="mt-8 flex gap-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 border-2 border-ink bg-white"
              animate={{ rotate: [0, 180, 360], y: [0, -6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
