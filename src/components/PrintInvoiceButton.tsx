'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Button } from './ui/button'
import { Printer } from 'lucide-react'

export default function PrintInvoiceButton() {
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Note: react-to-print needs a ref to the component to print
  // In this current implementation, we are just printing the whole window
  // because the invoice page has @media print CSS to hide .no-print elements.
  // This achieves the exact same result without complex ref passing across Server/Client components.
  
  const handlePrint = () => {
    window.print()
  }

  return (
    <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
      <Printer className="w-4 h-4" />
      สั่งพิมพ์ (Print)
    </Button>
  )
}
