import { getRoom } from '@/actions/room'
import { getInvoices } from '@/actions/invoice'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)
  if (!room) notFound()

  const invoices = await getInvoices(id)

  return (
    <div>
      <div className="header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title">ห้อง {room.name}</h1>
          <p className="subtitle">สถานะ: {room.status}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href={`/apartments/${room.apartmentId}`} className="btn btn-outline">
            &larr; กลับไปหอพัก
          </Link>
          <Link href={`/rooms/${room.id}/edit`} className="btn btn-outline">
            แก้ไขการตั้งค่าห้อง
          </Link>
          <Link href={`/rooms/${room.id}/invoices/new`} className="btn btn-primary">
            + ออกบิลใหม่
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>ข้อมูลผู้เช่า</h3>
          <p><strong>ชื่อ:</strong> {room.tenantName || '-'}</p>
          <p><strong>เบอร์โทร:</strong> {room.tenantPhone || '-'}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>ค่าใช้จ่ายประจำ</h3>
          <p><strong>ค่าเช่า:</strong> {room.rent} บาท</p>
          <p><strong>ค่าส่วนกลาง:</strong> {room.commonFee} บาท</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>มิเตอร์</h3>
          <p><strong>ไฟ:</strong> {room.elecMeterType} ({room.elecRate} บ./หน่วย)</p>
          <p><strong>น้ำ:</strong> {room.waterMeterType} {room.waterMeterType==='FLAT' ? `(${room.waterFlatRate} บ.)` : `(${room.waterRate} บ./หน่วย)`}</p>
        </div>
      </div>

      <h2 className="title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ประวัติบิลค่าเช่า</h2>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>รอบบิล</th>
              <th style={{ padding: '1rem' }}>วันที่ออกบิล</th>
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
                <td style={{ padding: '1rem' }}>{inv.grandTotal.toLocaleString()}</td>
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
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  ยังไม่มีประวัติบิล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
