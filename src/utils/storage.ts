import { Patient, Procedure, Appointment, PatientEvolution, EvolutionPhoto } from '../types';

// Storage Keys
const PATIENTS_KEY = 'fisio_aline_patients';
const PROCEDURES_KEY = 'fisio_aline_procedures';
const APPOINTMENTS_KEY = 'fisio_aline_appointments';
const EVOLUTIONS_KEY = 'fisio_aline_evolutions';

// Default mock photos styled as SVG DataURLs showing treatment progress
const MOCK_FACE_BEFORE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23fcf6f5"/><circle cx="150" cy="150" r="80" fill="%23ffd3ca" opacity="0.8"/><circle cx="150" cy="150" r="75" fill="none" stroke="%23dfaba0" stroke-width="2"/><ellipse cx="120" cy="130" rx="10" ry="15" fill="%235c4033"/><ellipse cx="180" cy="130" rx="10" ry="15" fill="%235c4033"/><path d="M125 185 Q150 195 175 185" stroke="%235c4033" stroke-width="3" fill="none"/><circle cx="100" cy="160" r="12" fill="%23ff9999" opacity="0.6"/><circle cx="200" cy="160" r="12" fill="%23ff9999" opacity="0.6"/><rect x="140" y="110" width="20" height="40" fill="%23ff6666" opacity="0.4" rx="10"/></svg>`;
const MOCK_FACE_AFTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23fbf8f5"/><circle cx="150" cy="150" r="80" fill="%23fce2db" opacity="0.9"/><circle cx="150" cy="150" r="75" fill="none" stroke="%23e7bfa5" stroke-width="2"/><ellipse cx="120" cy="130" rx="10" ry="15" fill="%235c4033"/><ellipse cx="180" cy="130" rx="10" ry="15" fill="%235c4033"/><path d="M120 180 Q150 205 180 180" stroke="%235c4033" stroke-width="4" fill="none"/><circle cx="95" cy="155" r="15" fill="%23ffb3b3" opacity="0.4"/><circle cx="205" cy="155" r="15" fill="%23ffb3b3" opacity="0.4"/></svg>`;

const MOCK_BODY_BEFORE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23f9f5f5"/><path d="M100 80 C130 90, 170 90, 200 80 C190 140, 210 180, 185 240 L115 240 C90 180, 110 140, 100 80 Z" fill="%23ecd2ca" stroke="%23d6a396" stroke-width="2"/><path d="M120 130 C135 150, 165 150, 180 130" stroke="%23db4a39" stroke-width="2" fill="none" opacity="0.5"/></svg>`;
const MOCK_BODY_AFTER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23f5f8f5"/><path d="M100 80 C135 85, 165 85, 200 80 C185 140, 195 185, 175 240 L125 240 C105 185, 115 140, 100 80 Z" fill="%23ebd8d2" stroke="%23cca398" stroke-width="2"/><path d="M130 135 C140 142, 160 142, 170 135" stroke="%232b7a39" stroke-width="2" fill="none" opacity="0.4"/></svg>`;

const DEFAULT_PROCEDURES: Procedure[] = [
  {
    id: 'p1',
    name: 'Limpeza de Pele Profunda',
    description: 'Extração de comedões, peeling de diamante, máscara calmante e LEDterapia.',
    price: 180.0,
    duration: 60,
    category: 'facial',
    color: '#e07a5f' // Terracotta warm
  },
  {
    id: 'p2',
    name: 'Aplicação de Botox',
    description: 'Procedimento injetável para suavização de rugas de expressão na testa e área dos olhos.',
    price: 1200.0,
    duration: 45,
    category: 'facial',
    color: '#81b29a' // Soft sage green
  },
  {
    id: 'p3',
    name: 'Drenagem Linfática Corporal',
    description: 'Massagem manual para redução de retenção de líquidos, melhora da circulação e celulite.',
    price: 130.0,
    duration: 50,
    category: 'corporal',
    color: '#3d5a80' // Slate blue
  },
  {
    id: 'p4',
    name: 'Preenchimento Labial',
    description: 'Modelagem e volumização labial com ácido hialurônico para simetria e contorno.',
    price: 950.0,
    duration: 60,
    category: 'facial',
    color: '#ee6c4d' // Coral rose
  },
  {
    id: 'p5',
    name: 'Radiofrequência Corporal',
    description: 'Tratamento contra flacidez e celulite, estimulando a síntese de colágeno natural.',
    price: 190.0,
    duration: 40,
    category: 'corporal',
    color: '#98c1d9' // Soft sky blue
  },
  {
    id: 'p6',
    name: 'Peeling Químico',
    description: 'Renovação celular epidérmica profunda para redução de melasma e cicatrizes de acne.',
    price: 250.0,
    duration: 45,
    category: 'facial',
    color: '#f4a261' // Honey gold
  }
];

const DEFAULT_PATIENTS: Patient[] = [];

// Helper to get dates relative to today
const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const DEFAULT_APPOINTMENTS: Appointment[] = [];

const DEFAULT_EVOLUTIONS: PatientEvolution[] = [];

// Initialize Storage if empty
export function initLocalStorage() {
  if (!localStorage.getItem(PATIENTS_KEY)) {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(DEFAULT_PATIENTS));
  }
  if (!localStorage.getItem(PROCEDURES_KEY)) {
    localStorage.setItem(PROCEDURES_KEY, JSON.stringify(DEFAULT_PROCEDURES));
  }
  if (!localStorage.getItem(APPOINTMENTS_KEY)) {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(DEFAULT_APPOINTMENTS));
  }
  if (!localStorage.getItem(EVOLUTIONS_KEY)) {
    localStorage.setItem(EVOLUTIONS_KEY, JSON.stringify(DEFAULT_EVOLUTIONS));
  }
}

// Reset data back to default values
export function resetToDefaultData() {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(DEFAULT_PATIENTS));
  localStorage.setItem(PROCEDURES_KEY, JSON.stringify(DEFAULT_PROCEDURES));
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(DEFAULT_APPOINTMENTS));
  localStorage.setItem(EVOLUTIONS_KEY, JSON.stringify(DEFAULT_EVOLUTIONS));
  window.location.reload();
}

// Patients API
export function getPatients(): Patient[] {
  initLocalStorage();
  const data = localStorage.getItem(PATIENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePatients(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function addPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Patient {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: 'pt_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  patients.unshift(newPatient);
  savePatients(patients);
  return newPatient;
}

export function updatePatient(updated: Patient) {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === updated.id);
  if (index !== -1) {
    patients[index] = updated;
    savePatients(patients);
  }
}

export function deletePatient(id: string) {
  const patients = getPatients().filter(p => p.id !== id);
  savePatients(patients);
  
  // Clean up associated appointments and evolutions too
  const appointments = getAppointments().filter(a => a.patientId !== id);
  saveAppointments(appointments);
  
  const evolutions = getEvolutions().filter(e => e.patientId !== id);
  saveEvolutions(evolutions);
}

// Procedures API
export function getProcedures(): Procedure[] {
  initLocalStorage();
  const data = localStorage.getItem(PROCEDURES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProcedures(procedures: Procedure[]) {
  localStorage.setItem(PROCEDURES_KEY, JSON.stringify(procedures));
}

export function addProcedure(procedure: Omit<Procedure, 'id'>): Procedure {
  const procedures = getProcedures();
  const colors = ['#e07a5f', '#81b29a', '#3d5a80', '#ee6c4d', '#98c1d9', '#f4a261', '#e0b1cb', '#be95c4', '#5f0f40'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const newProcedure: Procedure = {
    ...procedure,
    id: 'p_' + Math.random().toString(36).substr(2, 9),
    color: procedure.color || randomColor
  };
  procedures.push(newProcedure);
  saveProcedures(procedures);
  return newProcedure;
}

export function updateProcedure(updated: Procedure) {
  const procedures = getProcedures();
  const index = procedures.findIndex(p => p.id === updated.id);
  if (index !== -1) {
    procedures[index] = updated;
    saveProcedures(procedures);
  }
}

export function deleteProcedure(id: string) {
  const procedures = getProcedures().filter(p => p.id !== id);
  saveProcedures(procedures);
  
  // Update status or unlink related appointments/evolutions if needed, or leave as is
}

// Appointments API
export function getAppointments(): Appointment[] {
  initLocalStorage();
  const data = localStorage.getItem(APPOINTMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAppointments(appointments: Appointment[]) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

export function addAppointment(appointment: Omit<Appointment, 'id'>): Appointment {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: 'ap_' + Math.random().toString(36).substr(2, 9)
  };
  appointments.push(newAppointment);
  // Sort chronologically
  appointments.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  saveAppointments(appointments);
  return newAppointment;
}

export function updateAppointment(updated: Appointment) {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === updated.id);
  if (index !== -1) {
    appointments[index] = updated;
    appointments.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    saveAppointments(appointments);
  }
}

export function deleteAppointment(id: string) {
  const appointments = getAppointments().filter(a => a.id !== id);
  saveAppointments(appointments);
}

// Evolutions API
export function getEvolutions(): PatientEvolution[] {
  initLocalStorage();
  const data = localStorage.getItem(EVOLUTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEvolutions(evolutions: PatientEvolution[]) {
  localStorage.setItem(EVOLUTIONS_KEY, JSON.stringify(evolutions));
}

export function addEvolution(patientId: string, procedureId: string, description: string, photos: Omit<EvolutionPhoto, 'id'>[]): PatientEvolution {
  const evolutions = getEvolutions();
  
  const photoEntries: EvolutionPhoto[] = photos.map(p => ({
    ...p,
    id: 'pht_' + Math.random().toString(36).substr(2, 9)
  }));

  const newEvolution: PatientEvolution = {
    id: 'ev_' + Math.random().toString(36).substr(2, 9),
    patientId,
    procedureId,
    date: new Date().toISOString().split('T')[0],
    description,
    photos: photoEntries
  };

  evolutions.unshift(newEvolution);
  saveEvolutions(evolutions);
  return newEvolution;
}

export function addPhotoToEvolution(evolutionId: string, photo: Omit<EvolutionPhoto, 'id'>) {
  const evolutions = getEvolutions();
  const index = evolutions.findIndex(e => e.id === evolutionId);
  if (index !== -1) {
    const newPhoto: EvolutionPhoto = {
      ...photo,
      id: 'pht_' + Math.random().toString(36).substr(2, 9)
    };
    evolutions[index].photos.push(newPhoto);
    saveEvolutions(evolutions);
  }
}

export function deleteEvolution(id: string) {
  const evolutions = getEvolutions().filter(e => e.id !== id);
  saveEvolutions(evolutions);
}

// Client Side Image Compression Helper
export function compressImage(file: File, maxW = 400, maxH = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Compressed JPEG, 0.6 quality is optimal for size vs aesthetics
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Export database as JSON file download
export function exportDatabaseBackup() {
  const backupData = {
    patients: getPatients(),
    procedures: getProcedures(),
    appointments: getAppointments(),
    evolutions: getEvolutions(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_fisio_aline_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import database from JSON file upload
export function importDatabaseBackup(jsonString: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.patients && parsed.procedures && parsed.appointments && parsed.evolutions) {
        localStorage.setItem(PATIENTS_KEY, JSON.stringify(parsed.patients));
        localStorage.setItem(PROCEDURES_KEY, JSON.stringify(parsed.procedures));
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(parsed.appointments));
        localStorage.setItem(EVOLUTIONS_KEY, JSON.stringify(parsed.evolutions));
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      console.error(e);
      resolve(false);
    }
  });
}

// PIN Access Code Security for LGPD Compliance
export function getAppPin(): string | null {
  return localStorage.getItem('fisio_app_pin');
}

export function setAppPin(pin: string) {
  localStorage.setItem('fisio_app_pin', pin);
}

export function removeAppPin() {
  localStorage.removeItem('fisio_app_pin');
}

