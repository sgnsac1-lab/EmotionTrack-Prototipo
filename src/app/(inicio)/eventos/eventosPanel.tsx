'use client'
import {useState, useEffect} from 'react'
import Modal from '../../components/eventoForm'
import { FormField } from '@/app/types'
import {usuario, Evento} from '@/app/types'
import {crearEventoAction, listarEventoAction} from '@/app/actions/evento-action'
import { toast } from 'sonner'
import Link from 'next/link'

interface Props {
  user: usuario ; // O el tipo de tu usuario de Prisma
}

export default function eventosPanel({user}: Props){
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [eventos, setEventos] = useState<Evento[]>([])
    const camposEvento: FormField[] = [
      { name: 'nombre', label: 'Nombre del Evento', type: 'text', required: true, placeholder: 'Ej: Expo Tec 2026' },
      { name: 'fecha', label: 'Fecha de Realización', type: 'date', required: true },
      { name: 'ubicacion', label: 'Ubicacion del evento', type: 'text', required: true },
      { name: 'asistentesTotal', label: 'Asistentes Confirmados', type: 'number', required: true }
    ]
    const handleCrearEvento = async (formData: any) => {
        setIsSaving(true)
        // Llamamos a la acción del servidor pasando los datos y el ID del usuario
        const result = await crearEventoAction(formData)
        if (result.success) {
            await TraerEventos()
            setIsModalOpen(false)
            toast.success('Evento Creado exitosamente')
        } else {
            alert(result.error)
        }
        setIsSaving(false)
    }

    const TraerEventos = async() => {
      const data = await listarEventoAction(user.id)
      setEventos(data!)
    }

    useEffect(()=>{
      TraerEventos()
    },[])

    return(
        <div className="animate-in fade-in duration-500 pb-10 relative">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-white text-3xl md:text-5xl font-black mb-2 tracking-tighter uppercase flex items-center gap-3">
                  BIENVENIDO {user?.nombre.split(' ')[0].toUpperCase()} !! <span className="animate-bounce">👋</span>
                </h1>
                <p className="text-slate-400 text-sm md:text-lg font-medium">Gestión de cronogramas y vivos</p>
              </div>
              <button onClick={()=> setIsModalOpen(true)} className="w-full md:w-auto bg-[#4ade80] hover:bg-[#3ec974] text-black font-bold py-4 px-8 rounded-xl md:rounded-2xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2 active:scale-95 group">
                <span className="text-2xl group-hover:rotate-90 transition-transform">+</span> 
                <span className="uppercase tracking-widest text-xs font-black">Nuevo evento</span>
              </button>
            </header>
            <section className="mb-12">
              <h3 className="text-[#4ade80] font-bold mb-6 text-xs md:text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></div>
                Eventos Activos
              </h3>
              <div className="space-y-4">
                
                  {eventos.filter((evento)=> evento.estado == 'VIVO').length > 0 ? eventos.filter((evento) => evento.estado == 'VIVO').map(evento => (
                    <Link key={evento!.id as string} href={`/eventos/analisisEnVivo/${evento.id}`}>
                      <div className="bg-[#1a1a1a] border border-[#333] hover:border-[#4ade80]/50 cursor-pointer rounded-4xl p-6 md:p-10 transition-all group relative overflow-hidden shadow-xl">
                      <h4 className="text-white text-2xl md:text-4xl font-black italic mb-2 tracking-tighter uppercase relative z-10">{evento.nombre}</h4>
                      <p className="text-slate-400 mb-6 text-sm md:text-xl relative z-10 font-medium">{evento.ubicacion} | {evento.asistentesTotal} <span className="text-slate-200"> Asistentes</span></p>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                        <span className="text-red-500 font-black uppercase tracking-[0.25em] text-[10px] md:text-xs">AHORA EN VIVO</span>
                      </div>
                    </div>
                    </Link>
                  )) 
                  :
                  <p>No Hay eventos Activos en este momento</p>
                  }
               
              </div>
            </section>
            <section>
              <h3 className="text-slate-600 font-bold mb-6 text-xs md:text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                Próximos Programados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventos?.filter(event => event.estado == 'PROGRAMADO').map(event=>(
                  <div className="bg-[#1a1a1a] border border-[#333] rounded-4xl p-8 md:p-10 hover:border-[#4ade80]/20 transition-all relative group shadow-lg" key={event.id.toString()}>
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white/50 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/5 active:scale-90">✕</button>
                    <h4 className="text-white text-xl md:text-2xl font-black mb-2 uppercase tracking-tight pr-10 line-clamp-2">{event.nombre}</h4>
                    <p className="text-[#4ade80] text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">{event.fecha.toString()}</p>
                    <p className="text-slate-500 text-[10px] md:text-xs italic font-medium">{event.ubicacion}</p>
                  </div>
                ))}
                
              </div>
            </section>

            <section>
              <h3 className="text-slate-600 font-bold mb-6 text-xs md:text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                Eventos Finalizados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventos?.filter(event => event.estado == 'FINALIZADO').map(event=>(
                  <div className="bg-[#1a1a1a] border border-[#333] rounded-4xl p-8 md:p-10 hover:border-[#4ade80]/20 transition-all relative group shadow-lg" key={event.id.toString()}>
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white/50 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/5 active:scale-90">✕</button>
                    <h4 className="text-white text-xl md:text-2xl font-black mb-2 uppercase tracking-tight pr-10 line-clamp-2">{event.nombre}</h4>
                    <p className="text-[#8d2942a3] text-[10px] md:text-xs font-black uppercase tracking-[0.15em]">{event.fecha.toString()}</p>
                    <p className="text-slate-500 text-[10px] md:text-xs italic font-medium">{event.ubicacion}</p>
                  </div>
                ))}
                
              </div>
            </section>
            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title='Crear Evento' fields={camposEvento} onSubmit={handleCrearEvento} />
        </div>
    )
}