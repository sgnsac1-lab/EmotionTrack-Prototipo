'use client'

import { motion } from 'motion/react'
import Link from 'next/link'

export default function paymentPage() {
    return(
        <section className="w-full h-screen flex flex-col justify-center items-center gap-5">
            <motion.div 
            key="payment"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-2xl bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left: Benefits context */}
              <div className="flex-1 bg-black/40 p-8 border-r border-[#333]">
                <h3 className="text-[#4ade80] font-bold uppercase text-xs tracking-[0.2em] mb-6 underline underline-offset-8">¿Qué incluye tu Licencia Pro?</h3>
                <ul className="space-y-6">
                  <li className="flex items-start space-x-3">
                    <span className="text-[#4ade80] mt-1">✓</span>
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wider">IA Emotion Analysis</p>
                      <p className="text-slate-500 text-[10px]">Análisis en tiempo real de atención, interés y fatiga.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-[#4ade80] mt-1">✓</span>
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wider">Multi-Space Tracking</p>
                      <p className="text-slate-500 text-[10px]">Gestiona múltiples auditorios y salas simultáneamente.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-[#4ade80] mt-1">✓</span>
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wider">Smart Reporting</p>
                      <p className="text-slate-500 text-[10px]">Exportación de PDFs inteligentes con gráficas avanzadas.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="text-[#4ade80] mt-1">✓</span>
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wider">Privacy First Technology</p>
                      <p className="text-slate-500 text-[10px]">Anonimización automática y cumplimiento de RGPD.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right: Payment card */}
              <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="mb-8 text-center">
                  <div className="inline-block p-2 bg-[#4ade80]/10 rounded-full mb-4">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h2 className="text-2xl font-bold">$199<span className="text-sm font-normal text-slate-500"> / evento</span></h2>
                  <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Activación inmediata tras el pago</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/50 border border-[#333] rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Número de tarjeta</p>
                    <div className="flex items-center space-x-2 text-white font-mono tracking-widest">
                       <span>XXXX</span><span>XXXX</span><span>XXXX</span><span>4242</span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1 bg-black/50 border border-[#333] rounded-xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">Vence</p>
                      <p className="text-white font-mono">12/28</p>
                    </div>
                    <div className="flex-1 bg-black/50 border border-[#333] rounded-xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-widest">CVC</p>
                      <p className="text-white font-mono">***</p>
                    </div>
                  </div>

                  <button 
                    className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:bg-[#4ade80] transition-all disabled:opacity-50 mt-4"
                  >
                    Pagar
                  </button>
                  
                  <p className="text-[8px] text-center text-slate-600 uppercase tracking-widest px-4">
                    Al confirmar el pago, aceptas los términos de servicio y la política de privacidad de FST Negocios.
                  </p>
                </div>
              </div>
            </div>
            
            <Link
              href={'/registro'} 
              className="absolute top-4 left-4 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center"
            >
              ← Volver
            </Link>
          </motion.div>
        </section>
    )
}