const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.organization.create({
      data: {
        id: 'temp-org-id',
        name: 'Organización Temporal',
        slug: 'temp-org'
      }
    });
    console.log('✓ Organización creada exitosamente');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✓ La organización ya existe');
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
