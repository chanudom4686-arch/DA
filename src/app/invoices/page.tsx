import { getAllInvoices } from '@/actions/invoice'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InvoicesIndexPage() {
  const invoices = await getAllInvoices()

  return (
    <div>
      <div className="header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title">บิลทั้งหมด (All Invoices)</h1>
          <p className="subtitle">ประวัติบิลค่าเช่าทั้งหมดในระบบ</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>รอบบิล</th>
              <th style={{ padding: '1rem' }}>วันที่ออกบิล</th>
              <th style={{ padding: '1rem' }}>หอพัก</th>
              <th style={{ padding: '1rem' }}>ห้อง</th>
              <th style={{ padding: '1rem' }}>ยอดรวม (บาท)</th>
              <th style={{ padding: '1rem' }}>สถานะ</th>
              <th style={{ padding: '1rem' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{inv.billingMonth}/{inv.billingYear}</td>
                <td style={{ padding: '1rem' }}>{inv.billDate.toLocaleDateString('th-TH')}</td>
                <td style={{ padding: '1rem' }}>{inv.room.apartment.name}</td>
                <td style={{ padding: '1rem' }}>{inv.room.name} {inv.room.isDaily ? '(รายวัน)' : ''}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem',
                    backgroundColor: inv.isPaid ? '#dcfce7' : '#fee2e2',
                    color: inv.isPaid ? '#166534' : '#991b1b'
                  }}>
                    {inv.isPaid ? 'จ่ายแล้ว' : 'ค้างชำระ'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/invoices/${inv.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    ดูบิล
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  ยังไม่มีบิลในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
