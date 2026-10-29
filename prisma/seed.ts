import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({ where: { email: 'admin@stock.local' }, update: {}, create: { name: 'Administrador', email: 'admin@stock.local', passwordHash, role: Role.ADMIN } });
  const managerHash = await bcrypt.hash('Gerente123!', 12);
  await prisma.user.upsert({ where: { email: 'gerente@stock.local' }, update: {}, create: { name: 'Gerente de Estoque', email: 'gerente@stock.local', passwordHash: managerHash, role: Role.GERENTE } });
  await prisma.user.upsert({ where: { email: 'atendente@stock.local' }, update: {}, create: { name: 'Atendente', email: 'atendente@stock.local', passwordHash: await bcrypt.hash('Atendente123!', 12), role: Role.ATENDENTE } });
  await prisma.unit.upsert({ where: { code: 'LOJA-CENTRO' }, update: {}, create: { code: 'LOJA-CENTRO', name: 'Loja Centro' } });
  await prisma.product.upsert({ where: { sku: 'CAF-500' }, update: {}, create: { sku: 'CAF-500', name: 'Café 500 g', description: 'Produto de exemplo para testar o estoque' } });
  console.log('Seed concluído. Usuários de demonstração criados.');
}
main().finally(() => prisma.$disconnect());
