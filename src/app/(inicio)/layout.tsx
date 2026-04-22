// src/app/dashboard/layout.tsx
import { getSessionUser } from '@/app/lib/user';
import Sidebar from '@/app/components/navBar'; // El que creamos arriba

export default async function NavbarLayout({ children }: { children: React.ReactNode }) {
  // Aquí sí puedes usar async y llamar a la DB/Cookies
  const usuario = await getSessionUser();

  return (
    <Sidebar usuario={usuario}>
      {children}
    </Sidebar>
  );
}