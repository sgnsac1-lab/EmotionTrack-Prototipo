import { prisma } from '@/app/lib/prisma';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportePagina() {
  
  // 1. Buscamos el reporte del ÚLTIMO evento que haya sido FINALIZADO
  const reporte = await prisma.reporte.findFirst({
    where: {
      evento: {
        estado: 'FINALIZADO'
      }
    },
    orderBy: {
      id: 'desc'
    },
    include: {
      evento: true 
    }
  });


  // 2. Si no hay ningún reporte todavía, mostramos un aviso
  if (!reporte) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-white text-2xl font-black uppercase">Sin Reportes Disponibles</h2>
        <p className="text-slate-500 mt-2">Finaliza tu primera transmisión en vivo para generar datos.</p>
      </div>
    );
  }

  // 3. Traemos las métricas de ese evento específico para el gráfico
  const metricasHistoricas = await prisma.metrica.findMany({
    where: { eventoId: reporte.eventoId },
    orderBy: { timestamp: 'asc' },
    take: 12
  });

  const chartData = metricasHistoricas.map(m => m.atencion);

  return (
    <div className="animate-in fade-in duration-500 pb-10 print-container">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-1 tracking-tight uppercase">
            {reporte.evento.nombre}
          </h1>
          <p className="text-[#4ade80] text-sm md:text-lg font-black uppercase tracking-widest">
            Reporte de Impacto Emocional
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Ubicación</p>
          <p className="text-white font-bold text-sm">{reporte.evento.ubicacion}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* GRÁFICO DE EVOLUCIÓN DINÁMICO */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl">
          <h3 className="text-white font-bold uppercase tracking-wider text-xs md:text-sm mb-8">Evolución de Atención (Línea de Tiempo)</h3>
          <div className="h-48 md:h-64 flex items-end gap-1 md:gap-2 px-1">
            {chartData.map((val, i) => (
              <div 
                key={i} 
                className="flex-1 bg-[#4ade80] rounded-t-sm md:rounded-t-lg transition-all hover:brightness-125 cursor-pointer relative group" 
                style={{ height: `${val}%` }}
              >
                {/* Tooltip simple al pasar el mouse */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {val.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[8px] uppercase font-bold text-slate-500 px-1 tracking-[0.2em]">
              <span>Inicio de Sesión</span>
              <span>Tendencia Central</span>
              <span>Cierre</span>
          </div>
        </div>

        {/* MÉTRICAS DE ENGAGEMENT (Del modelo Reporte) */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl">
          <h3 className="text-white font-bold uppercase tracking-wider text-xs md:text-sm mb-8">Métricas de Engagement Promedio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 md:p-6 bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 text-center transition-all hover:border-[#4ade80]/30">
              <span className="text-[10px] text-slate-500 block mb-1 font-bold tracking-widest">INTERÉS IA</span>
              <span className="text-2xl md:text-3xl font-black text-[#4ade80]">{reporte.interesPromedio.toFixed(1)}%</span>
            </div>
            <div className="p-4 md:p-6 bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 text-center transition-all hover:border-blue-400/30">
              <span className="text-[10px] text-slate-500 block mb-1 font-bold tracking-widest">ATENCIÓN IA</span>
              <span className="text-2xl md:text-3xl font-black text-blue-400">{reporte.atencionPromedio.toFixed(1)}%</span>
            </div>
            <div className="p-4 md:p-6 bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 text-center transition-all hover:border-purple-400/30">
              <span className="text-[10px] text-slate-500 block mb-1 font-bold tracking-widest">SATISFACCIÓN</span>
              <span className="text-2xl md:text-3xl font-black text-purple-400">{reporte.satisfaccion.toFixed(1)}%</span>
            </div>
            <div className="p-4 md:p-6 bg-black/40 rounded-2xl md:rounded-3xl border border-white/5 text-center transition-all hover:border-orange-400/30">
              <span className="text-[10px] text-slate-500 block mb-1 font-bold tracking-widest">RETENCIÓN</span>
              <span className="text-2xl md:text-3xl font-black text-orange-400">{reporte.retencion.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONCLUSIONES DINÁMICAS */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-[1.5rem] md:rounded-[2rem] p-8 shadow-2xl">
          <h3 className="text-[#4ade80] font-black uppercase tracking-[0.4em] text-[10px] mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div> CONCLUSIONES ESTRATÉGICAS IA
          </h3>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 italic">
            "{reporte.conclusionesIA}"
          </p>
          <div className="border-t border-[#333] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <span>Generado por:</span>
                <span className="text-white">FST Negocios Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Fecha de Emisión:</span>
                <span className="text-white">{reporte.evento.fecha.toLocaleDateString('es-PE')}</span>
              </div>
          </div>
      </div>
    </div>
  );
}