import { prisma } from '@/app/lib/prisma';

export async function actualizarEstadosEventos(usuarioId: string) {
  const hoy = new Date();
  
  // Definimos el inicio y fin de "hoy" en la zona horaria local
  const inicioHoy = new Date(hoy.setHours(0, 0, 0, 0));
  const finHoy = new Date(hoy.setHours(23, 59, 59, 999));

  // Actualizamos todos los que cumplan la condición de golpe
  await prisma.evento.updateMany({
    where: {
      usuarioId: usuarioId,
      estado: "PROGRAMADO",
      fecha: {
        gte: inicioHoy,
        lte: finHoy
      }
    },
    data: {
      estado: "VIVO"
    }
  });
}