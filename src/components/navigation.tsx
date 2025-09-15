'use client'

import Link from 'next/link'
import { Button } from './ui/button'

export function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            🍽️ GastroTools
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/speisekarten-designer/demo">
              <Button variant="ghost" size="sm">Demo</Button>
            </Link>
            <Link href="/admin/monitoring">
              <Button variant="ghost" size="sm">Monitoring</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}