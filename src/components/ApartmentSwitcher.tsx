'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ApartmentSwitcher({ apartments, currentId }: { apartments: any[], currentId: string }) {
  if (apartments.length <= 1) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-1">สลับหอพัก:</span>
      {apartments.map(apt => {
        const isActive = apt.id === currentId
        return (
          <Link 
            key={apt.id} 
            href={`/apartments/${apt.id}`}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors border",
              isActive 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-muted text-muted-foreground border-transparent hover:border-border hover:bg-muted/80"
            )}
          >
            {apt.name}
          </Link>
        )
      })}
    </div>
  )
}
