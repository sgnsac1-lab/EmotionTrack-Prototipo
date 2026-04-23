'use server'

import { prisma } from '@/app/lib/prisma'
import { revalidatePath } from 'next/cache';

export async function finalizarYGenerarReporte(eventoId: string) {
  try {
    // 1. Obtenemos el promedio global de las métricas (que ya incluyen el Foco Visual)
    const stats = await prisma.metrica.aggregate({
      where: { eventoId: eventoId },
      _avg: {
        atencion: true,    // Ahora refleja Foco Visual + Neutralidad
        interes: true,     // Ahora refleja Felicidad + Sorpresa
        aburrimiento: true,
        desconexion: true, // Refleja el tiempo que no miraron a la cámara
      },
      _count: { id: true }
    });

    // 2. Análisis de Curva: Inicio vs Final
    const metricasInicio = await prisma.metrica.findMany({
      where: { eventoId },
      orderBy: { timestamp: 'asc' },
      take: 5, // Aumentamos a 5 para una muestra más estable
      select: { interes: true, atencion: true }
    });

    const metricasFin = await prisma.metrica.findMany({
      where: { eventoId },
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: { interes: true, atencion: true }
    });

    const avgInteresInicio = metricasInicio.reduce((acc, m) => acc + m.interes, 0) / (metricasInicio.length || 1);
    const avgInteresFin = metricasFin.reduce((acc, m) => acc + m.interes, 0) / (metricasFin.length || 1);
    
    const avgAtencionFin = metricasFin.reduce((acc, m) => acc + m.atencion, 0) / (metricasFin.length || 1);

    // 3. LÓGICA DE RETENCIÓN "EYE-TRACKING"
    // Calculamos qué tanto se mantuvo el interés, pero lo penalizamos fuertemente 
    // si al final del evento la atención visual (foco) se desplomó.
    const ratioSostenibilidad = avgInteresFin / (avgInteresInicio || 1);
    const penalidadDesconexion = stats._avg.desconexion || 0;
    
    // Fórmula de Retención: Sostenibilidad del interés + Peso de atención final
    let retencionFinal = (ratioSostenibilidad * 70) + (avgAtencionFin * 0.3) - (penalidadDesconexion * 0.2);
    retencionFinal = Math.max(0, Math.min(100, retencionFinal));

    // 4. SATISFACCIÓN MULTIMODAL
    // La satisfacción ya no es solo felicidad. Es Interés Real + Atención Visual.
    const satisfaccionFinal = ((stats._avg.interes || 0) * 0.6) + ((stats._avg.atencion || 0) * 0.4);

    // 5. CONCLUSIONES DINÁMICAS PRO (FST Intelligence)
    let conclusion = "";
    const avgDesconexion = stats._avg.desconexion || 0;

    if (retencionFinal > 85 && avgDesconexion < 15) {
      conclusion = "Dominio Total: La audiencia mantuvo un foco visual constante y un alto interés emocional. El contenido fue altamente impactante.";
    } else if (avgDesconexion > 40) {
      conclusion = "Fuga de Atención: Se detectó un alto porcentaje de distracción visual (miradas fuera de foco). El público perdió el interés a pesar de los picos de alegría.";
    } else if (retencionFinal < 50) {
      conclusion = "Desconexión Progresiva: El evento inició con fuerza pero la retención cayó drásticamente. Se recomienda dinámicas de interacción a mitad de sesión.";
    } else {
      conclusion = "Impacto Estable: El evento cumplió los objetivos de atención base, manteniendo una audiencia moderadamente conectada.";
    }

    // 6. Guardar el Reporte con las nuevas métricas ponderadas
    const reporte = await prisma.reporte.create({
      data: {
        eventoId: eventoId,
        interesPromedio: stats._avg.interes || 0,
        atencionPromedio: stats._avg.atencion || 0,
        satisfaccion: satisfaccionFinal,
        retencion: retencionFinal,
        conclusionesIA: conclusion
      }
    });

    // 7. Finalizar evento
    await prisma.evento.update({
      where: { id: eventoId },
      data: { estado: 'FINALIZADO' }
    });

    revalidatePath('/reporte');
    return { success: true, data: reporte };
  } catch (error) {
    console.error("Error al generar reporte de impacto:", error);
    return { success: false };
  }
}

export async function getReporteData(eventoId: string) {
  return await prisma.reporte.findUnique({
    where: { eventoId: eventoId },
    include: {
      evento: true // Para tener el nombre, fecha, etc.
    }
  });
}