// src/lib/headPose.ts
import * as faceapi from 'face-api.js'

export function calcularEnfoqueVisual(landmarks: faceapi.FaceLandmarks68): number {
  const nose = landmarks.getNose()
  const leftEye = landmarks.getLeftEye()
  const rightEye = landmarks.getRightEye()
  
  // 1. Calculamos el vector de la cara (la dirección)
  // Usamos el punto central entre los ojos
  const eyeCenter = {
    x: (leftEye[0].x + rightEye[0].x) / 2,
    y: (leftEye[0].y + rightEye[0].y) / 2,
  };

  // 2. Comparamos la punta de la nariz con el centro de los ojos
  const dx = nose[6].x - eyeCenter.x; // Desviación horizontal
  const dy = nose[6].y - eyeCenter.y; // Desviación vertical

  // 3. Normalizamos la desviación (para que sea un % de 0 a 100)
  // La distancia promedio entre ojos es una buena base de normalización
  const eyeDist = Math.sqrt(
    Math.pow(rightEye[0].x - leftEye[0].x, 2) + 
    Math.pow(rightEye[0].y - leftEye[0].y, 2)
  );

  // Normalizamos las desviaciones
  const normDX = Math.abs(dx / eyeDist);
  const normDY = Math.abs(dy / eyeDist);

  // 4. Calculamos una "Penalidad de Desviación"
  // Si la desviación es muy alta (mirando a los lados o abajo), la penalidad es alta.
  let penalidad = (normDX * 1.5) + (normDY * 2.0); // La desviación vertical penaliza más (celular)

  // 5. El % de Foco es 100 menos la penalidad, ajustando límites
  let focusVisual = 100 - (penalidad * 20); // Multiplicador para ajustar sensibilidad

  // Ajustamos límites finales (0 - 100)
  return Math.max(0, Math.min(100, focusVisual));
}