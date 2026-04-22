'use client';

import { useState, useRef, useEffect } from 'react';
import { FormField } from '@/app/types';

interface DynamicFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[]; // Campos del Paso 1 (Evento)
  onSubmit: (data: any) => void;
}

export default function DynamicForm({ isOpen, onClose, title, fields, onSubmit }: DynamicFormProps) {
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState<Record<string, any>>({});
  const [spaces, setSpaces] = useState<{ id: string, name: string, detail: string }[]>([]);
  
  // Referencia para limpiar el form interno de salas
  const spaceNameRef = useRef<HTMLInputElement>(null);
  const spaceDetailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  if (!isOpen) {
    // Cuando el modal se cierra, reseteamos todo al estado inicial
    setStep(1);
    setEventData({});
    setSpaces([]);
    
    // Si usas refs para los inputs de las salas, también los limpiamos
    if (spaceNameRef.current) spaceNameRef.current.value = '';
    if (spaceDetailRef.current) spaceDetailRef.current.value = '';
  }
}, [isOpen]);

if (!isOpen) return null;

  // Manejador del Paso 1 (Información del Evento)
  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = Object.fromEntries(formData.entries());
    
    fields.forEach(field => {
      if (field.type === 'checkbox') data[field.name] = formData.get(field.name) === 'on';
    });

    setEventData(data);
    setStep(2); // Saltamos a la gestión de salas
  };

  // Manejador para añadir salas a la lista temporal (Paso 2)
  const addSpace = () => {
    const name = spaceNameRef.current?.value;
    const detail = spaceDetailRef.current?.value;

    if (name) {
      setSpaces([...spaces, { 
        id: Math.random().toString(36).substr(2, 9), 
        name, 
        detail: detail || '' 
      }]);
      // Limpiamos los inputs manuales
      if (spaceNameRef.current) spaceNameRef.current.value = '';
      if (spaceDetailRef.current) spaceDetailRef.current.value = '';
    }
  };

  // Envío final al Padre
  const handleFinalSubmit = () => {
    const finalPayload = {
      ...eventData,
      salas: spaces
    };
    onSubmit(finalPayload);
    // Resetear estados al cerrar
    setStep(1);
    setSpaces([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[#4ade80] font-black text-xl uppercase tracking-tighter">{title}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              Paso {step} de 2 — {step === 1 ? 'Información' : 'Espacios'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* CONTENIDO SEGÚN EL PASO */}
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  <label className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    defaultValue={eventData[field.name]}
                    required={field.required}
                    className="w-full bg-black/50 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:border-[#4ade80] outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold uppercase text-[10px]">Cancelar</button>
              <button type="submit" className="flex-1 px-6 py-4 rounded-2xl bg-[#4ade80] text-black font-black uppercase text-[10px]">Continuar a Salas</button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Formulario rápido para añadir salas */}
            <div className="bg-black/30 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-white text-xs font-black uppercase tracking-widest">Añadir Nueva Sala</h3>
              <div className="grid grid-cols-2 gap-3">
                <input ref={spaceNameRef} type="text" placeholder="Nombre (Ej: Sala A)" className="bg-black/50 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none" />
                <input ref={spaceDetailRef} type="text" placeholder="Detalle (Opcional)" className="bg-black/50 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none" />
              </div>
              <button onClick={addSpace} type="button" className="w-full py-3 rounded-xl border border-[#4ade80]/30 text-[#4ade80] text-[10px] font-black uppercase hover:bg-[#4ade80]/10 transition-all">
                + Vincular Sala al Evento
              </button>
            </div>

            {/* Lista de salas agregadas */}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {spaces.map(s => (
                <div key={s.id} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                  <div>
                    <p className="text-white text-xs font-bold uppercase">{s.name}</p>
                    <p className="text-slate-500 text-[10px]">{s.detail}</p>
                  </div>
                  <button onClick={() => setSpaces(spaces.filter(x => x.id !== s.id))} className="text-red-500 text-xs">✕</button>
                </div>
              ))}
              {spaces.length === 0 && <p className="text-center text-slate-600 text-[10px] uppercase font-bold py-4">No hay salas vinculadas todavía</p>}
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 px-6 py-4 rounded-2xl border border-slate-800 text-slate-400 font-bold uppercase text-[10px]">Atrás</button>
              <button 
                onClick={handleFinalSubmit}
                disabled={spaces.length === 0}
                className="flex-1 px-6 py-4 rounded-2xl bg-[#4ade80] text-black font-black uppercase text-[10px] shadow-lg shadow-[#4ade80]/20 disabled:opacity-50"
              >
                Finalizar y Lanzar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}