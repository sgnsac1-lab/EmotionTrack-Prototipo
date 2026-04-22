import { prisma } from '@/app/lib/prisma'

export default async function dashboard(){
  const eventosActivos = await prisma.evento.findMany({
    where: { 
      // Ajusta 'ACTIVO' según el string que uses en tu base
      estado: 'VIVO' 
    },
    include: { salas: true }
  });

  // 2. Cálculos para los KPIs
  const asistentesHoy = eventosActivos.reduce((acc, curr) => acc + (curr.asistentesTotal || 0), 0);
  
  const todasLasSalasActivas = eventosActivos.flatMap(e => 
    e.salas.map(s => ({ ...s, nombreEvento: e.nombre }))
  );

  // 3. Traer promedio de atención de las métricas de hoy (última hora)
  const metricasRecientes = await prisma.metrica.aggregate({
    where: {
      timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Última hora
    },
    _avg: { atencion: true }
  });

  const atencionPromedio = Math.round(metricasRecientes._avg.atencion || 0);

    return(
        <div className="animate-in fade-in duration-500 pb-10">
            <header className="mb-8">
              <h1 className="text-white text-3xl md:text-4xl font-bold mb-2 tracking-tight uppercase">Dashboard</h1>
              <p className="text-slate-400 text-sm md:text-lg">Estado global de tus eventos en tiempo real</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              {[
                { label: 'Asistentes Hoy', value: asistentesHoy.toLocaleString(), trend: '+0%', color: 'text-[#4ade80]' },
                { label: 'Atención Promedio', value: `${atencionPromedio}%`, trend: 'Vivo', color: 'text-blue-400' },
                { label: 'Salas Activas', value: todasLasSalasActivas.length.toString().padStart(2, '0'), trend: 'Estable', color: 'text-orange-400' },
                { label: 'Alertas IA', value: '00', trend: 'Ok', color: 'text-red-500' }
              ].map((kpi, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-[#333] p-5 md:p-6 rounded-3xl md:rounded-4xl hover:border-[#4ade80]/30 transition-all">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">{kpi.label}</p>
                  <h4 className={`text-2xl md:text-3xl font-black ${kpi.color}`}>{kpi.value}</h4>
                  <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 font-medium">{kpi.trend}</p>
                </div>
              ))}
          </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
             <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#333] rounded-3xl md:rounded-4xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-white font-bold uppercase tracking-wider text-xs md:text-sm">Engagement por Sala (Vivo)</h3>
                <span className="flex items-center gap-2 text-[#4ade80] text-[10px] font-bold animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div> LIVE
                </span>
              </div>
              
              <div className="space-y-6">
                {todasLasSalasActivas.length > 0 ? (
                  todasLasSalasActivas.map((sala) => (
                    <div key={sala.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-white font-bold text-sm uppercase">{sala.nombre}</p>
                          <p className="text-slate-500 text-[10px] uppercase tracking-tighter">{sala.nombreEvento}</p>
                        </div>
                        <span className="text-[#4ade80] font-black text-sm">{sala.engagement}%</span>
                      </div>
                      <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#4ade80] h-full transition-all duration-1000" 
                          style={{ width: `${sala.engagement}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-600 text-xs font-bold uppercase">
                    No hay salas transmitiendo en este momento
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
    )
}