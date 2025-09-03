import { prisma } from '../src/config/prisma';

async function main() {
  const eventId = parseInt(process.argv[2] || '0', 10);
  const organizerId = parseInt(process.argv[3] || '0', 10);
  if (!eventId || !organizerId) {
    console.error('Usage: ts-node scripts/reassign-event.ts <eventId> <organizerId>');
    process.exit(1);
  }
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) {
    console.error(`Event ${eventId} not found`);
    process.exit(1);
  }
  const updated = await prisma.event.update({ where: { id: eventId }, data: { organizerId } });
  console.log(JSON.stringify({ ok: true, eventId: updated.id, organizerId: updated.organizerId }));
}

main().finally(() => prisma.$disconnect());


