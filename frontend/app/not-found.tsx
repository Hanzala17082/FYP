import Link from 'next/link'
import { Logo } from '@/shared/components/layout/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A121F] p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-2">
          <Logo variant="light" showTagline={true} />
        </div>

        {/* Error Message Section */}
        <div className="space-y-6">
          <h1 className="text-8xl font-bold text-white/90 leading-none">404</h1>
          <h2 className="text-3xl font-semibold text-white/90">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-base max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href="/">
            <button className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/20 w-full sm:w-auto">
              Go Home
            </button>
          </Link>
          <Link href="/trips">
            <button className="px-6 py-3 bg-[#1F2937] hover:bg-[#374151] text-white font-semibold rounded-xl border border-gray-600 transition-colors duration-200 w-full sm:w-auto">
              Browse Trips
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
