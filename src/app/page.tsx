'use client'

import { useState } from 'react'
import { HouseMap } from '@/components/HouseMap'
import { BettingSidebar } from '@/components/BettingSidebar'
import { GameHeader } from '@/components/GameHeader'
import { FreeBetPopup } from '@/components/FreeBetPopup'
import { GamblingBetPopup } from '@/components/GamblingBetPopup'
import { BetTypeChooser } from '@/components/BetTypeChooser'
import { GameProvider, useGame } from '@/context/GameContext'
import { ChatProvider, useChat } from '@/context/ChatContext'
import { DevBuyToast } from '@/components/DevBuyToast'
import { ChatSidebar } from '@/components/ChatSidebar'
import { LoadingScreen } from '@/components/LoadingScreen'
import { UsernamePopup } from '@/components/UsernamePopup'
import { AnimatePresence } from 'framer-motion'

function GameInner() {
  const { gamePhase, sessionLoaded } = useGame()
  const { username, setUsername, usernameLoaded } = useChat()
  const [freeBetOpen, setFreeBetOpen] = useState(false)
  const [gamblingOpen, setGamblingOpen] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [clickedRoom, setClickedRoom] = useState<number | null>(null)
  const [preSelectedRoom, setPreSelectedRoom] = useState<number | null>(null)

  const showUsernamePopup = sessionLoaded && usernameLoaded && !username

  const handleRoomClick = (roomId: number) => {
    if (gamePhase !== 'betting') return
    setClickedRoom(roomId)
    setChooserOpen(true)
  }

  const handleChooseFreeBet = (roomId: number) => {
    setPreSelectedRoom(roomId)
    setFreeBetOpen(true)
  }

  const handleChooseGambling = (roomId: number) => {
    setPreSelectedRoom(roomId)
    setGamblingOpen(true)
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden paper-bg paper-grain selection:bg-pepto">
      <div className="absolute inset-0 z-10">
        <HouseMap onRoomClick={handleRoomClick} />
      </div>

      <AnimatePresence mode="wait">
        {!sessionLoaded && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col">
        <div className="pointer-events-auto">
          <GameHeader />
        </div>

        <div className="absolute top-28 right-6 bottom-6 w-80 pointer-events-auto">
          <BettingSidebar
            onOpenFreeBet={() => { setPreSelectedRoom(null); setFreeBetOpen(true) }}
            onOpenGambling={() => { setPreSelectedRoom(null); setGamblingOpen(true) }}
          />
        </div>
      </div>

      <BetTypeChooser
        isOpen={chooserOpen}
        roomId={clickedRoom}
        onClose={() => setChooserOpen(false)}
        onChooseFreeBet={handleChooseFreeBet}
        onChooseGambling={handleChooseGambling}
      />

      <FreeBetPopup isOpen={freeBetOpen} onClose={() => { setFreeBetOpen(false); setPreSelectedRoom(null) }} preSelectedRoom={preSelectedRoom} />
      <GamblingBetPopup isOpen={gamblingOpen} onClose={() => { setGamblingOpen(false); setPreSelectedRoom(null) }} preSelectedRoom={preSelectedRoom} />

      <DevBuyToast />

      <ChatSidebar />

      <UsernamePopup
        isOpen={showUsernamePopup}
        onComplete={(name) => setUsername(name)}
      />
    </main>
  )
}

export default function Home() {
  return (
    <GameProvider>
      <ChatProvider>
        <GameInner />
      </ChatProvider>
    </GameProvider>
  )
}
