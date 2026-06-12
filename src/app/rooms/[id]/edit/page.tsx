import RoomForm from '@/components/RoomForm'
import { getRoom } from '@/actions/room'
import { notFound } from 'next/navigation'

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)

  if (!room) notFound()

  return (
    <div>
      <div className="header">
        <div>
          <h1 className="title">แก้ไขห้อง {room.name}</h1>
          <p className="subtitle">ปรับปรุงข้อมูลและเงื่อนไขการคิดเงิน</p>
        </div>
      </div>
      <RoomForm apartmentId={room.apartmentId} initialData={room} />
    </div>
  )
}
