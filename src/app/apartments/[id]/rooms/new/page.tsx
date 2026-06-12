import RoomForm from '@/components/RoomForm'

export default async function NewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">เพิ่มห้องพักใหม่</h1>
          <p className="subtitle">ตั้งค่าห้องพักและเงื่อนไขการคิดเงินต่างๆ</p>
        </div>
      </div>
      <RoomForm apartmentId={id} />
    </div>
  )
}
