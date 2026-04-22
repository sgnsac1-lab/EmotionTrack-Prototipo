// src/lib/user.ts
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Buscamos en nuestra tabla personalizada
  return await prisma.usuario.findUnique({
    where: { id: user.id },
    include: { configuracion: true } // Traemos de una vez su config
  });
}