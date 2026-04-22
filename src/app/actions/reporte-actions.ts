'use server'

import { prisma } from '@/app/lib/prisma'

export async function finalizarYGenerarReporte(eventoId: string) {
  try {
    // 1. Obtenemos el promedio de todas las métricas de este evento
    const stats = await prisma.metrica.aggregate({
      where: { eventoId: eventoId },
      _avg: {
        atencion: true,
        interes: true,
        aburrimiento: true,
        desconexion: true,
      },
      _count: {
        id: true // Para saber cuántas muestras tomamos
      }
    });

    // 2. LÓGICA PRO: Comparar el Inicio vs el Final
    // Obtenemos las primeras 3 métricas (el "hook" inicial)
    const metricasInicio = await prisma.metrica.findMany({
      where: { eventoId },
      orderBy: { timestamp: 'asc' },
      take: 3,
      select: { interes: true }
    });

    // Obtenemos las últimas 3 métricas (el "cierre")
    const metricasFin = await prisma.metrica.findMany({
      where: { eventoId },
      orderBy: { timestamp: 'desc' },
      take: 3,
      select: { interes: true }
    });

    // Calculamos promedios de esos extremos
    const avgInteresInicio = metricasInicio.reduce((acc, m) => acc + m.interes, 0) / (metricasInicio.length || 1);
    const avgInteresFin = metricasFin.reduce((acc, m) => acc + m.interes, 0) / (metricasFin.length || 1);

    // 3. CÁLCULO DE RETENCIÓN "PRO"
    // Si el interés final es mayor o igual al inicial, la retención es alta.
    // Si cayó drásticamente, la retención baja.
    const ratioSostenibilidad = avgInteresFin / (avgInteresInicio || 1);
    
    // Penalizamos por la desconexión promedio acumulada
    const penalidadDesconexion = stats._avg.desconexion || 0;
    
    let retencionFinal = (ratioSostenibilidad * 100) - (penalidadDesconexion * 0.5);
    
    // Ajustamos límites (0 - 100)
    retencionFinal = Math.max(0, Math.min(100, retencionFinal));

    // 4. CONCLUSIONES DINÁMICAS (Basadas en datos reales)
    let conclusion = "";
    if (retencionFinal > 80) {
      conclusion = "Éxito total: La audiencia se mantuvo conectada de principio a fin.";
    } else if (retencionFinal > 50) {
      conclusion = "Impacto moderado: Se observó una caída de interés hacia el final de la sesión.";
    } else {
      conclusion = "Alerta crítica: Gran parte de la audiencia se desconectó antes de finalizar.";
    }

    // 5. Guardar el Reporte
    const reporte = await prisma.reporte.create({
      data: {
        eventoId: eventoId,
        interesPromedio: stats._avg.interes || 0,
        atencionPromedio: stats._avg.atencion || 0,
        satisfaccion: ((stats._avg.interes || 0) * 0.7) + ((stats._avg.atencion || 0) * 0.3),
        retencion: retencionFinal,
        conclusionesIA: conclusion
      }
    });

    // 6. Finalizar evento
    await prisma.evento.update({
      where: { id: eventoId },
      data: { estado: 'FINALIZADO' }
    });

    return { success: true, data: reporte };
  } catch (error) {
    console.error("Error al generar reporte:", error);
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