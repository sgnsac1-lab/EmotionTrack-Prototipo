'use server';
import { createClient } from '@/app/lib/supabase/server'
import {prisma} from '@/app/lib/prisma'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const supabase = await createClient();

  // AQUÍ ESTÁ EL "CHECKING"
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Si los datos son incorrectos, Supabase devuelve un error
    // Puedes manejarlo devolviendo un mensaje a la UI
    return { message: "Correo o contraseña incorrectos" };
  }

  const authUser = data.user;

  await prisma.usuario.upsert({
    where: {id: authUser.id},
    update: {correo: authUser.email},
    create: {
      id: authUser.id,
      correo: authUser.email!,
      nombre: authUser.user_metadata.full_name || "Usuario Desconocido",
      configuracion: {
        create: {anonimizacionBlur: true}
      }
    }
  })

  // Si no hay error, significa que los datos son correctos
  // Supabase ya creó la "sesión" (la cookie) automáticamente
  redirect('/dashboard');
}