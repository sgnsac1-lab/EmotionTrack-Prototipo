import { getSessionUser } from '@/app/lib/user'
import {actualizarEstadosEventos} from '@/app/lib/events-utils'
import EventosPanel from './eventosPanel'

export default async function EventosPage(){
    const usuario = await getSessionUser()

     if (usuario) {
        // Antes de mostrar los datos, validamos los estados
        await actualizarEstadosEventos(usuario.id);
      }

    return <EventosPanel user={usuario!} />
}