'use server'
import { prisma } from '@/app/lib/prisma'

export async function ObtenerConfiguracion(usuarioId: string) {
    try {
        const response = await prisma.configuracion.findUnique({
            where: {usuarioId:usuarioId}
        })
        return response
    } catch (error) {
        console.error("Error al obtener configuracion:", error);
    }
}

export async function EditarConfiguracion(id:string, data:any) {
    try {
        const response = await prisma.configuracion.update({
            where: {id: id},
            data: {
                anonimizacionBlur: data.anonimizacionBlur,
                eliminarTrasProcesar: data.eliminarTrasProcesar,
                consentimiento: data.consentimiento
            }
        })
        return { success: true };
    } catch (error) {
        console.error("Error al editar configuracion:", error);
    }
}