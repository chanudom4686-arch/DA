import { getInvoice } from '@/actions/invoice'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import InvoiceActions from '@/components/InvoiceActions'
import './print.css'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  
  if (!invoice) notFound()

  const room = invoice.room
  const apt = room.apartment

  return (
    <div>
      <div className="no-print header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="title">ใบแจ้งหนี้ / ใบเสร็จรับเงิน</h1>
          <p className="subtitle">ห้อง {room.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href={`/rooms/${room.id}`} className="btn btn-outline">
              &larr; กลับไปหน้าห้องพัก
            </Link>
            <button className="btn btn-primary print-button">
              🖨️ สั่งพิมพ์ (Print)
            </button>
          </div>
          <InvoiceActions invoiceId={invoice.id} isPaid={invoice.isPaid} />
        </div>
      </div>

      <div className="invoice-container">
        <div className="invoice-header">
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000', marginBottom: '0.5rem' }}>{apt.name}</h2>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{apt.address}</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>โทร: {apt.ownerPhone || '-'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>ใบแจ้งหนี้ (INVOICE)</h2>
            <p><strong>เลขที่:</strong> INV-{invoice.billingYear}{invoice.billingMonth.toString().padStart(2, '0')}-{room.name}</p>
            <p><strong>วันที่ออกบิล:</strong> {invoice.billDate.toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', border: '1px solid #000', borderRadius: '8px' }}>
          <div>
            <p><strong>ลูกค้า/ห้องพัก:</strong> ห้อง {room.name} {room.tenantName ? `(${room.tenantName})` : ''}</p>
            <p><strong>ประเภท:</strong> {room.isDaily ? 'รายวัน' : 'รายเดือน'}</p>
            {room.isDaily && invoice.checkIn && invoice.checkOut && (
              <p><strong>เข้าพัก:</strong> {invoice.checkIn.toLocaleDateString('th-TH')} ถึง {invoice.checkOut.toLocaleDateString('th-TH')}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p><strong>ประจำเดือน:</strong> {invoice.billingMonth} / {invoice.billingYear}</p>
            <p><strong>สถานะ:</strong> <span style={{ color: '#000', fontWeight: 'bold' }}>{invoice.isPaid ? 'ชำระแล้ว' : 'รอชำระเงิน'}</span></p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
            <tr style={{ backgroundColor: '#e5e7eb', color: '#000', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>รายการ (Description)</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>จำนวน/หน่วย</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>ราคา/หน่วย</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {/* Rent */}
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem' }}>ค่าเช่าห้องพัก (Room Rent)</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>1</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>{invoice.rentTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>

            {/* Common Fee */}
            {!room.isDaily && invoice.commonFeeTotal > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>ค่าส่วนกลาง (Common Fee)</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>1</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{invoice.commonFeeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            )}

            {/* Electricity */}
            {!room.isDaily && (
              <>
                {invoice.newElecMeter !== null && invoice.oldElecMeter !== null && invoice.newElecMeter > invoice.oldElecMeter && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>
                      ค่าไฟฟ้า {room.elecMeterType === 'DOUBLE' ? 'มิเตอร์ A ' : ''} 
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                        (จดครั้งก่อน: {invoice.oldElecMeter} / จดครั้งนี้: {invoice.newElecMeter})
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{invoice.newElecMeter - invoice.oldElecMeter}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{room.elecRate}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {((invoice.newElecMeter - invoice.oldElecMeter) * (room.elecRate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                {room.elecMeterType === 'DOUBLE' && invoice.newElecMeterB !== null && invoice.oldElecMeterB !== null && invoice.newElecMeterB > invoice.oldElecMeterB && (
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>
                      ค่าไฟฟ้า มิเตอร์ B 
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                        (จดครั้งก่อน: {invoice.oldElecMeterB} / จดครั้งนี้: {invoice.newElecMeterB})
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{invoice.newElecMeterB - invoice.oldElecMeterB}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{room.elecRate}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {((invoice.newElecMeterB - invoice.oldElecMeterB) * (room.elecRate || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </>
            )}

            {/* Water */}
            {!room.isDaily && invoice.waterTotal > 0 && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.75rem' }}>
                  ค่าน้ำประปา
                  {room.waterMeterType === 'FLAT' && <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>(เหมาจ่าย)</span>}
                  {room.waterMeterType === 'PERSON_MIN' && <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>(ขั้นต่ำ {room.waterMinCharge} บ./คน x {room.occupantsCount} คน)</span>}
                  {(room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') && invoice.newWaterMeter !== null && invoice.oldWaterMeter !== null && (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>
                      (จดครั้งก่อน: {invoice.oldWaterMeter} / จดครั้งนี้: {invoice.newWaterMeter})
                    </span>
                  )}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  {(room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') && invoice.newWaterMeter !== null && invoice.oldWaterMeter !== null 
                    ? invoice.newWaterMeter - invoice.oldWaterMeter 
                    : '-'}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  {room.waterMeterType === 'FLAT' ? '-' : room.waterRate}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{invoice.waterTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            )}

            {/* Total Row */}
            <tr style={{ backgroundColor: '#e5e7eb', fontWeight: 'bold', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
              <td colSpan={3} style={{ padding: '1rem', textAlign: 'right' }}>ยอดรวมสุทธิ (Grand Total)</td>
              <td style={{ padding: '1rem', textAlign: 'right', fontSize: '1.25rem', color: '#000' }}>
                {invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, border: '1px solid #000', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>ข้อมูลชำระเงิน</h3>
            <p><strong>ธนาคาร:</strong> {apt.bankName || '-'}</p>
            <p><strong>ชื่อบัญชี:</strong> {apt.bankAccountName || '-'}</p>
            <p><strong>เลขบัญชี:</strong> {apt.bankAccountNumber || '-'}</p>
            <p style={{ marginTop: '0.5rem' }}>กำหนดชำระภายในวันที่ {room.paymentDate || 5} ของเดือน</p>
          </div>
          
          {apt.qrCodeUrl && (
            <div style={{ textAlign: 'center' }}>
              <Image src={apt.qrCodeUrl} alt="QR Code" width={120} height={120} style={{ objectFit: 'contain' }} />
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>สแกน QR Code เพื่อชำระเงิน</p>
            </div>
          )}
        </div>

        {(apt.billNote || invoice.note) && (
          <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#475569' }}>
            <p><strong>หมายเหตุ:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{apt.billNote}</p>
            {invoice.note && <p style={{ whiteSpace: 'pre-wrap' }}>{invoice.note}</p>}
          </div>
        )}
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
    </div>
  )
}
