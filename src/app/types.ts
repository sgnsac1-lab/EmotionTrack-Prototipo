export interface PrivacyPolicy {
  id: string;
  label: string;
  isActive: boolean;
}

export interface configuracion {
        id: string;
        usuarioId: string;
        anonimizacionBlur: boolean;
        eliminarTrasProcesar: boolean;
        consentimiento: boolean;
}

interface sala {
  id:          String 
  nombre:      String 
  engagement:  Number 
  eventoId:    String
  
}

export interface usuario {
    configuracion: configuracion | null;
    avatarUrl: string | null;
    nombre: string;
    correo: string;
    id: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'date'| 'number';
  placeholder?: string;
  options?: { value: string; label: string }[]; // Solo para selects
  required?: boolean;
}

export interface Evento {
  id: String   
  nombre: String   
  ubicacion: String   
  fecha: Date
  asistentesTotal: number      
  estado: String
  usuarioId: string
}