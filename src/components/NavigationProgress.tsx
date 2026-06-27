'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ─── Inner component (needs useSearchParams → must be inside Suspense) ───────
function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeRef = useRef(false)

  // ── Complete the bar whenever the route finishes loading ──────────────────
  useEffect(() => {
    if (!completeRef.current) return
    // Route changed → slam bar to 100% then fade out
    setWidth(100)
    const t = setTimeout(() => {
      setVisible(false)
      setWidth(0)
      completeRef.current = false
    }, 350)
    return () => clearTimeout(t)
  }, [pathname, searchParams])

  // ── Listen for internal link clicks → start progress ─────────────────────
  useEffect(() => {
    const startProgress = () => {
      completeRef.current = true
      setVisible(true)
      setWidth(15)

      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setWidth(prev => {
          if (prev >= 80) {
            clearInterval(intervalRef.current!)
            return 80
          }
          return prev + Math.random() * 12 + 3
        })
      }, 450)
    }

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      // Skip: hash links, external, new tab, mailto/tel
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank' ||
        (href.startsWith('http') && !href.startsWith(window.location.origin))
      ) return
      startProgress()
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: `${width}%`,
        background: 'linear-gradient(to right, #7c3aed, #a855f7, #c084fc)',
        boxShadow: '0 0 8px rgba(124, 58, 237, 0.6)',
        zIndex: 99999,
        transition: width === 100
          ? 'width 0.2s ease, opacity 0.35s ease 0.15s'
          : 'width 0.4s ease',
        opacity: visible ? 1 : 0,
        borderRadius: '0 2px 2px 0',
        pointerEvents: 'none',
      }}
    />
  )
}

// ── Public export wrapped in Suspense (required for useSearchParams) ─────────
export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  )
}
