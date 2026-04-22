'use client';
import { useEffect, useRef, useState } from 'react';
import {registrarMetricaAction, getSalasByEvento} from '@/app/actions/evento-action'
import {finalizarYGenerarReporte} from '@/app/actions/reporte-actions'
import {useParams} from 'next/navigation'
import * as faceapi from 'face-api.js';
import Link from 'next/link';

interface AudienceEmotions {
  happy: number;
  neutral: number;
  sad: number;
  angry: number;
  surprised: number;
}

export default function AnalisisEnVivo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<any>(null); 
  const lastSaveRef = useRef<number>(Date.now())
  const params = useParams()
  const idEvento = params.id

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [salas, setSalas] = useState<any[]>([]);
  const [salaSelected, setSalaSelected] = useState<string>(""); // AQUÍ GUARDAREMOS EL SALA_ID
  const [isLoadingSalas, setIsLoadingSalas] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [engagement, setEngagement] = useState<number | null>(null);
  const [peopleCount, setPeopleCount] = useState(0);
  const [emotionsData, setEmotionsData] = useState<AudienceEmotions>({
    happy: 0, neutral: 0, sad: 0, angry: 0, surprised: 0
  });

  useEffect(() => {
    const fetchSalas = async () => {
      const data = await getSalasByEvento(idEvento as string);
      setSalas(data);
      setIsLoadingSalas(false);
      
      // Si solo hay una sala, la seleccionamos por defecto
      if (data.length === 1) setSalaSelected(data[0].id);
    };
    fetchSalas();
  }, [idEvento]);

  // 1. Cargar modelos
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Error cargando modelos", e);
      }
    };
    loadModels();
    return () => stopScanning(); // Limpiar al salir de la página
  }, []);

  // 2. Iniciar Cámara
  const startScanning = async () => {
    if (!modelsLoaded) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara", err);
    }
  };

  // 3. DETENER TODO (Apaga cámara y limpia datos)
  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop()); // APAGA EL LED
      videoRef.current.srcObject = null;
      finalizarYGenerarReporte(idEvento as string)
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
    setEngagement(null);
    setPeopleCount(0);
  };

  // 4. Lógica de Análisis
  const handleVideoPlay = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const displaySize = { 
      width: 640, 
      height: 480 
    };
    faceapi.matchDimensions(canvasRef.current, displaySize);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
        .withFaceExpressions();

      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context?.clearRect(0, 0, displaySize.width, displaySize.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // Dibuja el recuadro azul
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      }

      if (detections.length > 0) {
        setPeopleCount(detections.length);
        let sH = 0, sN = 0, sS = 0, sA = 0, sSu = 0;

        detections.forEach((det) => {
          sH += det.expressions.happy;
          sN += det.expressions.neutral;
          sS += det.expressions.sad;
          sA += det.expressions.angry;
          sSu += det.expressions.surprised;
        });

        const n = detections.length;
        const avg = {
          happy: Math.round((sH / n) * 100),
          neutral: Math.round((sN / n) * 100),
          sad: Math.round((sS / n) * 100),
          angry: Math.round((sA / n) * 100),
          surprised: Math.round((sSu / n) * 100),
        };

        setEmotionsData(avg);
        setEngagement(Math.round((avg.happy * 0.7) + (avg.surprised * 0.3)));

        const ahora = Date.now();
      if (ahora - lastSaveRef.current > 60000) { 
        lastSaveRef.current = ahora;

        // Traducimos IA -> Tu Modelo
        const payload = {
          engagement: Math.round((avg.happy * 0.7) + (avg.surprised * 0.3)),
          atencion: avg.neutral + (avg.happy * 0.5),
          interes: avg.happy + avg.surprised,
          aburrimiento: avg.neutral > 60 ? avg.neutral : 10,
          desconexion: avg.sad + avg.angry
        };

        // LLAMADA A LA DB (Sin bloquear la UI)
        registrarMetricaAction(idEvento as string, salaSelected, payload);
        console.log("Métrica guardada en DB ✅");
      }
      }
  
    }, 1000);
  };

  const renderEmotionCard = (label: string, value: number, color: string, emoji: string) => (
    <div className="bg-black/40 border border-[#333] rounded-2xl p-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">{label}</span>
      </div>
      <span className="text-3xl font-black text-white">{value}%</span>
      <div className="w-full bg-[#333] h-1.5 rounded-full mt-3 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  return (
    <div className="animate-in zoom-in-95 duration-500 pb-10">
        <header className="mb-8 flex items-center gap-6">
           <Link href={'/eventos'} className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#333] text-[#4ade80] hover:scale-110 shadow-lg text-xl">←</Link>
           <h2 className="text-white text-2xl md:text-4xl font-black tracking-tighter uppercase">Análisis en Vivo</h2>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                {!isScanning && (
                    <div className="bg-[#1a1a1a] border border-[#333] p-8 rounded-[2rem] animate-in fade-in">
                    <h3 className="text-[#4ade80] font-bold text-xs uppercase tracking-widest mb-4">
                        Selecciona el espacio de análisis:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {salas.map((sala) => (
                        <button
                            key={sala.id}
                            onClick={() => setSalaSelected(sala.id)}
                            className={`p-4 rounded-2xl border transition-all text-sm font-bold uppercase ${
                            salaSelected === sala.id 
                            ? 'border-[#4ade80] bg-[#4ade80]/10 text-white' 
                            : 'border-[#333] bg-black/40 text-slate-500 hover:border-slate-500'
                            }`}
                        >
                            {sala.nombre}
                        </button>
                        ))}
                    </div>
                    </div>
                )}

              <div className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] p-4 md:p-8 overflow-hidden shadow-2xl relative">
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-[#333]">
                      <video 
                        ref={videoRef} autoPlay playsInline muted onPlay={handleVideoPlay}
                        width="640" height="480"
                        className={`w-full h-full object-cover transition-opacity ${isScanning ? 'opacity-100' : 'opacity-40'}`} 
                      />
                      {/* El Canvas ahora es absolute y está sobre el video */}
                      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
                      
                      {!isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/40 z-10">
                          <button onClick={startScanning} disabled={!salaSelected || !modelsLoaded} className="bg-[#4ade80] text-black px-10 py-6 rounded-full font-black uppercase tracking-widest active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(74,222,128,0.4)]">
                            {salaSelected ? 'Iniciar Escaneo' : 'Cargando IA...'}
                          </button>
                        </div>
                      )}
                  </div>
              </div>

              {/* BOTÓN PARA DETENER CAMARA */}
              {isScanning && (
                <button 
                  onClick={stopScanning}
                  className="w-full bg-red-600/20 border border-red-600/50 text-red-500 hover:bg-red-600 hover:text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  🛑 Detener Análisis y Cámara
                </button>
              )}
            </div>

            <div className="bg-[#1a1a1a] border border-[#333] rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[#4ade80] font-black uppercase tracking-[0.4em] text-[10px] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></div> TELEMETRÍA EMOCIONAL
                  </h3>
                  {isScanning && (
                    <div className="bg-black/50 border border-[#4ade80]/30 px-4 py-2 rounded-full text-[#4ade80] font-bold text-[10px]">
                      👥 AUDIENCIA: {peopleCount}
                    </div>
                  )}
                </div>
                
                {isScanning && engagement !== null ? (
                    <div className="flex-1 flex flex-col">
                        <div className="flex flex-col items-center justify-center mb-10 py-8 bg-black/30 rounded-3xl border border-[#333]">
                            <span className="text-8xl font-black text-white tracking-tighter">{engagement}%</span>
                            <span className="text-slate-400 uppercase tracking-[0.3em] text-[11px] mt-3">Engagement Total</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {renderEmotionCard('Neutral', emotionsData.neutral, 'bg-slate-500', '😐')}
                          {renderEmotionCard('Felicidad', emotionsData.happy, 'bg-[#4ade80]', '😊')}
                          {renderEmotionCard('Sorpresa', emotionsData.surprised, 'bg-[#00f2ff]', '😮')}
                          {renderEmotionCard('Tristeza', emotionsData.sad, 'bg-blue-600', '😢')}
                          {renderEmotionCard('Enojo', emotionsData.angry, 'bg-red-600', '😠')}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-slate-600 border-2 border-dashed border-[#333] rounded-[2rem]">
                        Pulse "Iniciar Escaneo" para activar la IA
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}