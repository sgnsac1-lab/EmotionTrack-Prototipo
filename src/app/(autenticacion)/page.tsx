'use client'

import {useActionState} from 'react'
import {loginAction} from '../actions/login-action'
import {useFormStatus} from 'react-dom'
import { motion } from 'motion/react'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-[#4ade80] text-black font-bold py-3 rounded-xl uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all disabled:opacity-50"
    >
      {pending ? 'Ingresando...' : 'Iniciar Sesión'}
    </button>
  )
}

export default function LoginPage(){
    // state guardará lo que devuelva loginAction (el mensaje de error)
    const [state, formAction] = useActionState(loginAction, null)
    return(
        <section className="w-full h-screen flex flex-col justify-center items-center gap-5">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4ade80]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00f2ff]/10 rounded-full blur-[120px]" />
          </div>
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-4xl p-8 shadow-2xl relative z-10"
            >
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="#00f2ff" strokeWidth="4" />
                    <path d="M30,60 Q50,90 70,60" fill="none" stroke="#ff00ff" strokeWidth="4" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="2 2" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold uppercase tracking-widest">
                  EmotionTrack <span className="text-[#4ade80]">Expo</span>
                </h1>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-tighter">Acceso al Centro de Control</p>
              </div>

              <form action={formAction} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-2 tracking-widest">Email Corporativo</label>
                  <input 
                    type="email" 
                    name='email'
                    className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#4ade80] outline-none transition-all"
                    placeholder="ejemplo@fstnegocios.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-2 tracking-widest">Contraseña</label>
                  <input 
                    type="password" 
                    name='password'
                    className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-sm focus:border-[#4ade80] outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <SubmitButton />
              </form>

              <div className="mt-8 pt-6 border-t border-[#333] text-center">
                <p className="text-xs text-slate-500">¿No tienes una cuenta aún?</p>
                <Link 
                  href={'/registro'}
                  className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mt-2 hover:underline"
                >
                  Registrar nueva licencia
                </Link>
              </div>
            </motion.div>
        </section>
    )
}