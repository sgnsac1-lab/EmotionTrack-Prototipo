// middleware.ts (en la raíz del proyecto)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/app/lib/supabase/middleware' // Ajusta esta ruta si tu 'src' está en otro lado

export async function middleware(request: NextRequest) {
  // Esta función es la que realmente ejecuta Next.js en cada clic
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Protege todas las rutas excepto:
     * - api (rutas de API)
     * - _next/static y _next/image (archivos internos de Next)
     * - Todos los archivos en public (imágenes, iconos, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}