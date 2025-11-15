const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Admin',
        password: hashedPassword,
      }
    });

    console.log('✓ Usuario creado:', user.email);

    // Asociar usuario con la organización temporal
    await prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId: 'temp-org-id',
        role: 'OWNER',
      }
    });

    console.log('✓ Usuario asociado a la organización');
    console.log('\nPuedes iniciar sesión con:');
    console.log('  Email: admin@test.com');
    console.log('  Password: admin123');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✓ El usuario ya existe');
    } else {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
