"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/config/prisma");
async function main() {
    const eventId = parseInt(process.argv[2] || '0', 10);
    const organizerId = parseInt(process.argv[3] || '0', 10);
    if (!eventId || !organizerId) {
        console.error('Usage: ts-node scripts/reassign-event.ts <eventId> <organizerId>');
        process.exit(1);
    }
    const existing = await prisma_1.prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
        console.error(`Event ${eventId} not found`);
        process.exit(1);
    }
    const updated = await prisma_1.prisma.event.update({ where: { id: eventId }, data: { organizerId } });
    console.log(JSON.stringify({ ok: true, eventId: updated.id, organizerId: updated.organizerId }));
}
main().finally(() => prisma_1.prisma.$disconnect());
//# sourceMappingURL=reassign-event.js.map