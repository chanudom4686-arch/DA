import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // สร้าง "หอใหม่"
  const newApt = await prisma.apartment.create({
    data: {
      name: 'หอใหม่',
      ownerName: 'Admin',
      rooms: {
        create: [
          { name: '1', rent: 4000, elecRate: 7, waterFlatRate: 300, waterMeterType: 'FLAT' },
          { name: '2', rent: 4000, elecRate: 7, waterFlatRate: 300, waterMeterType: 'FLAT' },
          { name: '3', rent: 4000, elecRate: 7, waterFlatRate: 300, waterMeterType: 'FLAT' },
          { name: '4', rent: 4000, elecRate: 7, waterFlatRate: 300, waterMeterType: 'FLAT' },
          { name: '5', rent: 500, isDaily: true, elecRate: 7, waterFlatRate: 300, waterMeterType: 'FLAT' },
        ],
      },
    },
  })
  console.log(`Created apartment: ${newApt.name}`)

  // สร้าง "FUN APARTMENT"
  const funApt = await prisma.apartment.create({
    data: {
      name: 'FUN APARTMENT',
      ownerName: 'นางสาววิชุดา อัครพงกุล ดุลยภา',
      ownerPhone: '062-198-3318',
      address: 'เลขที่ 500 หมู่ที่ 7 ตำบลแดงใหญ่ อำเภอเมืองขอนแก่น จังหวัดขอนแก่น',
      bankName: 'กสิกรไทย',
      bankAccountName: 'MR.DEEPAK KUMAR TARAKNATH PANDEY',
      bankAccountNumber: '172-8-44008-9',
      billNote: 'ค่าน้ำ 40.00 บาท/หน่วย (ขั้นต่ำ: 100.00 บาท/เดือน/คน)\nNOTE :Water 40.00 THB/unit (minimum fee: 100.00 THB/month/person)',
      rooms: {
        create: [
          { name: '405', rent: 4500, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN', elecMeterType: 'DOUBLE', occupantsCount: 2 },
          { name: '406', rent: 4500, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: '407', rent: 4500, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: '408', rent: 4500, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: '409', rent: 4500, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: '410', rent: 4500, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN', elecMeterType: 'DOUBLE', occupantsCount: 2 },
          { name: 'Business areas (A)', rent: 6000, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: 'Business areas (B)', rent: 6000, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: 'Business areas (C)', rent: 6000, elecRate: 5.5, waterRate: 40, waterMinCharge: 100, waterMeterType: 'PERSON_MIN' },
          { name: '399 (A)', rent: 5000, elecRate: 5.5, waterFlatRate: 200, waterMeterType: 'FLAT' },
          { name: '399 (B)', rent: 5000, elecRate: 5.5, waterFlatRate: 200, waterMeterType: 'FLAT' },
        ],
      },
    },
  })
  console.log(`Created apartment: ${funApt.name}`)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
