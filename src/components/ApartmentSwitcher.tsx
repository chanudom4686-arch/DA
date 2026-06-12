'use client'

import Link from 'next/link'

export default function ApartmentSwitcher({ apartments, currentId }: { apartments: any[], currentId: string }) {
  if (apartments.length <= 1) return null // Hide if only 1 apartment

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.875rem', color: '#475569', marginRight: '0.5rem' }}>สลับหอพัก:</span>
      {apartments.map(apt => {
        const isActive = apt.id === currentId
        return (
          <Link 
            key={apt.id} 
            href={`/apartments/${apt.id}`}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '16px',
              fontSize: '0.875rem',
              textDecoration: 'none',
              backgroundColor: isActive ? 'var(--primary-color)' : '#f1f5f9',
              color: isActive ? 'white' : '#475569',
              fontWeight: isActive ? 'bold' : 'normal',
              border: isActive ? '1px solid var(--primary-color)' : '1px solid #cbd5e1',
              transition: 'all 0.2s'
            }}
          >
            {apt.name}
          </Link>
        )
      })}
    </div>
  )
}
