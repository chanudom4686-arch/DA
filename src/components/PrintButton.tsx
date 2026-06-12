'use client'

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-outline print-button">
      🖨️ พิมพ์รายงาน
    </button>
  )
}
