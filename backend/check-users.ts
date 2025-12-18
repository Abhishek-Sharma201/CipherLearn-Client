import { prisma } from './src/config/db.config';

async function main() {
    const count = await prisma.user.count();
    console.log(`User count: ${count}`);
    if (count > 0) {
        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log('Users:', users);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
