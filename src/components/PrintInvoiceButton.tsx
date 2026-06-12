'use client'

export default function PrintInvoiceButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-primary print-button">
      🖨️ สั่งพิมพ์ (Print)
    </button>
  )
}
