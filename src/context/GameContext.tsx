'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { triggerServerDevBuy } from '@/utils/devbuy'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface FreeBet {
  walletAddress: string
  roomId: number
  timestamp: number
}

export interface GamblingBet {
  walletAddress: string
  roomId: number
  amount: number
  timestamp: number
}

export interface Room {
  id: number
  name: string
  x: number
  y: number
  width: number
  height: number
  freeBets: FreeBet[]
  gamblingBets: GamblingBet[]
}

export type GamePhase = 'betting' | 'knocking' | 'killing' | 'result'

export interface DoorPosition {
  roomId: number
  x: number
  y: number
}

export interface RoundResult {
  survivingRoom: number
  killedRooms: number[]
  totalPot: number
  winnersExist: boolean
  payouts: { wallet: string; amount: number; betAmount: number }[]
  correctFreeBets: string[]
  devBuyAmount: number
}

export interface PlayerPosition {
  walletAddress: string
  roomId: number | null
  positionX: number | null
  positionY: number | null
}

interface GameState {
  rooms: Room[]
  killerPosition: { x: number; y: number }
  killer2Position: { x: number; y: number }
  killerTargetRoom: number | null
  killer2TargetRoom: number | null
  killerKnockingRoom: number | null
  killer2KnockingRoom: number | null
  killerKillRooms: number[]
  killer2KillRooms: number[]
  survivingRoom: number | null
  killSequence: { killer: 1 | 2; roomId: number }[]
  killStep: number
  currentRound: number
  roundTimeRemaining: number
  gamePhase: GamePhase
  selectedRoom: number | null
  isKilling: boolean
  knockSequence: number[]
  knock2Sequence: number[]
  knockIndex: number
  roundResult: RoundResult | null
  playerPositions: PlayerPosition[]
  sessionId: string | null
  sessionLoaded: boolean
}

interface GameContextType extends GameState {
  placeFreeBet: (roomId: number, walletAddress: string) => Promise<boolean>
  placeGamblingBet: (roomId: number, amount: number, walletAddress: string) => Promise<void>
  selectRoom: (roomId: number | null) => void
  startNewRound: () => void
  skipBettingTimer: () => void
  getTotalGamblingBetsForRoom: (roomId: number) => number
  getFreeBetCountForRoom: (roomId: number) => number
  getTotalPot: () => number
  hasPlacedFreeBet: (walletAddress: string) => boolean
  getMyGamblingBets: (walletAddress: string) => GamblingBet[]
  getRoomsWithBets: () => number[]
  updatePlayerPosition: (walletAddress: string, roomId: number | null) => Promise<void>
  isRoomKilled: (roomId: number) => boolean
}

const BETTABLE_ROOMS: Room[] = [
  { id: 1, name: "Unc's Lair", x: 40, y: 40, width: 220, height: 180, freeBets: [], gamblingBets: [] },
  { id: 2, name: 'Coper Bunk', x: 40, y: 240, width: 180, height: 160, freeBets: [], gamblingBets: [] },
  { id: 3, name: 'Mom Basement', x: 40, y: 420, width: 180, height: 140, freeBets: [], gamblingBets: [] },
  { id: 4, name: 'Trading Desk', x: 500, y: 40, width: 180, height: 160, freeBets: [], gamblingBets: [] },
  { id: 5, name: 'Crying Tub', x: 280, y: 40, width: 200, height: 130, freeBets: [], gamblingBets: [] },
  { id: 6, name: 'Cope Closet', x: 500, y: 220, width: 180, height: 120, freeBets: [], gamblingBets: [] },
  { id: 7, name: 'Pizza Den', x: 500, y: 360, width: 180, height: 200, freeBets: [], gamblingBets: [] },
]

const buildInitialRooms = (): Room[] => [
  ...BETTABLE_ROOMS.map(r => ({ ...r, freeBets: [] as FreeBet[], gamblingBets: [] as GamblingBet[] })),
]

const doorPositions: DoorPosition[] = [
  { roomId: 1, x: 268, y: 120 },
  { roomId: 2, x: 228, y: 310 },
  { roomId: 3, x: 228, y: 480 },
  { roomId: 4, x: 480, y: 120 },
  { roomId: 5, x: 360, y: 178 },
  { roomId: 6, x: 480, y: 278 },
  { roomId: 7, x: 480, y: 450 },
]

const HALLWAY_WAYPOINTS = [
  { x: 340, y: 220 },
  { x: 340, y: 375 },
  { x: 340, y: 520 },
  { x: 300, y: 375 },
  { x: 400, y: 300 },
  { x: 340, y: 220 },
]
const HALLWAY_WAYPOINTS_2 = [
  { x: 380, y: 520 },
  { x: 380, y: 375 },
  { x: 380, y: 220 },
  { x: 420, y: 375 },
  { x: 320, y: 300 },
  { x: 380, y: 520 },
]
const HALLWAY_CENTER = { x: 340, y: 375 }
const HALLWAY_CENTER_2 = { x: 380, y: 375 }

const BETTING_DURATION = 60
const KNOCK_DURATION = 3000
const KILL_STEP_DURATION = 3000
const KILL_FINAL_PAUSE = 5000
const KILL_FINAL_DURATION = 4000
const RESULT_DISPLAY_DURATION = 8000
const FREE_BET_DEVBUY = 0.01
const MASTER_HEARTBEAT_INTERVAL = 5000
const MASTER_STALE_THRESHOLD = 8000

// Generate a unique client ID per browser tab
function getClientId(): string {
  let id = sessionStorage.getItem('game_client_id')
  if (!id) {
    id = 'client_' + Math.random().toString(36).substring(2) + '_' + Date.now()
    sessionStorage.setItem('game_client_id', id)
  }
  return id
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>(buildInitialRooms())
  const [killerPosition, setKillerPosition] = useState(HALLWAY_CENTER)
  const [killer2Position, setKiller2Position] = useState(HALLWAY_CENTER_2)
  const [killerTargetRoom, setKillerTargetRoom] = useState<number | null>(null)
  const [killer2TargetRoom, setKiller2TargetRoom] = useState<number | null>(null)
  const [killerKnockingRoom, setKillerKnockingRoom] = useState<number | null>(null)
  const [killer2KnockingRoom, setKiller2KnockingRoom] = useState<number | null>(null)
  const [killerKillRooms, setKillerKillRooms] = useState<number[]>([])
  const [killer2KillRooms, setKiller2KillRooms] = useState<number[]>([])
  const [survivingRoom, setSurvivingRoom] = useState<number | null>(null)
  const [killSequence, setKillSequence] = useState<{ killer: 1 | 2; roomId: number }[]>([])
  const [killStep, setKillStep] = useState(-1)
  const [currentRound, setCurrentRound] = useState(1)
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(BETTING_DURATION)
  const [gamePhase, setGamePhase] = useState<GamePhase>('betting')
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [isKilling, setIsKilling] = useState(false)
  const [knockSequence, setKnockSequence] = useState<number[]>([])
  const [knock2Sequence, setKnock2Sequence] = useState<number[]>([])
  const [knockIndex, setKnockIndex] = useState(0)
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([])
  const [isGameMaster, setIsGameMaster] = useState(false)
  const [bettingEndsAt, setBettingEndsAt] = useState<number | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const knockTimerRef = useRef<NodeJS.Timeout | null>(null)
  const killTimerRef = useRef<NodeJS.Timeout | null>(null)
  const patrolTimerRef = useRef<NodeJS.Timeout | null>(null)
  const patrol2TimerRef = useRef<NodeJS.Timeout | null>(null)
  const patrolIndexRef = useRef(0)
  const patrol2IndexRef = useRef(0)
  const roomsSnapshotRef = useRef<Room[]>(rooms)
  const resultProcessedRef = useRef(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const isGameMasterRef = useRef(false)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
  const clientIdRef = useRef<string>('')
  const sessionIdRef = useRef<string | null>(null)
  const currentRoundRef = useRef(1)

  // Keep refs in sync for use in intervals/timeouts
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { currentRoundRef.current = currentRound }, [currentRound])

  const getRoomCenter = useCallback((roomId: number) => {
    const room = BETTABLE_ROOMS.find(r => r.id === roomId)
    if (!room) return HALLWAY_CENTER
    return { x: room.x + room.width / 2, y: room.y + room.height / 2 }
  }, [])

  const getRoomsWithBets = useCallback(() => {
    return rooms.filter(r => r.freeBets.length > 0 || r.gamblingBets.length > 0).map(r => r.id)
  }, [rooms])

  const getTotalGamblingBetsForRoom = useCallback((roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return 0
    return room.gamblingBets.reduce((sum: number, b: GamblingBet) => sum + b.amount, 0)
  }, [rooms])

  const getFreeBetCountForRoom = useCallback((roomId: number) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return 0
    return room.freeBets.length
  }, [rooms])

  const getTotalPot = useCallback(() => {
    return rooms.reduce((sum: number, r: Room) => sum + r.gamblingBets.reduce((s: number, b: GamblingBet) => s + b.amount, 0), 0)
  }, [rooms])

  const hasPlacedFreeBet = useCallback((walletAddress: string) => {
    return rooms.some(r => r.freeBets.some(b => b.walletAddress === walletAddress))
  }, [rooms])

  const getMyGamblingBets = useCallback((walletAddress: string) => {
    const bets: GamblingBet[] = []
    rooms.forEach(r => r.gamblingBets.forEach(b => {
      if (b.walletAddress === walletAddress) bets.push(b)
    }))
    return bets
  }, [rooms])

  // ============================================================
  // SERVER-SIDE GAME MASTER ELECTION
  // ============================================================
  const updateSessionOnServer = useCallback(async (sid: string, updates: Record<string, unknown>) => {
    try {
      await fetch('/api/game/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', sessionId: sid, updates })
      })
    } catch (err) {
      console.error('[Multiplayer] Error updating session:', err)
    }
  }, [])

  const tryClaimMaster = useCallback(async (sid: string): Promise<boolean> => {
    const clientId = clientIdRef.current
    try {
      // Try to read the session - use maybeSingle() to avoid PGRST116 crash
      const { data: session, error: readError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sid)
        .maybeSingle()

      if (readError || !session) {
        // Can't read session — just become master locally
        console.log('[Multiplayer] 👑 No session found, becoming master locally')
        isGameMasterRef.current = true
        setIsGameMaster(true)
        return true
      }

      const currentMaster = (session as Record<string, any>).game_master_id || null
      const lastSeen = (session as Record<string, any>).game_master_last_seen || null

      // Already the master
      if (currentMaster === clientId) {
        isGameMasterRef.current = true
        setIsGameMaster(true)
        return true
      }

      // Determine if we should claim: no master, or master is stale (>15s)
      let shouldClaim = !currentMaster
      if (currentMaster && lastSeen) {
        const elapsed = Date.now() - new Date(lastSeen).getTime()
        if (elapsed > MASTER_STALE_THRESHOLD) {
          shouldClaim = true
          console.log(`[Multiplayer] ⏱️ Master stale (${Math.round(elapsed / 1000)}s), claiming...`)
        }
      } else if (currentMaster && !lastSeen) {
        // Has master but no timestamp — assume stale
        shouldClaim = true
      }

      if (shouldClaim) {
        const { error: writeError } = await supabase
          .from('game_sessions')
          .update({
            game_master_id: clientId,
            game_master_last_seen: new Date().toISOString()
          })
          .eq('id', sid)

        if (!writeError) {
          isGameMasterRef.current = true
          setIsGameMaster(true)
          console.log('[Multiplayer] 👑 Claimed game master!')
          return true
        } else {
          // If update fails (e.g. columns don't exist), be master locally anyway
          // The game will still work — just won't sync master identity via DB
          console.warn('[Multiplayer] ⚠️ Could not write master to DB, becoming master locally:', writeError.message)
          isGameMasterRef.current = true
          setIsGameMaster(true)
          return true
        }
      }

      isGameMasterRef.current = false
      setIsGameMaster(false)
      console.log('[Multiplayer] 👥 Another client is game master:', currentMaster)
      return false
    } catch (err) {
      // On any error, become master locally so the game still works
      console.warn('[Multiplayer] ⚠️ Master claim error, becoming master locally:', err)
      isGameMasterRef.current = true
      setIsGameMaster(true)
      return true
    }
  }, [])

  const startHeartbeat = useCallback((sid: string) => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current)

    heartbeatRef.current = setInterval(async () => {
      if (!isGameMasterRef.current) {
        // Try to claim if master went stale
        await tryClaimMaster(sid)
        return
      }
      // Heartbeat: update last_seen
      await supabase
        .from('game_sessions')
        .update({ game_master_last_seen: new Date().toISOString() })
        .eq('id', sid)
        .eq('game_master_id', clientIdRef.current)
    }, MASTER_HEARTBEAT_INTERVAL)
  }, [tryClaimMaster])

  // ============================================================
  // APPLY SERVER STATE TO LOCAL STATE (for followers)
  // ============================================================
  const applySessionState = useCallback((session: Record<string, any>) => {
    // Only apply if we are NOT the game master (master sets state locally)
    if (isGameMasterRef.current) return

    const newPhase = session.game_phase
    setGamePhase(newPhase)
    setKillerPosition({ x: Number(session.killer_position_x), y: Number(session.killer_position_y) })
    setKiller2Position({ x: Number(session.killer2_position_x || HALLWAY_CENTER_2.x), y: Number(session.killer2_position_y || HALLWAY_CENTER_2.y) })
    setKillerTargetRoom(session.killer_target_room)
    setKiller2TargetRoom(session.killer2_target_room || null)
    setKillerKnockingRoom(session.killer_knocking_room)
    setKiller2KnockingRoom(session.killer2_knocking_room || null)
    setKillerKillRooms(session.killer_kill_rooms || [])
    setKiller2KillRooms(session.killer2_kill_rooms || [])
    setSurvivingRoom(session.surviving_room || null)
    setKillSequence(session.kill_sequence || [])
    setKillStep(session.kill_step ?? -1)
    setKnockSequence(session.knock_sequence || [])
    setKnock2Sequence(session.knock2_sequence || [])
    setKnockIndex(session.knock_index || 0)
    setIsKilling(session.is_killing || false)
    setCurrentRound(session.round_number)

    // Sync betting_ends_at so follower timer derives from same absolute timestamp
    if (session.betting_ends_at) {
      setBettingEndsAt(new Date(session.betting_ends_at).getTime())
    } else if (newPhase === 'betting' && session.round_time_remaining > 0) {
      // Fallback: old sessions without betting_ends_at — compute from remaining time
      setBettingEndsAt(Date.now() + session.round_time_remaining * 1000)
    }

    // For non-betting phases, keep round_time_remaining from server
    if (newPhase !== 'betting') {
      setRoundTimeRemaining(session.round_time_remaining)
    }

    // When master resets to a new betting round, followers must also reset local bets/rooms
    if (newPhase === 'betting' && session.round_time_remaining >= 55) {
      setRooms(buildInitialRooms())
      setRoundResult(null)
      setSelectedRoom(null)
      setPlayerPositions([])
    }
  }, [])

  // ============================================================
  // INIT SESSION + SUBSCRIBE TO REALTIME
  // ============================================================
  useEffect(() => {
    clientIdRef.current = getClientId()
    console.log('[Multiplayer] 🆔 Client ID:', clientIdRef.current)

    async function initSession() {
      try {
        const response = await fetch('/api/game/session')
        const data = await response.json()

        if (data.session) {
          const sid = data.session.id
          setSessionId(sid)
          setCurrentRound(data.session.round_number)
          setGamePhase(data.session.game_phase)
          setRoundTimeRemaining(data.session.round_time_remaining)
          setKillerPosition({ x: Number(data.session.killer_position_x), y: Number(data.session.killer_position_y) })
          setKiller2Position({ x: Number(data.session.killer2_position_x || HALLWAY_CENTER_2.x), y: Number(data.session.killer2_position_y || HALLWAY_CENTER_2.y) })
          setKillerTargetRoom(data.session.killer_target_room)
          setKiller2TargetRoom(data.session.killer2_target_room || null)
          setKillerKnockingRoom(data.session.killer_knocking_room)
          setKiller2KnockingRoom(data.session.killer2_knocking_room || null)
          setKillerKillRooms(data.session.killer_kill_rooms || [])
          setKiller2KillRooms(data.session.killer2_kill_rooms || [])
          setSurvivingRoom(data.session.surviving_room || null)
          setKillSequence(data.session.kill_sequence || [])
          setKillStep(data.session.kill_step ?? -1)
          setKnockSequence(data.session.knock_sequence || [])
          setKnock2Sequence(data.session.knock2_sequence || [])
          setKnockIndex(data.session.knock_index || 0)
          setIsKilling(data.session.is_killing || false)

          // Set betting_ends_at for timer sync
          if (data.session.betting_ends_at) {
            setBettingEndsAt(new Date(data.session.betting_ends_at).getTime())
          } else if (data.session.game_phase === 'betting' && data.session.round_time_remaining > 0) {
            // Fallback: old sessions without betting_ends_at — compute from remaining time
            const computed = Date.now() + data.session.round_time_remaining * 1000
            setBettingEndsAt(computed)
          }

          // Load existing bets
          try {
            const betsResponse = await fetch(`/api/game/bet?sessionId=${sid}`)
            const betsData = await betsResponse.json()
            if (betsData.bets) {
              const updatedRooms = buildInitialRooms()
              betsData.bets.forEach((bet: any) => {
                const room = updatedRooms.find((r: Room) => r.id === bet.room_id)
                if (room) {
                  if (bet.bet_type === 'free') {
                    room.freeBets.push({
                      walletAddress: bet.wallet_address,
                      roomId: bet.room_id,
                      timestamp: new Date(bet.created_at).getTime()
                    })
                  } else {
                    room.gamblingBets.push({
                      walletAddress: bet.wallet_address,
                      roomId: bet.room_id,
                      amount: bet.amount,
                      timestamp: new Date(bet.created_at).getTime()
                    })
                  }
                }
              })
              setRooms(updatedRooms)
            }
          } catch (betErr) {
            console.warn('[Multiplayer] Error loading bets:', betErr)
          }

          // Load player positions
          try {
            const posResponse = await fetch(`/api/game/position?sessionId=${sid}`)
            const posData = await posResponse.json()
            if (posData.positions) {
              setPlayerPositions(posData.positions.map((p: any) => ({
                walletAddress: p.wallet_address,
                roomId: p.room_id,
                positionX: p.position_x,
                positionY: p.position_y
              })))
            }
          } catch (posErr) {
            console.warn('[Multiplayer] Error loading positions:', posErr)
          }

          // Try to become game master — always ensure someone is master
          const isMaster = await tryClaimMaster(sid)
          if (!isMaster) {
            // If claim failed, wait a moment and try again (race condition on first load)
            setTimeout(async () => {
              await tryClaimMaster(sid)
            }, 2000)
          }
          startHeartbeat(sid)
        }
      } catch (error) {
        console.error('[Multiplayer] Error initializing session:', error)
        // Even on total failure, become master locally so the game runs
        isGameMasterRef.current = true
        setIsGameMaster(true)
        console.log('[Multiplayer] 👑 Fallback: becoming local master after init error')
      } finally {
        // Always mark session as loaded so UI can render the correct state
        setSessionLoaded(true)
      }
    }

    initSession()

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [tryClaimMaster, startHeartbeat])

  // ============================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================
  useEffect(() => {
    if (!sessionId) return

    console.log('[Multiplayer] 🔌 Setting up realtime for session:', sessionId)

    const channel = supabase
      .channel(`game:${sessionId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bets', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          console.log('[Multiplayer] 📥 Bet received:', payload.new)
          const bet = payload.new as Record<string, any>
          setRooms(prev => prev.map((room: Room) => {
            if (room.id === bet.room_id) {
              if (bet.bet_type === 'free') {
                // Avoid duplicates
                if (room.freeBets.some((b: FreeBet) => b.walletAddress === bet.wallet_address)) return room
                return {
                  ...room,
                  freeBets: [...room.freeBets, {
                    walletAddress: bet.wallet_address,
                    roomId: bet.room_id,
                    timestamp: new Date(bet.created_at).getTime()
                  }]
                }
              } else {
                return {
                  ...room,
                  gamblingBets: [...room.gamblingBets, {
                    walletAddress: bet.wallet_address,
                    roomId: bet.room_id,
                    amount: bet.amount,
                    timestamp: new Date(bet.created_at).getTime()
                  }]
                }
              }
            }
            return room
          }))
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          const session = payload.new as Record<string, any>
          console.log('[Multiplayer] 🎮 Session update received, phase:', session.game_phase, 'isMaster:', isGameMasterRef.current)
          applySessionState(session)
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'player_positions', filter: `session_id=eq.${sessionId}` },
        async () => {
          try {
            const posResponse = await fetch(`/api/game/position?sessionId=${sessionId}`)
            const posData = await posResponse.json()
            if (posData.positions) {
              setPlayerPositions(posData.positions.map((p: any) => ({
                walletAddress: p.wallet_address,
                roomId: p.room_id,
                positionX: p.position_x,
                positionY: p.position_y
              })))
            }
          } catch (err) {
            console.error('[Multiplayer] Error fetching positions:', err)
          }
        }
      )
      .subscribe((status) => {
        console.log('[Multiplayer] 📡 Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('[Multiplayer] ✅ Real-time sync active!')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Multiplayer] ❌ Channel error - check Supabase realtime replication')
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, applySessionState])

  // ============================================================
  // GAME MASTER LOGIC: PATROL during betting (TWO KILLERS)
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'betting') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return

    console.log('[Multiplayer] 🚶 Starting dual killer patrol (master)')
    patrolIndexRef.current = 0
    patrol2IndexRef.current = 0
    setKillerPosition(HALLWAY_WAYPOINTS[0])
    setKiller2Position(HALLWAY_WAYPOINTS_2[0])

    const patrol1 = () => {
      patrolIndexRef.current = (patrolIndexRef.current + 1) % HALLWAY_WAYPOINTS.length
      const newPos = HALLWAY_WAYPOINTS[patrolIndexRef.current]
      setKillerPosition(newPos)

      const sid = sessionIdRef.current
      if (sid) {
        updateSessionOnServer(sid, {
          killer_position_x: newPos.x,
          killer_position_y: newPos.y
        })
      }

      patrolTimerRef.current = setTimeout(patrol1, 2500 + Math.random() * 1500)
    }
    patrolTimerRef.current = setTimeout(patrol1, 2500)

    const patrol2 = () => {
      patrol2IndexRef.current = (patrol2IndexRef.current + 1) % HALLWAY_WAYPOINTS_2.length
      const newPos = HALLWAY_WAYPOINTS_2[patrol2IndexRef.current]
      setKiller2Position(newPos)

      const sid = sessionIdRef.current
      if (sid) {
        updateSessionOnServer(sid, {
          killer2_position_x: newPos.x,
          killer2_position_y: newPos.y
        })
      }

      patrol2TimerRef.current = setTimeout(patrol2, 2000 + Math.random() * 2000)
    }
    patrol2TimerRef.current = setTimeout(patrol2, 1500)

    return () => {
      if (patrolTimerRef.current) clearTimeout(patrolTimerRef.current)
      if (patrol2TimerRef.current) clearTimeout(patrol2TimerRef.current)
    }
  }, [gamePhase, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // SAFETY NET: If master is in betting phase but bettingEndsAt is
  // missing or already expired (0:00 stuck), force knocking immediately.
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'betting') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return

    // If bettingEndsAt is null (legacy session) or already in the past, transition now
    if (!bettingEndsAt || bettingEndsAt <= Date.now()) {
      const safetyTimeout = setTimeout(() => {
        // Double-check we're still in betting and still master
        if (isGameMasterRef.current) {
          console.log('[Multiplayer] ⚠️ Safety net: betting stuck at 0:00, forcing → knocking')
          setGamePhase('knocking')
          setRoundTimeRemaining(0)
          const sid = sessionIdRef.current
          if (sid) {
            updateSessionOnServer(sid, { game_phase: 'knocking', round_time_remaining: 0 })
          }
        }
      }, 1500) // Small delay to let normal flow take over if possible
      return () => clearTimeout(safetyTimeout)
    }
  }, [gamePhase, bettingEndsAt, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // UNIVERSAL BETTING TIMER — runs on ALL clients (master + followers)
  // All clients compute remaining time from the same absolute betting_ends_at
  // timestamp so everyone's timer is perfectly in sync.
  // Only the game master triggers the phase transition when time hits 0.
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'betting') return
    if (!bettingEndsAt) return

    const calcRemaining = () => Math.max(0, Math.ceil((bettingEndsAt - Date.now()) / 1000))

    // Set immediately so there's no 500ms delay on first render
    setRoundTimeRemaining(calcRemaining())

    const tick = setInterval(() => {
      const remaining = calcRemaining()
      setRoundTimeRemaining(remaining)

      if (remaining <= 0) {
        clearInterval(tick)
        // Only the game master drives the phase transition
        if (isGameMasterRef.current) {
          console.log('[Multiplayer] ⏱️ Timer done → knocking')
          setGamePhase('knocking')
          const sid = sessionIdRef.current
          if (sid) {
            updateSessionOnServer(sid, { game_phase: 'knocking', round_time_remaining: 0 })
          }
        }
      }
    }, 500)

    return () => clearInterval(tick)
  }, [gamePhase, bettingEndsAt, updateSessionOnServer])

  // ============================================================
  // GAME MASTER LOGIC: KNOCKING INIT (TWO KILLERS)
  // Shuffle all 7 rooms, split into two sequences for each killer.
  // Killer1 knocks rooms at even indices, Killer2 at odd indices.
  // They knock in alternating steps so they never hit the same room.
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'knocking') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return

    console.log('[Multiplayer] 🚪 Starting dual-killer knocking phase (master)')

    const shuffled = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5)
    // Split: killer1 gets indices 0,2,4,6 and killer2 gets indices 1,3,5
    const seq1 = shuffled.filter((_, i) => i % 2 === 0) // 4 rooms
    const seq2 = shuffled.filter((_, i) => i % 2 === 1) // 3 rooms
    console.log('[Multiplayer] 🚪 Killer1 knock sequence:', seq1)
    console.log('[Multiplayer] 🚪 Killer2 knock sequence:', seq2)
    setKnockSequence(seq1)
    setKnock2Sequence(seq2)
    setKnockIndex(0)
    setKillerKnockingRoom(null)
    setKiller2KnockingRoom(null)

    updateSessionOnServer(sessionId, {
      knock_sequence: seq1,
      knock2_sequence: seq2,
      knock_index: 0,
      killer_knocking_room: null,
      killer2_knocking_room: null
    })

    return () => { if (knockTimerRef.current) clearTimeout(knockTimerRef.current) }
  }, [gamePhase, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // GAME MASTER LOGIC: KNOCKING STEPS (TWO KILLERS)
  // At each knockIndex step, killer1 knocks knockSequence[knockIndex]
  // and killer2 knocks knock2Sequence[knockIndex] (if available).
  // They never knock the same room since the sequences are disjoint.
  // When both are done, pick 1 surviving room → 6 rooms get killed.
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'knocking') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return
    if (knockSequence.length === 0) return

    const maxSteps = Math.max(knockSequence.length, knock2Sequence.length)
    console.log(`[Multiplayer] 🚪 Knock step: ${knockIndex}/${maxSteps}`)

    if (knockIndex >= maxSteps) {
      // All rooms knocked → pick 1 surviving room, build step-by-step kill sequence
      const survId = BETTABLE_ROOMS[Math.floor(Math.random() * BETTABLE_ROOMS.length)].id
      const killedIds = BETTABLE_ROOMS.map(r => r.id).filter(id => id !== survId)
      // Shuffle killed rooms for randomness
      const shuffledKilled = killedIds.sort(() => Math.random() - 0.5)

      // Build kill sequence: alternating K1, K2 for first 4, then both choose final (6th) room
      // Steps 0-4: alternating killer 1 and 2
      // Step 5: final dramatic kill (killer 1 leads, both converge)
      const seq: { killer: 1 | 2; roomId: number }[] = [
        { killer: 1, roomId: shuffledKilled[0] },
        { killer: 2, roomId: shuffledKilled[1] },
        { killer: 1, roomId: shuffledKilled[2] },
        { killer: 2, roomId: shuffledKilled[3] },
        { killer: 1, roomId: shuffledKilled[4] }, // 5th kill — now 2 rooms left
        { killer: 2, roomId: shuffledKilled[5] }, // 6th kill — FINAL, both converge
      ]

      const k1Rooms = seq.filter(s => s.killer === 1).map(s => s.roomId)
      const k2Rooms = seq.filter(s => s.killer === 2).map(s => s.roomId)

      console.log(`[Multiplayer] 🔪 Surviving room: ${survId}, Kill sequence:`, seq)

      setKillerKnockingRoom(null)
      setKiller2KnockingRoom(null)
      setKillerKillRooms(k1Rooms)
      setKiller2KillRooms(k2Rooms)
      setSurvivingRoom(survId)
      setKillSequence(seq)
      setKillStep(0)
      setGamePhase('killing')

      updateSessionOnServer(sessionId, {
        game_phase: 'killing',
        killer_knocking_room: null,
        killer2_knocking_room: null,
        killer_kill_rooms: k1Rooms,
        killer2_kill_rooms: k2Rooms,
        surviving_room: survId,
        kill_sequence: seq,
        kill_step: 0
      })
      return
    }

    // Killer1 knocks its room at this index
    const serverUpdate: Record<string, any> = { knock_index: knockIndex }
    if (knockIndex < knockSequence.length) {
      const room1Id = knockSequence[knockIndex]
      const door1 = doorPositions.find((d: DoorPosition) => d.roomId === room1Id)
      if (door1) {
        console.log(`[Multiplayer] 🚪 Killer1 knocking room ${room1Id}`)
        setKillerPosition({ x: door1.x, y: door1.y })
        setKillerKnockingRoom(room1Id)
        setKillerTargetRoom(null)
        serverUpdate.killer_position_x = door1.x
        serverUpdate.killer_position_y = door1.y
        serverUpdate.killer_knocking_room = room1Id
        serverUpdate.killer_target_room = null
      }
    } else {
      setKillerKnockingRoom(null)
      serverUpdate.killer_knocking_room = null
    }

    // Killer2 knocks its room at this index
    if (knockIndex < knock2Sequence.length) {
      const room2Id = knock2Sequence[knockIndex]
      const door2 = doorPositions.find((d: DoorPosition) => d.roomId === room2Id)
      if (door2) {
        console.log(`[Multiplayer] 🚪 Killer2 knocking room ${room2Id}`)
        setKiller2Position({ x: door2.x, y: door2.y })
        setKiller2KnockingRoom(room2Id)
        setKiller2TargetRoom(null)
        serverUpdate.killer2_position_x = door2.x
        serverUpdate.killer2_position_y = door2.y
        serverUpdate.killer2_knocking_room = room2Id
        serverUpdate.killer2_target_room = null
      }
    } else {
      setKiller2KnockingRoom(null)
      serverUpdate.killer2_knocking_room = null
    }

    updateSessionOnServer(sessionId, serverUpdate)

    knockTimerRef.current = setTimeout(() => {
      setKnockIndex(prev => prev + 1)
    }, KNOCK_DURATION)

    return () => { if (knockTimerRef.current) clearTimeout(knockTimerRef.current) }
  }, [gamePhase, knockIndex, knockSequence, knock2Sequence, getRoomCenter, sessionId, isGameMaster, updateSessionOnServer])

  // ============================================================
  // GAME MASTER LOGIC: KILLING — STEP BY STEP
  // Each killStep: one killer moves to a room, kills it, pause, next step.
  // Steps 0–4: alternating K1/K2, one room each.
  // Step 5 (final): both killers converge on the last room — dramatic pause first.
  // After step 5 completes → result phase.
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'killing') return
    if (!isGameMasterRef.current) return
    if (!sessionId) return
    if (killSequence.length === 0) return
    if (killStep < 0) return

    // All 6 rooms killed → transition to result
    if (killStep >= killSequence.length) {
      console.log('[Multiplayer] 🔪 All kills done → result')
      setIsKilling(false)
      setGamePhase('result')

      const sid = sessionIdRef.current
      if (sid) {
        updateSessionOnServer(sid, {
          game_phase: 'result',
          is_killing: false,
          kill_step: killStep
        })
      }
      return
    }

    const step = killSequence[killStep]
    const isFinalKill = killStep === killSequence.length - 1
    const roomCenter = getRoomCenter(step.roomId)

    console.log(`[Multiplayer] 🔪 Kill step ${killStep + 1}/${killSequence.length}: Killer${step.killer} → Room ${step.roomId}${isFinalKill ? ' (FINAL)' : ''}`)

    setIsKilling(true)

    if (isFinalKill) {
      // FINAL KILL: Both killers converge on the last room
      // First move both to hallway center for dramatic effect, then converge
      setKillerPosition(HALLWAY_CENTER)
      setKiller2Position(HALLWAY_CENTER_2)
      setKillerTargetRoom(null)
      setKiller2TargetRoom(null)

      updateSessionOnServer(sessionId, {
        is_killing: true,
        kill_step: killStep,
        killer_position_x: HALLWAY_CENTER.x,
        killer_position_y: HALLWAY_CENTER.y,
        killer2_position_x: HALLWAY_CENTER_2.x,
        killer2_position_y: HALLWAY_CENTER_2.y,
        killer_target_room: null,
        killer2_target_room: null
      })

      // After dramatic pause, both killers move to the final room
      killTimerRef.current = setTimeout(() => {
        setKillerPosition(roomCenter)
        setKiller2Position(roomCenter)
        setKillerTargetRoom(step.roomId)
        setKiller2TargetRoom(step.roomId)

        const sid = sessionIdRef.current
        if (sid) {
          updateSessionOnServer(sid, {
            killer_position_x: roomCenter.x,
            killer_position_y: roomCenter.y,
            killer2_position_x: roomCenter.x,
            killer2_position_y: roomCenter.y,
            killer_target_room: step.roomId,
            killer2_target_room: step.roomId
          })
        }

        // After the final kill animation, advance to next step (which triggers → result)
        killTimerRef.current = setTimeout(() => {
          setKillStep(prev => prev + 1)
        }, KILL_FINAL_DURATION)
      }, KILL_FINAL_PAUSE)
    } else {
      // Normal kill step: one killer enters the room
      if (step.killer === 1) {
        setKillerPosition(roomCenter)
        setKillerTargetRoom(step.roomId)
      } else {
        setKiller2Position(roomCenter)
        setKiller2TargetRoom(step.roomId)
      }

      const serverUpdate: Record<string, any> = {
        is_killing: true,
        kill_step: killStep,
      }
      if (step.killer === 1) {
        serverUpdate.killer_position_x = roomCenter.x
        serverUpdate.killer_position_y = roomCenter.y
        serverUpdate.killer_target_room = step.roomId
      } else {
        serverUpdate.killer2_position_x = roomCenter.x
        serverUpdate.killer2_position_y = roomCenter.y
        serverUpdate.killer2_target_room = step.roomId
      }
      updateSessionOnServer(sessionId, serverUpdate)

      // After kill animation, advance to next step
      killTimerRef.current = setTimeout(() => {
        setKillStep(prev => prev + 1)
      }, KILL_STEP_DURATION)
    }

    return () => { if (killTimerRef.current) clearTimeout(killTimerRef.current) }
  }, [gamePhase, killStep, killSequence, sessionId, isGameMaster, updateSessionOnServer, getRoomCenter])

  // ============================================================
  // ROOMS SNAPSHOT — always keep ref in sync during betting
  // ============================================================
  useEffect(() => {
    roomsSnapshotRef.current = rooms
  }, [rooms])

  useEffect(() => {
    if (gamePhase === 'betting') {
      resultProcessedRef.current = false
    }
  }, [gamePhase])

  // ============================================================
  // RESULT PROCESSING (only game master)
  // Winners = those who bet on the SURVIVING room (1 of 7)
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'result') return
    if (survivingRoom === null) return
    if (resultProcessedRef.current) return
    if (!isGameMasterRef.current) return

    resultProcessedRef.current = true

    const snapshotRooms = roomsSnapshotRef.current
    const allKilledRooms = [...killerKillRooms, ...killer2KillRooms]
    const allGamblingBets: GamblingBet[] = []
    snapshotRooms.forEach((r: Room) => r.gamblingBets.forEach((b: GamblingBet) => allGamblingBets.push(b)))

    const totalPot = allGamblingBets.reduce((s: number, b: GamblingBet) => s + b.amount, 0)
    // Winners are those who bet on the SURVIVING room
    const winningBets = allGamblingBets.filter((b: GamblingBet) => b.roomId === survivingRoom)
    const winningTotal = winningBets.reduce((s: number, b: GamblingBet) => s + b.amount, 0)

    // Correct free bets = those who picked the surviving room
    const survivingRoomData = snapshotRooms.find((r: Room) => r.id === survivingRoom)
    const correctFreeBets = survivingRoomData ? survivingRoomData.freeBets.map((b: FreeBet) => b.walletAddress) : []

    let payouts: RoundResult['payouts'] = []
    let devBuyAmount = correctFreeBets.length * FREE_BET_DEVBUY

    if (winningTotal > 0 && totalPot > 0) {
      payouts = winningBets.map((b: GamblingBet) => ({
        wallet: b.walletAddress,
        amount: (b.amount / winningTotal) * totalPot,
        betAmount: b.amount,
      }))
    } else if (totalPot > 0) {
      devBuyAmount += totalPot
    }

    const result: RoundResult = {
      survivingRoom,
      killedRooms: allKilledRooms,
      totalPot,
      winnersExist: winningTotal > 0,
      payouts,
      correctFreeBets,
      devBuyAmount,
    }
    setRoundResult(result)

    if (devBuyAmount > 0) {
      triggerServerDevBuy(devBuyAmount)
        .then(res => {
          if (res.success) {
            console.log(`[Game] ✅ Devbuy of ${devBuyAmount} SOL executed. TX: ${res.signature}`)
          } else {
            console.error(`[Game] ❌ Devbuy failed: ${res.error}`)
          }
        })
        .catch(err => {
          console.error(`[Game] ❌ Devbuy error:`, err)
        })
    }
  }, [gamePhase, survivingRoom, killerKillRooms, killer2KillRooms, isGameMaster])

  // ============================================================
  // ACTIONS
  // ============================================================
  const placeFreeBet = useCallback(async (roomId: number, walletAddress: string): Promise<boolean> => {
    if (gamePhase !== 'betting') return false
    if (!sessionId) return false

    const alreadyBet = rooms.some((r: Room) => r.freeBets.some((b: FreeBet) => b.walletAddress === walletAddress))
    if (alreadyBet) return false

    try {
      const response = await fetch('/api/game/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          roomId,
          betType: 'free',
          amount: 0
        })
      })

      const data = await response.json()
      return !!data.bet
    } catch (error) {
      console.error('Error placing free bet:', error)
      return false
    }
  }, [gamePhase, rooms, sessionId])

  const placeGamblingBet = useCallback(async (roomId: number, amount: number, walletAddress: string) => {
    if (gamePhase !== 'betting') return
    if (amount <= 0) return
    if (!sessionId) return

    try {
      await fetch('/api/game/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          roomId,
          betType: 'gambling',
          amount
        })
      })
    } catch (error) {
      console.error('Error placing gambling bet:', error)
    }
  }, [gamePhase, sessionId])

  const updatePlayerPosition = useCallback(async (walletAddress: string, roomId: number | null) => {
    if (!sessionId) return

    try {
      const room = roomId ? BETTABLE_ROOMS.find((r: Room) => r.id === roomId) : null
      const posX = room ? room.x + room.width / 2 : null
      const posY = room ? room.y + room.height / 2 : null

      await fetch('/api/game/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walletAddress,
          roomId,
          positionX: posX,
          positionY: posY
        })
      })
    } catch (error) {
      console.error('Error updating position:', error)
    }
  }, [sessionId])

  const selectRoom = useCallback((roomId: number | null) => {
    if (gamePhase !== 'betting') return
    setSelectedRoom(roomId)
  }, [gamePhase])

  const skipBettingTimer = useCallback(async () => {
    if (gamePhase !== 'betting') return
    if (!sessionId) return

    // Expire betting_ends_at so universal timer fires immediately on all clients
    const expiredAt = new Date(Date.now() - 1000).toISOString()
    setBettingEndsAt(Date.now() - 1000)
    setRoundTimeRemaining(0)
    setGamePhase('knocking')

    await updateSessionOnServer(sessionId, {
      game_phase: 'knocking',
      round_time_remaining: 0,
      betting_ends_at: expiredAt
    })
  }, [gamePhase, sessionId, updateSessionOnServer])

  // Start new round: RESET the same session (don't create a new one!)
  const startNewRound = useCallback(async () => {
    if (!sessionId) return

    console.log('[Multiplayer] 🔄 Starting new round on same session')

    // Delete old bets and positions for this session
    await supabase.from('bets').delete().eq('session_id', sessionId)
    await supabase.from('player_positions').delete().eq('session_id', sessionId)

    // Compute new round number and absolute betting end time
    const nextRound = currentRoundRef.current + 1
    const newBettingEndsAt = Date.now() + BETTING_DURATION * 1000

    // Push new state to server — betting_ends_at is the authoritative timer source
    await updateSessionOnServer(sessionId, {
      round_number: nextRound,
      game_phase: 'betting' as const,
      round_time_remaining: BETTING_DURATION,
      betting_ends_at: new Date(newBettingEndsAt).toISOString(),
      killer_position_x: HALLWAY_CENTER.x,
      killer_position_y: HALLWAY_CENTER.y,
      killer2_position_x: HALLWAY_CENTER_2.x,
      killer2_position_y: HALLWAY_CENTER_2.y,
      killer_target_room: null,
      killer2_target_room: null,
      killer_knocking_room: null,
      killer2_knocking_room: null,
      killer_kill_rooms: [] as number[],
      killer2_kill_rooms: [] as number[],
      surviving_room: null,
      kill_sequence: [],
      kill_step: -1,
      knock_sequence: [] as number[],
      knock2_sequence: [] as number[],
      knock_index: 0,
      is_killing: false,
      game_master_id: clientIdRef.current,
      game_master_last_seen: new Date().toISOString()
    })

    // Update local state
    isGameMasterRef.current = true
    setIsGameMaster(true)
    setCurrentRound(nextRound)
    setBettingEndsAt(newBettingEndsAt)
    setRooms(buildInitialRooms())
    setRoundTimeRemaining(BETTING_DURATION)
    setGamePhase('betting')
    setKillerTargetRoom(null)
    setKiller2TargetRoom(null)
    setKillerPosition(HALLWAY_CENTER)
    setKiller2Position(HALLWAY_CENTER_2)
    setKillerKnockingRoom(null)
    setKiller2KnockingRoom(null)
    setKillerKillRooms([])
    setKiller2KillRooms([])
    setSurvivingRoom(null)
    setKillSequence([])
    setKillStep(-1)
    setIsKilling(false)
    setSelectedRoom(null)
    setKnockSequence([])
    setKnock2Sequence([])
    setKnockIndex(0)
    setRoundResult(null)
    setPlayerPositions([])
  }, [sessionId, updateSessionOnServer])

  // ============================================================
  // AUTO-RESTART after result (game master only)
  // ============================================================
  useEffect(() => {
    if (gamePhase !== 'result') return
    if (!roundResult) return
    if (!isGameMasterRef.current) return

    const restartTimer = setTimeout(() => {
      startNewRound()
    }, RESULT_DISPLAY_DURATION)

    return () => clearTimeout(restartTimer)
  }, [gamePhase, roundResult, isGameMaster, startNewRound])

  // Only rooms killed up to current killStep are considered killed (step-by-step reveal)
  const isRoomKilled = useCallback((roomId: number) => {
    if (killSequence.length === 0 || killStep < 0) return false
    for (let i = 0; i <= Math.min(killStep, killSequence.length - 1); i++) {
      if (killSequence[i].roomId === roomId) return true
    }
    return false
  }, [killSequence, killStep])

  return (
    <GameContext.Provider value={{
      rooms,
      killerPosition,
      killer2Position,
      killerTargetRoom,
      killer2TargetRoom,
      killerKnockingRoom,
      killer2KnockingRoom,
      killerKillRooms,
      killer2KillRooms,
      survivingRoom,
      killSequence,
      killStep,
      currentRound,
      roundTimeRemaining,
      gamePhase,
      selectedRoom,
      isKilling,
      knockSequence,
      knock2Sequence,
      knockIndex,
      roundResult,
      playerPositions,
      sessionId,
      sessionLoaded,
      placeFreeBet,
      placeGamblingBet,
      selectRoom,
      startNewRound,
      skipBettingTimer,
      getTotalGamblingBetsForRoom,
      getFreeBetCountForRoom,
      getTotalPot,
      hasPlacedFreeBet,
      getMyGamblingBets,
      getRoomsWithBets,
      updatePlayerPosition,
      isRoomKilled,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
