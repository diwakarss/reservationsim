// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import '/src/styles/globals.css'
import React, { ReactNode } from 'react';
import { SimulationProvider } from '@/contexts/simulationcontext';
import { Toaster } from "@/components/ui/toaster"

interface Props {
  children: ReactNode;
}

const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export default function Layout({ children }: Props) {
  return (
    <html lang="en">
      <body 
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        <SimulationProvider>
          <main>{children}</main>
          <Toaster />
        </SimulationProvider>
      </body>
    </html>
  )
}
