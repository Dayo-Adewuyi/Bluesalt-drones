export interface IMedication {
  id: number;
  name: string;
  weight: number;
  code: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMedicationDTO {
  name: string;
  weight: number;
  code: string;
  image?: string | null;
}
