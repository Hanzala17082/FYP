'use client'

import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'
import { Button } from '@/shared/components/ui/Button'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'

export default function HomeClient() {
  return (
    <div className="relative min-h-screen flex flex-col w-full overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {/* Background Image */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent dark:to-background-dark z-10"></div>
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDh0bSL1iVgeARM6qePfOIh0hNQRBjVRhIPpevXbbzfQkiYtHKFnvj4bqYBhCjqC4YPjQF1OOQLd8Zwgp8S0Ml7e9L2livihz4sljgWGac1i7jUwyDxgzQtoupGgBeXaKpIE6qdEwCLnknvm5q9z-LKbKbi54elDt61QZPnA8FNgwDJKmcYrvJRmd0xBbkklBXRu5K1r0C08fk3Om9Mwe6bzDmz46BTInucSc-JeS1I6h4iFiSYKfizSZvRKw9w-8T9L09x0zAVC5o")',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <div className="w-full p-6 md:p-8 lg:p-12 flex justify-between items-start max-w-7xl mx-auto w-full">
          <Logo variant="light" />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 lg:px-12 pb-12">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              Discover Your Next
              <br />
              <span className="text-primary">Adventure</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Connect with verified travel agencies and book amazing trips
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/trips">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Trips
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
