import { getMonthlyReport } from '@/actions/report'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const params = await searchParams
  
  const currentDate = new Date()
  const month = params.month ? parseInt(params.month) : currentDate.getMonth() + 1
  const year = params.year ? parseInt(params.year) : currentDate.getFullYear()

  const report = await getMonthlyReport(month, year)

  return (
    <div>
      <div className="no-print header">
        <div>
          <h1 className="title">รายงานสรุปรายรับ</h1>
          <p className="subtitle">สรุปยอดบิลและสถานะการชำระเงินประจำเดือน</p>
        </div>
        <button onClick={() => {}} className="btn btn-outline print-button">
          🖨️ พิมพ์รายงาน
        </button>
      </div>

      <div className="no-print card" style={{ marginBottom: '2rem' }}>
        <form className="grid grid-cols-3" style={{ alignItems: 'end' }}>
          <div>
            <label className="label">เดือน</label>
            <select name="month" defaultValue={month} className="input">
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>เดือน {i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">ปี (ค.ศ.)</label>
            <input type="number" name="year" defaultValue={year} className="input" />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>ดูรายงาน</button>
          </div>
        </form>
      </div>

      <div className="print-header" style={{ display: 'none', marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>รายงานสรุปรายรับ ประจำเดือน {month}/{year}</h2>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#6b21a8' }}>ยอดเรียกเก็บทั้งหมด</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#581c87', marginTop: '0.5rem' }}>{report.summary.grandTotal.toLocaleString()} บ.</p>
        </div>
        <div className="card" style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#166534' }}>เก็บเงินแล้ว</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14532d', marginTop: '0.5rem' }}>{report.summary.collected.toLocaleString()} บ.</p>
        </div>
        <div className="card" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#991b1b' }}>ค้างชำระ</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7f1d1d', marginTop: '0.5rem' }}>{report.summary.uncollected.toLocaleString()} บ.</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>จำนวนบิล</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{report.invoices.length} ใบ</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>ห้องพัก</th>
              <th style={{ padding: '1rem' }}>ผู้เช่า</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>ค่าเช่า</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>น้ำ+ไฟ</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>ยอดรวม</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>สถานะ</th>
              <th className="no-print" style={{ padding: '1rem', textAlign: 'center' }}>ลิงก์</th>
            </tr>
          </thead>
          <tbody>
            {report.invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <strong>{inv.room.name}</strong>
                  <br/>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.room.apartment.name}</span>
                </td>
                <td style={{ padding: '1rem' }}>{inv.room.tenantName || '-'}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{inv.rentTotal.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{(inv.waterTotal + inv.elecTotal).toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>{inv.grandTotal.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem',
                    backgroundColor: inv.isPaid ? '#dcfce7' : '#fee2e2',
                    color: inv.isPaid ? '#166534' : '#991b1b'
                  }}>
                    {inv.isPaid ? 'จ่ายแล้ว' : 'ค้างชำระ'}
                  </span>
                </td>
                <td className="no-print" style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link href={`/invoices/${inv.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                    ดูบิล
                  </Link>
                </td>
              </tr>
            ))}
            {report.invoices.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  ไม่มีข้อมูลบิลในเดือนนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('.print-button').addEventListener('click', function() {
              window.print();
            });
          `
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          .print-header { display: block !important; }
          body { background: white; color: black; }
          .card { border: none; box-shadow: none; padding: 0; }
          table { border: 1px solid #ccc; }
          th, td { border: 1px solid #ccc; }
        }
      `}} />
    </div>
  )
}
