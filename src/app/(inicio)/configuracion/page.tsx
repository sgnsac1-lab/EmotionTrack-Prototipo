import { getSessionUser } from '@/app/lib/user'
import ConfiguracionUserPage from './config-user'

export default async function ConfiguracionPage(){
    const usuario = await getSessionUser()
    

    return <ConfiguracionUserPage User={usuario!} />
}