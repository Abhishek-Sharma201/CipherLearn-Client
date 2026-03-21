import { prisma } from "./src/config/db.config"

async function main() {
  console.log("Broadcasting to all users...")
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
  
  for (const u of users) {
    if (u.id === 1 || u.id === 4) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          title: "Dashboard Overhaul Complete!",
          message: "The new notification system and permissions are now fully active.",
          type: "INFO",
        }
      })
      console.log(`Created for user ${u.id}`)
    }
  }
  console.log("Done!")
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
