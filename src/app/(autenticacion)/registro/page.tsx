'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

export default function registroPage(){
    return(
        <section className="w-full h-screen flex flex-col justify-center items-center gap-5">
                <motion.div 
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-4xl p-8 shadow-2xl relative z-10"
          >
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Crear Licencia</h2>
            <p className="text-slate-500 text-xs mb-8 uppercase tracking-widest">Paso 1 de 2: Credenciales</p>

            <form className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-2 tracking-widest">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#4ade80] outline-none transition-all"
                  placeholder="Hercilia San Martin"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-2 tracking-widest">Email Corporativo</label>
                <input 
                  type="email" 
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#4ade80] outline-none transition-all"
                  placeholder="email@empresa.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-2 tracking-widest">Nueva Contraseña</label>
                <input 
                  type="password" 
                  className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#4ade80] outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <Link
                href={'/registro/payment'}
                className="w-full flex justify-center bg-[#00f2ff] text-black font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all"
              >
                Siguiente: Pago y Activación
              </Link>
            </form>

            <Link 
              href={'/'}
              className="w-full flex justify-center text-slate-500 text-[10px] uppercase font-bold mt-4 tracking-widest hover:text-white transition-colors"
            >
              Volver al Login
            </Link>
          </motion.div>
        </section>
    )
}