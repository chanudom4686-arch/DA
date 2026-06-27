import { getInvoice } from '@/actions/invoice'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import InvoiceActions from '@/components/InvoiceActions'
import PrintInvoiceButton from '@/components/PrintInvoiceButton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import './print.css'

export const dynamic = 'force-dynamic'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  
  if (!invoice) notFound()

  const room = invoice.room
  const apt = room.apartment

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ใบแจ้งหนี้ / ใบเสร็จรับเงิน</h1>
          <p className="text-muted-foreground mt-1">ห้อง {room.name}</p>
        </div>
        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full md:w-auto">
            <Link href={`/rooms/${room.id}`} className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                กลับไปห้องพัก
              </Button>
            </Link>
            <PrintInvoiceButton />
          </div>
          <div className="w-full md:w-auto">
            <InvoiceActions invoiceId={invoice.id} isPaid={invoice.isPaid} />
          </div>
        </div>
      </div>

      <Card className="invoice-container p-8 mx-auto max-w-4xl bg-white text-black shadow-lg print:shadow-none print:p-0 print:border-none print:max-w-none">
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{apt.name}</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{apt.address}</p>
            <p className="text-sm mt-2 text-gray-700">โทร: {apt.ownerPhone || '-'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ใบแจ้งหนี้ (INVOICE)</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-semibold">เลขที่:</span> INV-{invoice.billingYear}{invoice.billingMonth.toString().padStart(2, '0')}-{room.name}</p>
              <p><span className="font-semibold">วันที่ออกบิล:</span> {invoice.billDate.toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between mb-8 p-4 border border-gray-300 rounded-lg bg-gray-50/50 gap-4">
          <div className="space-y-1 text-sm text-gray-800">
            <p><span className="font-semibold">ลูกค้า/ห้องพัก:</span> ห้อง {room.name} {room.tenantName ? `(${room.tenantName})` : ''}</p>
            <p><span className="font-semibold">ประเภท:</span> {room.isDaily ? 'รายวัน' : 'รายเดือน'}</p>
            {room.isDaily && invoice.checkIn && invoice.checkOut && (
              <p><span className="font-semibold">เข้าพัก:</span> {invoice.checkIn.toLocaleDateString('th-TH')} ถึง {invoice.checkOut.toLocaleDateString('th-TH')}</p>
            )}
          </div>
          <div className="sm:text-right space-y-1 text-sm text-gray-800">
            <p><span className="font-semibold">ประจำเดือน:</span> {invoice.billingMonth} / {invoice.billingYear}</p>
            <p><span className="font-semibold">สถานะ:</span> <span className={`font-bold ${invoice.isPaid ? 'text-green-600' : 'text-red-600'}`}>{invoice.isPaid ? 'ชำระแล้ว' : 'รอชำระเงิน'}</span></p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-left border-collapse min-w-[600px]">
            <thead className="bg-gray-100 text-gray-900 border-y-2 border-gray-400">
              <tr>
                <th className="py-3 px-4 font-semibold">รายการ (Description)</th>
                <th className="py-3 px-4 font-semibold text-center w-32">จำนวน/หน่วย</th>
                <th className="py-3 px-4 font-semibold text-center w-32">ราคา/หน่วย</th>
                <th className="py-3 px-4 font-semibold text-right w-40">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {/* Rent */}
              <tr>
                <td className="py-3 px-4">ค่าเช่าห้องพัก (Room Rent)</td>
                <td className="py-3 px-4 text-center">1</td>
                <td className="py-3 px-4 text-center">-</td>
                <td className="py-3 px-4 text-right">{invoice.rentTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>

              {/* Common Fee */}
              {!room.isDaily && invoice.commonFeeTotal.toNumber() > 0 && (
                <tr>
                  <td className="py-3 px-4">ค่าส่วนกลาง (Common Fee)</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-right">{invoice.commonFeeTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              )}

              {/* Electricity */}
              {!room.isDaily && (
                <>
                  {invoice.newElecMeter !== null && invoice.oldElecMeter !== null && invoice.newElecMeter.toNumber() > invoice.oldElecMeter.toNumber() && (
                    <tr>
                      <td className="py-3 px-4">
                        ค่าไฟฟ้า {room.elecMeterType === 'DOUBLE' ? 'มิเตอร์ A ' : ''} 
                        <span className="block text-xs text-gray-500 mt-0.5">
                          (จดครั้งก่อน: {invoice.oldElecMeter.toNumber()} / จดครั้งนี้: {invoice.newElecMeter.toNumber()})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{invoice.newElecMeter.toNumber() - invoice.oldElecMeter.toNumber()}</td>
                      <td className="py-3 px-4 text-center">{room.elecRate?.toNumber() || 0}</td>
                      <td className="py-3 px-4 text-right">
                        {((invoice.newElecMeter.toNumber() - invoice.oldElecMeter.toNumber()) * (room.elecRate?.toNumber() || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {room.elecMeterType === 'DOUBLE' && invoice.newElecMeterB !== null && invoice.oldElecMeterB !== null && invoice.newElecMeterB.toNumber() > invoice.oldElecMeterB.toNumber() && (
                    <tr>
                      <td className="py-3 px-4">
                        ค่าไฟฟ้า มิเตอร์ B 
                        <span className="block text-xs text-gray-500 mt-0.5">
                          (จดครั้งก่อน: {invoice.oldElecMeterB.toNumber()} / จดครั้งนี้: {invoice.newElecMeterB.toNumber()})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{invoice.newElecMeterB.toNumber() - invoice.oldElecMeterB.toNumber()}</td>
                      <td className="py-3 px-4 text-center">{room.elecRate?.toNumber() || 0}</td>
                      <td className="py-3 px-4 text-right">
                        {((invoice.newElecMeterB.toNumber() - invoice.oldElecMeterB.toNumber()) * (room.elecRate?.toNumber() || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </>
              )}

              {/* Water */}
              {!room.isDaily && invoice.waterTotal.toNumber() > 0 && (
                <tr>
                  <td className="py-3 px-4">
                    ค่าน้ำประปา
                    {room.waterMeterType === 'FLAT' && <span className="block text-xs text-gray-500 mt-0.5">(เหมาจ่าย)</span>}
                    {room.waterMeterType === 'PERSON_MIN' && <span className="block text-xs text-gray-500 mt-0.5">(ขั้นต่ำ {room.waterMinCharge?.toNumber() || 0} บ./คน x {room.occupantsCount} คน)</span>}
                    {(room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') && invoice.newWaterMeter !== null && invoice.oldWaterMeter !== null && (
                      <span className="block text-xs text-gray-500 mt-0.5">
                        (จดครั้งก่อน: {invoice.oldWaterMeter.toNumber()} / จดครั้งนี้: {invoice.newWaterMeter.toNumber()})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(room.waterMeterType === 'UNIT' || room.waterMeterType === 'PERSON_MIN') && invoice.newWaterMeter !== null && invoice.oldWaterMeter !== null 
                      ? invoice.newWaterMeter.toNumber() - invoice.oldWaterMeter.toNumber() 
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {room.waterMeterType === 'FLAT' ? '-' : (room.waterRate?.toNumber() || 0)}
                  </td>
                  <td className="py-3 px-4 text-right">{invoice.waterTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              )}

              {/* Custom Items */}
              {invoice.customItems && invoice.customItems.length > 0 && invoice.customItems.map((item: any, idx: number) => (
                <tr key={item.id || idx}>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4 text-center">1</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-right">{item.amount.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-gray-100 font-bold border-y-2 border-gray-400 text-gray-900">
                <td colSpan={3} className="py-4 px-4 text-right text-base">ยอดรวมสุทธิ (Grand Total)</td>
                <td className="py-4 px-4 text-right text-xl">
                  {invoice.grandTotal.toNumber().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-8 mb-8">
          <div className="flex-1 border border-gray-300 p-5 rounded-lg bg-gray-50/50">
            <h3 className="text-base font-semibold mb-3 text-gray-900">ข้อมูลชำระเงิน</h3>
            <div className="space-y-1.5 text-sm text-gray-800">
              <p><span className="font-medium inline-block w-20">ธนาคาร:</span> {apt.bankName || '-'}</p>
              <p><span className="font-medium inline-block w-20">ชื่อบัญชี:</span> {apt.bankAccountName || '-'}</p>
              <p><span className="font-medium inline-block w-20">เลขบัญชี:</span> {apt.bankAccountNumber || '-'}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="font-medium text-gray-900">กำหนดชำระภายในวันที่ {room.paymentDate || 5} ของเดือน</p>
              </div>
            </div>
          </div>
          
          {apt.qrCodeUrl && (
            <div className="text-center shrink-0">
              <div className="border-2 border-gray-200 p-2 rounded-lg bg-white inline-block">
                <img src={apt.qrCodeUrl} alt="QR Code" width={140} height={140} className="object-contain" />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">สแกน QR Code เพื่อชำระเงิน</p>
            </div>
          )}
        </div>

        {(apt.billNote || invoice.note) && (
          <div className="mt-8 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="font-semibold text-gray-900 mb-1">หมายเหตุ:</p>
            {apt.billNote && <p className="whitespace-pre-wrap">{apt.billNote}</p>}
            {invoice.note && <p className="whitespace-pre-wrap mt-1">{invoice.note}</p>}
          </div>
        )}
      </Card>
    </div>
  )
}
