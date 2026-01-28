import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Compte de test par défaut - À SUPPRIMER EN PRODUCTION
  const defaultPassword = await bcrypt.hash('TeslaVault2026!', 10);

  const testUser = await prisma.user.upsert({
    where: { email: 'admin@teslavault.local' },
    update: {},
    create: {
      email: 'admin@teslavault.local',
      passwordHash: defaultPassword,
      name: 'Admin Test',
      role: Role.ADMIN,
      preferences: {
        create: {
          distanceUnit: 'km',
          temperatureUnit: 'celsius',
          currencyCode: 'CAD',
          homeElectricityRate: 0.10,
          gasPrice: 1.50,
          equivalentCarMpg: 8.0,
          co2FactorGasoline: 2.31,
          co2FactorElectricity: 0.5,
          notifyChargeComplete: true,
          notifyLowBattery: true,
          lowBatteryThreshold: 20,
          notifyTirePressure: true,
        },
      },
    },
  });

  console.log('Created test user:', testUser.email);
  console.log('');
  console.log('========================================');
  console.log('  DEFAULT TEST ACCOUNT');
  console.log('  Email: admin@teslavault.local');
  console.log('  Password: TeslaVault2026!');
  console.log('');
  console.log('  ⚠️  DELETE THIS ACCOUNT IN PRODUCTION');
  console.log('========================================');
  console.log('');

  // Compte utilisateur standard pour tests
  const userPassword = await bcrypt.hash('User2026!', 10);

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@teslavault.local' },
    update: {},
    create: {
      email: 'user@teslavault.local',
      passwordHash: userPassword,
      name: 'Test User',
      role: Role.USER,
      preferences: {
        create: {
          distanceUnit: 'km',
          temperatureUnit: 'celsius',
          currencyCode: 'EUR',
          homeElectricityRate: 0.15,
          gasPrice: 1.80,
          equivalentCarMpg: 7.5,
        },
      },
    },
  });

  console.log('Created regular user:', regularUser.email);
  console.log('Password: User2026!');
  console.log('');

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
