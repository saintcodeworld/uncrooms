import type { Metadata } from 'next'
import { Patrick_Hand, Bangers, Caveat_Brush, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/components/WalletContextProvider'

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-hand',
})

const bangers = Bangers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bang',
})

const caveat = Caveat_Brush({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-scribble',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: '$UncKiller — Unc Is Coming For You',
  description: 'Pick a room. Pray Unc skips yours. Solana-powered wojak survival.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${patrickHand.variable} ${bangers.variable} ${caveat.variable} ${mono.variable}`}>
      <body className="font-hand paper-bg paper-grain text-ink antialiased">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  )
}
