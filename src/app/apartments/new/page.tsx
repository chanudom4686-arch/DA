import ApartmentForm from '@/components/ApartmentForm'

export default function NewApartmentPage() {
  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">เพิ่มหอพักใหม่</h1>
          <p className="subtitle">กรอกข้อมูลรายละเอียดของหอพัก</p>
        </div>
      </div>
      <ApartmentForm />
    </div>
  )
}
