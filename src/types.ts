export interface Anamnesis {
  skinType: string;
  allergies: string;
  contraindications: string;
  mainComplaint: string;
  medications: string;
  diseases: string;
  observations: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  cpf: string;
  anamnesis: Anamnesis;
  createdAt: string;
  lgpdAccepted?: boolean;
  lgpdAcceptedAt?: string;
  age?: number;
  photos?: Array<{ id: string; url: string; date: string; title?: string }>;
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: 'facial' | 'corporal' | 'outros';
  color: string; // Tailwind hex or class color
}

export interface Appointment {
  id: string;
  patientId: string;
  procedureId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
}

export interface EvolutionPhoto {
  id: string;
  date: string;
  type: 'before' | 'after' | 'single';
  image: string; // base64 string
  notes: string;
}

export interface PatientEvolution {
  id: string;
  patientId: string;
  procedureId: string;
  date: string;
  description: string;
  photos: EvolutionPhoto[];
  sessionNumber?: number;
  procedureName?: string;
  notes?: string;
}
