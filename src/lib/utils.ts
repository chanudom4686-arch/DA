import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOverdueDays(billDate: Date, paymentDate: number | null): number {
  if (!paymentDate) return 0
  const dueDate = new Date(billDate)
  dueDate.setDate(paymentDate)
  // If payment date is earlier in the month than the bill date, it means next month
  if (dueDate < billDate) {
    dueDate.setMonth(dueDate.getMonth() + 1)
  }
  const now = new Date()
  
  // Reset time to start of day for accurate day calculation
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
  
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}
