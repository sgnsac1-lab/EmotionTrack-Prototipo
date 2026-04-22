// src/app/(auth)/actions.ts
'use server';

import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const supabase = await createClient();
  
  // Esto limpia la sesión en Supabase y borra las cookies locales
  await supabase.auth.signOut();
  
  // Redirigimos al usuario a la página de login o inicio
  redirect('/');
}