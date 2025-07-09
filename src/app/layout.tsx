// export const fetchCache = 'force-no-store'
// export const revalidate = 0

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from './ThemeRegistry'
import { ProviderWrapper } from '@/redux/ProviderWrapper'
import './tapwrite.css'
import { InterrupCmdK } from '@/hoc/Interrupt_CmdK'
import { ProgressLoad } from '@/components/TopLoader'
import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swr-config'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task App',
  description: 'A comprehensive task app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProgressLoad />
        <InterrupCmdK>
          <ProviderWrapper>
            <ThemeRegistry options={{ key: 'mui' }}>
              <SWRConfig value={swrConfig}>{children} </SWRConfig>
            </ThemeRegistry>
          </ProviderWrapper>
        </InterrupCmdK>
      </body>
    </html>
  )
}
