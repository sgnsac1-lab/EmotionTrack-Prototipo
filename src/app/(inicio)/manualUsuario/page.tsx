export default function ManualUsuarioPage(){
    return(
        <div className="animate-in fade-in duration-500 pb-10 h-[calc(100vh-100px)]">
            <header className="mb-8">
              <h1 className="text-white text-3xl md:text-4xl font-bold mb-2 tracking-tight uppercase">Manual de Usuario</h1>
              <p className="text-[#4ade80] text-sm md:text-lg">Guía completa para el uso de la plataforma</p>
            </header>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-[#4ade80]/5 to-transparent pointer-events-none"></div>
               <div className="text-6xl md:text-8xl mb-8 group-hover:scale-110 transition-transform duration-500">📖</div>
               <h3 className="text-white text-xl md:text-2xl font-black mb-4 uppercase tracking-tighter">Documentación Técnica y de Usuario</h3>
               <p className="text-slate-400 max-w-lg mb-12 text-sm md:text-md leading-relaxed">
                 Consulte nuestro manual detallado para aprender sobre la configuración de hardware, 
                 gestión de eventos en vivo y interpretación de métricas emocionales.
               </p>
               <a 
                 href="https://drive.google.com/file/d/18gqKuK7JQpEow1wi1yluwJinY5IR6qil/view?usp=sharing" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-[#4ade80] hover:bg-[#3ec974] text-black font-black py-5 px-12 rounded-2xl transition-all shadow-[0_0_20px_rgba(74,222,128,0.3)] uppercase tracking-[0.2em] text-xs flex items-center gap-3 active:scale-95"
               >
                 <span>Abrir Manual PDF</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                 </svg>
               </a>
            </div>
          </div>
    )
}