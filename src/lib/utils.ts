export function getOverdueDays(billDate: Date, paymentDate: number | null): number {
  if (!paymentDate) return 0
  
  // Due date is usually the `paymentDate` of the month following the `billDate`
  // Actually, wait. If billDate is May 31, paymentDate is 5. Due date is June 5.
  // So due date = new Date(billDate.getFullYear(), billDate.getMonth() + 1, paymentDate)
  // Let's use that logic.
  const dueDate = new Date(billDate.getFullYear(), billDate.getMonth() + 1, paymentDate)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - dueDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}
