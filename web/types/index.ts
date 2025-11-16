// Types pentru mesajele din chat
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  checklist?: string[];
  detected_procedure?: string;
  detected_domain?: string;
  needs_documents?: boolean;
  suggested_action?: string;
}

// Types pentru răspunsul chatbot-ului de la API
export interface ChatbotResponse {
  answer: string;
  checklist?: string[];
}

export interface ChatbotRequest {
  message: string;
  dossier_id?: string;
}

export interface UploadResponse {
  success: boolean;
  errors?: string[];
  error?: string;
  dossier_id?: string;
  documents_processed?: any[]; // Rezultatele validării de la AI
  missing_documents?: string[]; // Documente lipsă
  procedure?: string; // Procedura detectată
  summary?: string; // Sumarul text de la AI
}


export interface FileWithStatus {
  file: File;
  id: string;
  status: "pending" | "uploading" | "validated" | "error";
  errorMessage?: string;
}

// Types pentru status dosar
export type StepStatus = "done" | "in_progress" | "pending";

export interface DossierStep {
  id: number;
  label: string;
  status: StepStatus;
}

export interface DossierStatus {
  dossier_id: string;
  type: string;
  submitted_at: string;
  current_step: number;
  steps: DossierStep[];
}

// Configurare API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
