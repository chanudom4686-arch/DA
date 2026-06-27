'use client'

interface LoadingOverlayProps {
  loading: boolean
  message?: string
  subMessage?: string
}

export default function LoadingOverlay({
  loading,
  message = 'กำลังดำเนินการ...',
  subMessage = 'กรุณารอสักครู่',
}: LoadingOverlayProps) {
  if (!loading) return null

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-card">
        <div className="loading-spinner" />
        <p className="loading-overlay-text">{message}</p>
        <p className="loading-overlay-sub">{subMessage}</p>
      </div>
    </div>
  )
}
