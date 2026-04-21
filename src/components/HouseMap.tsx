'use client'

import React, { useEffect, useRef } from 'react'
import { useGame } from '@/context/GameContext'
import { Room } from './Room'
import { Killer } from './Killer'
import { HidingPerson } from './HidingPerson'
import { useKnockSound } from '@/hooks/useKnockSound'
import { useKillSound } from '@/hooks/useKillSound'

interface HouseMapProps {
  onRoomClick?: (roomId: number) => void
}

export function HouseMap({ onRoomClick }: HouseMapProps) {
  const { rooms, killerPosition, killer2Position, selectedRoom, selectRoom, gamePhase, killerKnockingRoom, killer2KnockingRoom, killStep, isKilling, isRoomKilled, playerPositions } = useGame()
  const { playKnock } = useKnockSound()
  const { playKill } = useKillSound()
  const prevKnockingRoomRef = useRef<number | null>(null)
  const prevKnocking2RoomRef = useRef<number | null>(null)

  useEffect(() => {
    if (killerKnockingRoom !== null && killerKnockingRoom !== prevKnockingRoomRef.current) {
      playKnock()
    }
    prevKnockingRoomRef.current = killerKnockingRoom
  }, [killerKnockingRoom, playKnock])

  useEffect(() => {
    if (killer2KnockingRoom !== null && killer2KnockingRoom !== prevKnocking2RoomRef.current) {
      playKnock()
    }
    prevKnocking2RoomRef.current = killer2KnockingRoom
  }, [killer2KnockingRoom, playKnock])

  const prevKillStepRef = useRef<number>(-1)
  useEffect(() => {
    if (gamePhase === 'killing' && isKilling && killStep >= 0 && killStep !== prevKillStepRef.current) {
      playKill()
      prevKillStepRef.current = killStep
    }
    if (gamePhase !== 'killing') {
      prevKillStepRef.current = -1
    }
  }, [gamePhase, isKilling, killStep, playKill])

  return (
    <div className="relative w-full h-full paper-bg">
      <div className="floor-plan-paper w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 paper-grain pointer-events-none" />

        <div className="w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 720 600"
            className={`w-full h-full ${gamePhase === 'killing' ? 'animate-shake' : ''}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="wobbleFilter" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
              </filter>
              <filter id="handDraw" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
              </filter>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.9" fill="#0d0d0d" opacity="0.12" />
              </pattern>
              <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 0 8 L 8 0" stroke="#0d0d0d" strokeWidth="0.35" opacity="0.18" />
                <path d="M 0 0 L 8 8" stroke="#0d0d0d" strokeWidth="0.35" opacity="0.12" />
              </pattern>
              <pattern id="tile" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#ffffff" />
                <path d="M 0 0 L 16 0 L 16 16" stroke="#0d0d0d" strokeWidth="0.4" fill="none" opacity="0.2" />
              </pattern>
              <pattern id="carpet" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" fill="#ffffff" />
                <circle cx="5" cy="5" r="0.8" fill="#0d0d0d" opacity="0.12" />
              </pattern>
              <pattern id="wood" width="32" height="10" patternUnits="userSpaceOnUse">
                <rect width="32" height="10" fill="#ffffff" />
                <line x1="0" y1="9.5" x2="32" y2="9.5" stroke="#0d0d0d" strokeWidth="0.5" opacity="0.18" />
                <line x1="16" y1="0" x2="16" y2="10" stroke="#0d0d0d" strokeWidth="0.4" opacity="0.12" />
              </pattern>
              <pattern id="hall" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="#ffffff" />
                <rect x="0.5" y="0.5" width="23" height="23" fill="none" stroke="#0d0d0d" strokeWidth="0.4" opacity="0.15" />
              </pattern>
            </defs>

            <g filter="url(#handDraw)">
              <rect x={260} y={6} width={200} height={22} fill="#ffffff" stroke="#0d0d0d" strokeWidth="2" transform="rotate(-1 360 17)" />
              <text
                x={360} y={22}
                textAnchor="middle"
                fill="#0d0d0d"
                fontSize="13"
                fontFamily="var(--font-bang), Impact"
                fontWeight="bold"
                letterSpacing="2"
                transform="rotate(-1 360 17)"
              >
                UNC&apos;S HOUSE
              </text>
            </g>

            {/* room floors — colored paper fills */}
            <g filter="url(#handDraw)">
              <rect x={40} y={40} width={220} height={180} fill="url(#carpet)" />
              <rect x={40} y={240} width={180} height={160} fill="url(#carpet)" />
              <rect x={40} y={420} width={180} height={140} fill="url(#carpet)" />
              <rect x={500} y={40} width={180} height={160} fill="url(#wood)" />
              <rect x={280} y={40} width={200} height={130} fill="url(#tile)" />
              <rect x={500} y={220} width={180} height={120} fill="url(#tile)" />
              <rect x={500} y={360} width={180} height={200} fill="url(#tile)" />
              <rect x={240} y={190} width={240} height={370} fill="url(#hall)" />
            </g>

            <g opacity="0.35">
              <circle cx={120} cy={150} r={22} fill="none" stroke="#0d0d0d" strokeWidth="1.3" strokeDasharray="2,4" />
              <circle cx={580} cy={460} r={14} fill="none" stroke="#0d0d0d" strokeWidth="1" strokeDasharray="2,6" />
              <path d="M 310 260 Q 330 250 360 275" fill="none" stroke="#0d0d0d" strokeWidth="1" strokeDasharray="2,6" />
              <path d="M 200 480 Q 220 500 190 530" fill="none" stroke="#0d0d0d" strokeWidth="1" strokeDasharray="2,8" />
            </g>

            {/* walls — hand-drawn thick black outlines */}
            <g stroke="#0d0d0d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#handDraw)">
              {/* outer box */}
              <path d="M 36 36 L 684 36 L 684 564 L 36 564 Z" />
              {/* interior walls */}
              <line x1={36} y1={224} x2={264} y2={224} />
              <line x1={36} y1={404} x2={244} y2={404} />
              <line x1={264} y1={36} x2={264} y2={100} />
              <line x1={264} y1={140} x2={264} y2={170} />
              <line x1={264} y1={170} x2={484} y2={170} />
              <line x1={224} y1={224} x2={224} y2={290} />
              <line x1={224} y1={330} x2={224} y2={460} />
              <line x1={224} y1={500} x2={224} y2={564} />
              <line x1={484} y1={36} x2={484} y2={100} />
              <line x1={484} y1={140} x2={484} y2={260} />
              <line x1={484} y1={295} x2={484} y2={348} />
              <line x1={484} y1={204} x2={684} y2={204} />
              <line x1={484} y1={344} x2={684} y2={344} />
              <line x1={484} y1={348} x2={484} y2={430} />
              <line x1={484} y1={470} x2={484} y2={564} />
            </g>

            <g stroke="#0d0d0d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="#ffffff" filter="url(#handDraw)">
              {/* master bedroom */}
              <g>
                <rect x={64} y={70} width={90} height={90} />
                <rect x={70} y={78} width={34} height={16} />
                <rect x={110} y={78} width={34} height={16} />
                <text x={109} y={130} fontSize="10" fontFamily="var(--font-hand)" fill="#0d0d0d" stroke="none">zzz</text>
                <rect x={190} y={70} width={55} height={36} />
                <line x1={190} y1={78} x2={245} y2={78} />
              </g>

              {/* bedroom 2 */}
              <g>
                <rect x={60} y={260} width={70} height={80} />
                <line x1={60} y1={300} x2={130} y2={300} />
                <rect x={150} y={280} width={50} height={28} />
                <text x={175} y={298} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#0d0d0d" stroke="none">GMI?</text>
              </g>

              {/* bedroom 3 */}
              <g>
                <rect x={55} y={445} width={60} height={80} />
                <rect x={63} y={452} width={38} height={14} />
                <rect x={140} y={440} width={55} height={20} />
                <rect x={140} y={464} width={55} height={20} />
                <line x1={148} y1={443} x2={148} y2={457} />
                <line x1={156} y1={443} x2={156} y2={457} />
                <line x1={164} y1={443} x2={164} y2={457} />
              </g>

              {/* study / trading desk */}
              <g>
                <rect x={520} y={60} width={145} height={26} />
                <rect x={528} y={66} width={36} height={18} />
                <rect x={568} y={66} width={36} height={18} />
                <rect x={608} y={66} width={36} height={18} />
                <circle cx={595} cy={115} r={10} />
                <rect x={530} y={130} width={10} height={22} />
                <text x={546} y={148} fontSize="7" fontFamily="var(--font-hand)" fill="#0d0d0d" stroke="none">HOPIUM</text>
                <polyline points="530,180 545,172 560,178 578,170 595,182 612,178 630,190 648,188" fill="none" />
              </g>

              {/* master bath */}
              <g>
                <rect x={300} y={55} width={80} height={40} rx={12} />
                <text x={340} y={80} textAnchor="middle" fontSize="11" fontFamily="var(--font-hand)" fill="#0d0d0d" stroke="none">TUB</text>
                <ellipse cx={430} cy={80} rx={14} ry={17} />
                <rect x={419} y={62} width={22} height={10} />
                <rect x={300} y={125} width={90} height={22} />
                <circle cx={325} cy={136} r={7} />
                <circle cx={365} cy={136} r={7} />
              </g>

              {/* bathroom 2 */}
              <g>
                <ellipse cx={530} cy={262} rx={12} ry={16} />
                <rect x={520} y={244} width={20} height={10} />
                <rect x={580} y={240} width={46} height={20} />
                <ellipse cx={603} cy={250} rx={11} ry={5} />
                <rect x={570} y={280} width={70} height={50} />
              </g>

              {/* kitchen */}
              <g>
                <rect x={520} y={390} width={140} height={34} />
                <circle cx={540} cy={408} r={6} />
                <circle cx={558} cy={408} r={6} />
                <circle cx={576} cy={408} r={6} />
                <circle cx={594} cy={408} r={6} />
                <rect x={640} y={380} width={28} height={55} />
                <line x1={640} y1={407} x2={668} y2={407} />
                <rect x={530} y={435} width={50} height={26} />
                <text x={555} y={453} textAnchor="middle" fontSize="9" fontFamily="var(--font-bang), Impact" fill="#0d0d0d" stroke="none">PIZZA</text>
                <rect x={565} y={475} width={80} height={50} />
                <text x={605} y={505} textAnchor="middle" fontSize="16" fontFamily="var(--font-hand)" stroke="none">😭</text>
              </g>

            </g>

            {/* doors as arcs */}
            <g stroke="#0d0d0d" strokeWidth="1.5" strokeDasharray="3,4" fill="none" opacity="0.55">
              <path d="M 264 100 A 40 40 0 0 1 264 140" />
              <path d="M 340 170 A 40 40 0 0 0 380 170" transform="translate(0 2)" />
              <path d="M 224 290 A 40 40 0 0 1 224 330" />
              <path d="M 224 460 A 40 40 0 0 1 224 500" />
              <path d="M 484 100 A 40 40 0 0 0 484 140" />
              <path d="M 484 260 A 35 35 0 0 0 484 295" />
              <path d="M 484 430 A 40 40 0 0 0 484 470" />
            </g>

            {/* room interactive overlays */}
            {rooms.map(room => (
              <Room
                key={room.id}
                room={room}
                isSelected={selectedRoom === room.id}
                onClick={() => {
                  selectRoom(room.id)
                  if (onRoomClick && gamePhase === 'betting') onRoomClick(room.id)
                }}
              />
            ))}

            {/* killers */}
            <Killer
              position={killerPosition}
              isKnocking={gamePhase === 'knocking' && killerKnockingRoom !== null}
              isKilling={gamePhase === 'killing' && isKilling}
            />
            <Killer
              position={killer2Position}
              isKnocking={gamePhase === 'knocking' && killer2KnockingRoom !== null}
              isKilling={gamePhase === 'killing' && isKilling}
            />

            {/* hiding wojaks */}
            {rooms.map(room => {
              const playersInRoom = playerPositions.filter((p: any) => p.roomId === room.id)
              const betCount = room.freeBets.length + room.gamblingBets.length
              const totalPersons = Math.max(playersInRoom.length, betCount)
              if (totalPersons === 0) return null
              return (
                <g key={`persons-${room.id}`}>
                  {Array.from({ length: Math.min(totalPersons, 6) }).map((_, idx) => (
                    <HidingPerson
                      key={`person-${room.id}-${idx}`}
                      roomX={room.x}
                      roomY={room.y}
                      roomWidth={room.width}
                      roomHeight={room.height}
                      personIndex={idx}
                      isKilled={isRoomKilled(room.id)}
                    />
                  ))}
                </g>
              )
            })}

            {/* legend corner doodle */}
            <g transform="translate(36 570)" opacity="0.75">
              <text x={0} y={0} fontSize="9" fontFamily="var(--font-hand)" fill="#0d0d0d">
                by unc &bull; not financial advice
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
