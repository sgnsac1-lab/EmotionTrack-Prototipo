'use server';

import { prisma } from '@/app/lib/prisma';
import {getSessionUser} from '@/app/lib/user'
import { revalidatePath } from 'next/cache';

export async function crearEventoAction(data: any) {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "No autorizado" };

  try {
    const nuevoEvento = await prisma.evento.create({
      data: {
        nombre: data.nombre,
        fecha: new Date(data.fecha),
        ubicacion: data.ubicacion,
        asistentesTotal: Number(data.asistentesTotal) || 0,
        usuarioId: user.id,
        // Aquí es donde vinculamos las salas automáticamente
        salas: {
          create: data.salas.map((s: any) => ({
            nombre: s.name,
            // Podrías añadir más campos aquí si tu modelo Sala los tiene
          }))
        }
      }
    });

    revalidatePath('/eventos');
    return { success: true, id: nuevoEvento.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error en la creación" };
  }
}

export async function listarEventoAction(usuarioId: string) {
    try {
        const response = await prisma.evento.findMany({
            where: {usuarioId: usuarioId}
        })

        return response
    } catch (error) {
        console.error("Error al listar eventos:", error);
    }
}

export async function obtenerEvento(eventoId: string) {
    try {
        const response = await prisma.evento.findUnique({
          where: {id: eventoId}
        })

        return response
    } catch (error) {
        console.error("Error al obtener eventos:", error);
    }
}

export async function getSalasByEvento(eventoId: string) {
  return await prisma.sala.findMany({
    where: { eventoId: eventoId }
  });
}

export async function registrarMetricaAction(eventoId: string, salaId: string, data: any) {
  try {
    // 1. Actualizamos el engagement "EN VIVO" de la sala para el dashboard global
    await prisma.sala.update({
      where: { id: salaId },
      data: { engagement: data.engagement }
    });

    // 2. Creamos el registro histórico en Metrica
    const nuevaMetrica = await prisma.metrica.create({
      data: {
        eventoId: eventoId,
        atencion: data.atencion,
        interes: data.interes,
        aburrimiento: data.aburrimiento,
        desconexion: data.desconexion,
        timestamp: new Date() // Esto registra hora, min y seg exactos
      }
    });

    return { success: true, id: nuevaMetrica.id };
  } catch (error) {
    console.error("Error al guardar métrica:", error);
    return { success: false };
  }
}