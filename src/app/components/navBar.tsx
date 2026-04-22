'use client'
import {useState, useRef} from 'react'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {logoutAction} from '@/app/actions/logOut-action'

interface SidebarProps {
  usuario: {
    nombre: string;
    correo: string;
  } | null;
  children: React.ReactNode;
}

export default function NavbarLayout({ usuario, children }: SidebarProps){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()
    const navItems = [
        {'id':1 ,'nombre':'DASHBOARD', 'ruta':'/dashboard'},
        {'id':2 ,'nombre':'MIS EVENTOS', 'ruta':'/eventos'},
        {'id':3 ,'nombre':'REPORTES', 'ruta':'/reportes'},
        {'id':4 ,'nombre':'CONFIGURACION', 'ruta':'/configuracion'},
        {'id':5 ,'nombre':'MANUAL DE USUARIO', 'ruta':'/manualUsuario'},
    ]

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8 shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="#00f2ff" strokeWidth="4" />
                    <path d="M30,60 Q50,90 70,60" fill="none" stroke="#ff00ff" strokeWidth="4" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
                </div>
                <h1 className="text-white font-bold text-xs md:text-sm tracking-widest uppercase text-center px-2">
                EmotionTrack <span className="text-[#00f2ff]">Expo</span>
                </h1>
            </div>

            {/* Profile Summary */}
            <div className="flex flex-col items-center mb-8 w-full shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#4ade80] p-1 mb-3 flex items-center justify-center overflow-hidden bg-[#2d2d2d] relative group">
                    <span className="text-3xl md:text-4xl">👤</span>
                </div>
                <h2 className="text-white font-bold text-sm md:text-md text-center line-clamp-1 px-4 uppercase">{usuario?.nombre || 'Invitado'}</h2>
                <p className="text-slate-500 text-[10px] italic line-clamp-1 px-4">{usuario?.correo || ''}</p>
            </div>

            {/* Main Nav */}
            <nav className="w-full space-y-1 md:space-y-2 flex-1 overflow-y-auto pr-1">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.ruta}
                        onClick={() => {
                        setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 md:space-x-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                        pathname === item.ruta 
                            ? 'bg-[#4ade80] text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                            : 'text-slate-400 hover:bg-[#2d2d2d] hover:text-white'
                        }`}
          
                    >
                        <h4>{item.nombre}</h4>
                    </Link>
                ))}
            </nav>
            <div className="mt-auto pb-4 w-full">
                <form action={logoutAction}>
                    <button 
                    type="submit"
                    className="w-full flex items-center space-x-3 md:space-x-4 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                    >
                    <div className="w-6 h-6 flex items-center justify-center text-lg">
                        🚪
                    </div>
                    <h4 className="font-bold text-xs uppercase">Cerrar Sesión</h4>
                    </button>
                </form>
            </div>
        </div>
    )

    return(
        <div className="flex flex-col lg:flex-row h-screen bg-black overflow-hidden lg:p-4 gap-4 md:gap-6">
            {/* Mobile Top Header */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-[#333] z-40 shrink-0">
                <div className="flex items-center space-x-3">
                <div className="w-8 h-8">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M20,50 Q35,20 50,50 T80,50" fill="none" stroke="#00f2ff" strokeWidth="4" />
                    <path d="M30,60 Q50,90 70,60" fill="none" stroke="#ff00ff" strokeWidth="4" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="2 2" />
                    </svg>
                </div>
                <span className="text-white font-bold text-xs tracking-widest uppercase">
                    EmotionTrack <span className="text-[#00f2ff]">Expo</span>
                </span>
                </div>
                <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] flex-col items-center py-8 px-6 shadow-2xl shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <aside className={`lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-[#1a1a1a] border-l border-[#333] z-60 py-8 px-6 shadow-2xl transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 left-4 text-slate-500 hover:text-white p-2"
                >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
                <div className="mt-8 flex-1 overflow-hidden">
                <SidebarContent />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-4 pb-10">
                <div className="max-w-7xl mx-auto w-full pt-4 lg:pt-2">
                {children}
                </div>
            </main>
        </div>
    )
}