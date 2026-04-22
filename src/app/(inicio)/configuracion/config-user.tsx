'use client'
import {useState, useRef, useEffect} from 'react'
import {ObtenerConfiguracion, EditarConfiguracion} from '@/app/actions/configuracion-action'
import {PrivacyPolicy, configuracion} from '@/app/types'
import {usuario} from '@/app/types'
import {usePathname} from 'next/navigation'
import {toast} from 'sonner'

interface Props {
  User: usuario ; // O el tipo de tu usuario de Prisma
}

export default function configUserPage({User}: Props){
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
    const configVideoRef = useRef<HTMLVideoElement>(null)
    const [tempProfile, setTempProfile] = useState({ ...User })
    const [isSaving, setIsSaving] = useState(false)
    const [showSaveSuccess, setShowSaveSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pathname = usePathname()
    const activeStreamRef = useRef<MediaStream | null>(null)
    const [config, setConfig] = useState<configuracion | null>(null)
    const [policies, setPolicies] = useState<PrivacyPolicy[]>([]);
    const policyToConfigMap: Record<string, string> = {
      blur: 'anonimizacionBlur',
      delete: 'eliminarTrasProcesar',
      consent: 'consentimiento'
    };

    const loadDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devList.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.error("Error loading devices", e);
      }
    }

    const stopCameraGlobal = () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }
      if (configVideoRef.current) {
        configVideoRef.current.srcObject = null;
      }
    }

    const TraerConfiguracion = async() => {
      try {
        const data = await ObtenerConfiguracion(User.id)
        setConfig(data!)
        setPolicies([
          { id: 'blur', label: 'Anonimización facial automática (Blur)', isActive: data?.anonimizacionBlur! },
          { id: 'delete', label: 'Eliminar imágenes tras procesar', isActive: data?.eliminarTrasProcesar! },
          { id: 'consent', label: 'Consentimiento informado en pantalla', isActive: data?.consentimiento! },
        ])
        console.log(data)
      } catch (error) {
        console.log(`Se obtuvo el siguiente error: ${error}`)
      }
    }

      const togglePolicy = (id: string) => {
        const configKey = policyToConfigMap[id];

        // 2. Actualizamos el arreglo de Políticas (para la UI)
        setPolicies(prevPolicies => 
          prevPolicies.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
        );

        // 3. Actualizamos el objeto de Configuración (para el Hook/Backend)
        if (configKey) {
          setConfig((prevConfig: any) => ({
            ...prevConfig,
            [configKey]: !prevConfig[configKey] // Invertimos el valor booleano
          }));
        }
      }

      const GuardarConfig = async() => {
        await EditarConfiguracion(config?.id!, config)
        toast.success('Datos actualizados correctamente')
      }

    useEffect(()=>{
      loadDevices()
      TraerConfiguracion()
    },[])

    useEffect(()=>{
      const isConfigPage = pathname === '/configuracion';

      const manageCamera = async () => {
        if (isConfigPage && selectedDeviceId) {
          // Estamos en configuración: Encendemos
          try {
            // Limpiamos cualquier rastro antes de pedir nueva imagen
            stopCameraGlobal()

            const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: selectedDeviceId } }
            })
            
            activeStreamRef.current = stream
            
            // Esperamos un milisegundo a que el DOM esté listo
            if (configVideoRef.current) {
              configVideoRef.current.srcObject = stream
            }
          } catch (err) {
            console.error("Error al reactivar cámara:", err)
          }
        } else {
          stopCameraGlobal()
        }
      };

      manageCamera()
      
      return () => {
        stopCameraGlobal()
      }
    },[pathname,selectedDeviceId])

    return(
        <div className="animate-in fade-in duration-500 pb-10">
            <header className="mb-8">
              <h1 className="text-white text-3xl md:text-4xl font-bold mb-2 tracking-tight uppercase">Configuración</h1>
              <p className="text-[#4ade80] text-sm md:text-lg">Gestiona tu perfil y seguridad</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#4ade80] p-1 mb-6 flex items-center justify-center overflow-hidden bg-[#2d2d2d] relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {User?.avatarUrl ? <img src={User.avatarUrl} className="w-full h-full rounded-full object-cover" alt="Profile" /> : <span className="text-5xl md:text-6xl">👤</span>}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold text-[10px] uppercase tracking-tighter text-center px-4">Cambiar foto</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                  <h2 className="text-white font-black text-xl text-center mb-1 uppercase tracking-tight">{User?.nombre}</h2>
                  <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] text-center font-bold">{User?.correo}</p>
                </div>
                <section className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] p-8 shadow-xl overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📷</span>
                    <h3 className="text-[#4ade80] font-black text-[10px] uppercase tracking-[0.3em]">Setup de Hardware</h3>
                  </div>
                  <div className="space-y-6">
                    <select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} className="w-full bg-black/50 border border-[#333] rounded-xl p-3 text-white text-[11px] outline-none focus:border-[#4ade80]">
                      {devices.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                      ))}
                    </select>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#333]">
                      <video ref={configVideoRef} autoPlay playsInline muted className="w-full h-full object-cover brightness-75" />
                    </div>
                  </div>
                </section>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] p-8 shadow-xl">
                  <h3 className="text-[#4ade80] font-black text-[10px] uppercase tracking-[0.3em] mb-8">Información Personal</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-slate-500 font-bold mb-2 text-[10px] uppercase tracking-[0.2em]">Nombre Completo</label>
                      <input type="text" value={tempProfile.nombre} onChange={(e) => setTempProfile({...tempProfile, nombre: e.target.value})} className="w-full bg-black/50 border border-[#333] rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#4ade80]" />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-2 text-[10px] uppercase tracking-[0.2em]">Correo Electrónico</label>
                      <input type="email" value={tempProfile.correo} onChange={(e) => setTempProfile({...tempProfile, correo: e.target.value})} className="w-full bg-black/50 border border-[#333] rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#4ade80]" />
                    </div>
                  </div>
                </section>
                {/* Políticas de Privacidad y Seguridad */}
                <section className="bg-linear-to-br from-[#1a1a1a] to-[#222] border border-[#333] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🛡️</span>
                    <h3 className="text-[#4ade80] font-black text-[10px] uppercase tracking-[0.3em]">Políticas de Privacidad y Seguridad</h3>
                  </div>
                  <div className="space-y-4">
                    
                      {policies.slice(0, 3).map(p => (
                      <div key={p.id} onClick={() => togglePolicy(p.id)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${p.isActive ? 'border-[#4ade80]/40 bg-[#4ade80]/5' : 'border-[#333] bg-black/20 opacity-50'}`}>
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                        <div className={`w-8 h-4 rounded-full relative p-1 transition-all ${p.isActive ? 'bg-[#4ade80]' : 'bg-[#333]'}`}>
                           <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${p.isActive ? 'left-5' : 'left-1'}`}></div>
                        </div>
                      </div>
                    ))}
                    
                  </div>
                </section>
                <div className="flex flex-col md:flex-row items-center justify-end gap-4">
                  {showSaveSuccess && <span className="text-[#4ade80] text-[10px] font-black uppercase tracking-widest animate-pulse">¡Configuración guardada! ✅</span>}
                  <button onClick={GuardarConfig} className="w-full md:w-auto bg-[#4ade80] hover:bg-[#3ec974] text-black font-black py-4 px-12 rounded-2xl transition-all shadow-lg uppercase tracking-[0.2em] text-xs active:scale-95">{isSaving ? 'Guardando...' : 'Guardar Cambios'}</button>
                </div>
              </div>
            </div>
        </div>
    )
}