'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { HowItWorksPopup } from './HowItWorksPopup'
import { HowToPlayPopup } from './HowToPlayPopup'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
)

function UncLogo() {
  return (
    <img
      src="/unc.png"
      alt="Unc"
      className="w-10 h-12 object-contain"
    />
  )
}

export function GameHeader() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false)

  return (
    <>
      <header className="relative z-40 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative bg-white border-[3px] border-ink p-1 shadow-doodle transition-transform group-hover:-rotate-2">
              <UncLogo />
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-ink font-bang text-4xl tracking-wider leading-none">
                $UNCKILLER
              </h1>
              <p className="text-ink/70 font-hand text-sm mt-1">
                unc is in the house. pick a room. pray.
              </p>
            </div>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="https://x.com/i/communities/2031839433255751684"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 border-[3px] border-ink bg-white px-3 py-2 font-bang text-sm tracking-wider shadow-doodle hover:-translate-y-0.5 hover:bg-ink hover:text-white transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              TWITTER
            </a>

            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="hidden md:inline-flex items-center gap-2 border-[3px] border-ink bg-white px-3 py-2 font-bang text-sm tracking-wider shadow-doodle hover:-translate-y-0.5 hover:bg-ink hover:text-white transition-all"
            >
              HOW 2 PLAY
            </button>

            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="hidden md:inline-flex items-center gap-2 border-[3px] border-ink bg-white px-3 py-2 font-bang text-sm tracking-wider shadow-doodle hover:-translate-y-0.5 hover:bg-ink hover:text-white transition-all"
            >
              TECH
            </button>

            <div className="hidden md:flex items-center gap-2 border-[3px] border-ink bg-white px-3 py-2 font-bang text-sm shadow-doodle">
              <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
              LIVE
            </div>

            <WalletMultiButton />
          </div>
        </div>
      </header>

      <HowItWorksPopup isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />
      <HowToPlayPopup isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
    </>
  )
}
