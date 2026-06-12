'use client'

import { Button } from './ui/button'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
      <Printer className="w-4 h-4" />
      พิมพ์รายงาน (Print)
    </Button>
  )
}
