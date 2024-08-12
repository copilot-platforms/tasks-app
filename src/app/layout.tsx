import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from './ThemeRegistry'
import { ProviderWrapper } from '@/redux/ProviderWrapper'
import './tapwrite.css'
import { InterrupCmdK } from '@/hoc/Interrupt_CmdK'
import { ProgressLoad } from '@/hoc/ProgressLoader'
import { RealTime } from '@/hoc/RealTime'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task App',
  description: 'A comprehensive task app',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProgressLoad />
        <InterrupCmdK>
          <ProviderWrapper>
            <RealTime>
              <ThemeRegistry options={{ key: 'mui' }}>{children}</ThemeRegistry>
            </RealTime>
          </ProviderWrapper>
        </InterrupCmdK>
      </body>
    </html>
  )
}
