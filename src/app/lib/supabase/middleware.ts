// src/utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Esta línea refresca la sesión si ha expirado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // LÓGICA DE PROTECCIÓN:
  // Si no hay usuario y trata de entrar a /dashboard o /eventos, lo mandamos al login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    request.nextUrl.pathname !== '/' && !request.nextUrl.pathname.startsWith('/registro')  && !request.nextUrl.pathname.startsWith('/registro/payment')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/' // O la ruta de tu login
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}