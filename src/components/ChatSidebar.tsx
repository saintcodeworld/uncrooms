'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Wifi, WifiOff } from 'lucide-react'
import { useChat } from '@/context/ChatContext'

export function ChatSidebar() {
  const { messages, sendMessage, senderId, senderName, isConnected } = useChat()
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    setIsSending(true)
    const text = input
    setInput('')
    try {
      await sendMessage(text)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isOwnMessage = (msgSenderId: string) => msgSenderId === senderId

  return (
    <div className="fixed left-0 top-[96px] bottom-0 z-40 w-80 flex flex-col bg-white border-r-[3px] border-ink shadow-[6px_0_0_0_#0d0d0d] font-hand">
      <div className="px-4 py-3 flex items-center justify-between border-b-[3px] border-ink bg-white shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-ink" />
          <h2 className="font-bang text-ink text-xl tracking-wider leading-none">COPE CHAT</h2>
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-ink" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-ink/50" />
          )}
        </div>
        <span className="font-hand text-xs text-ink/70 truncate max-w-[90px]">
          {senderName}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 opacity-70">
            <MessageCircle className="w-8 h-8 text-ink/50" />
            <p className="font-bang text-ink/70 text-lg tracking-wide">NO MSGS</p>
            <p className="font-hand text-sm text-ink/60">break the silence, coper</p>
          </div>
        )}

        {messages.map((msg) => {
          const own = isOwnMessage(msg.sender_id)
          return (
            <div key={msg.id} className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 mb-0.5 ${own ? 'flex-row-reverse' : ''}`}>
                <span className="font-bang text-[11px] tracking-wider text-ink">
                  {own ? 'YOU' : msg.sender_name}
                </span>
                <span className="font-hand text-xs text-ink/50">{formatTime(msg.created_at)}</span>
              </div>
              <div
                className={`max-w-[85%] px-3 py-1.5 text-sm font-hand leading-snug break-words border-2 border-ink ${
                  own ? 'bg-ink text-white' : 'bg-white text-ink'
                }`}
              >
                {msg.message}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-3 py-3 border-t-[3px] border-ink bg-white shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="cope with me..."
            maxLength={500}
            className="flex-1 bg-white border-[2px] border-ink text-ink text-sm font-hand px-3 py-2 placeholder:text-ink/40 focus:outline-none focus:bg-paper"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="w-9 h-9 flex items-center justify-center border-[2px] border-ink bg-white hover:bg-ink hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-doodle"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="font-hand text-xs text-ink/60 mt-1 text-center">
          {isConnected ? 'live · unc is listening 👁️' : 'connecting...'}
        </p>
      </div>
    </div>
  )
}
