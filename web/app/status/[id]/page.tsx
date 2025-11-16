"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DossierStatus, DossierStep } from "@/types";
import StatusTimeline from "@/components/StatusTimeline";
import CitizenPageLayout from "@/components/CitizenPageLayout";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Request = {
  id: string;
  request_type: string;
  status: string;
  extracted_metadata?: {
    address?: string;
    cadastral_number?: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
};

type Document = {
  id: string;
  file_name: string;
  document_type_ai: string;
  validation_status: string;
  uploaded_at: string;
};

export default function CitizenStatusPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dossierStatus, setDossierStatus] = useState<DossierStatus | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDossierStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch din Supabase în loc de API
        const { data: request, error: dbError } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError || !request) {
          throw new Error("Dosarul nu a fost găsit");
        }

        // Fetch documents for this request
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('id, file_name, document_type_ai, validation_status, uploaded_at')
          .eq('request_id', id)
          .order('uploaded_at', { ascending: false });

        console.log('Fetching documents for request_id:', id);
        console.log('Documents response:', { docs, docsError });

        if (!docsError && docs) {
          setDocuments(docs);
        }

        // Mapează statusul din Supabase la structura DossierStatus
        const mappedStatus: DossierStatus = {
          dossier_id: request.id,
          type: getRequestTypeLabel(request.request_type),
          current_step: mapStatusToStepId(request.status),
          submitted_at: request.created_at,
          steps: generateSteps(request.status)
        };

        setDossierStatus(mappedStatus);
      } catch (err) {
        console.error("Error fetching dossier status:", err);
        setError(
          err instanceof Error ? err.message : "A apărut o eroare necunoscută"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDossierStatus();
    }
  }, [id]);

  const getRequestTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
      'building_permit': 'Autorizație de Construire',
      'urbanism_certificate': 'Certificat de Urbanism',
      'demolition_permit': 'Autorizație de Demolare',
      'other': 'Altă cerere'
    };
    return types[type] || type;
  };

  const mapStatusToStepId = (status: string): number => {
    const statusMap: Record<string, number> = {
      'draft': 1,
      'pending_validation': 2,
      'in_review': 3,
      'approved': 5,
      'rejected': 5
    };
    return statusMap[status] || 1;
  };

  const generateSteps = (currentStatus: string): DossierStep[] => {
    const steps: DossierStep[] = [
      { id: 1, label: 'Depunere cerere', status: 'done' },
      { id: 2, label: 'Validare documente', status: 'pending' },
      { id: 3, label: 'Evaluare tehnică', status: 'pending' },
      { id: 4, label: 'Aprobare comisie', status: 'pending' },
      { id: 5, label: 'Finalizare', status: 'pending' }
    ];

    const currentStepId = mapStatusToStepId(currentStatus);

    steps.forEach((step, index) => {
      if (step.id < currentStepId) {
        step.status = 'done';
      } else if (step.id === currentStepId) {
        step.status = currentStatus === 'approved' ? 'done' : 'in_progress';
      }
    });

    return steps;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ro-RO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getCurrentStepLabel = () => {
    if (!dossierStatus) return "";
    const currentStep = dossierStatus.steps.find(
      (step) => step.id === dossierStatus.current_step
    );
    return currentStep?.label || "";
  };

  if (isLoading) {
    return (
      <CitizenPageLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Se încarcă statusul dosarului...</p>
          </div>
        </div>
      </CitizenPageLayout>
    );
  }

  if (error || !dossierStatus) {
    return (
      <CitizenPageLayout>
        <div className="min-h-screen bg-white">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold text-purple-700">Status dosar</h1>
            </div>
          </header>
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error || "Dosarul nu a fost găsit"}
              </h2>
              <p className="text-gray-600 mb-6">
                Nu am putut găsi informații despre dosarul cu numărul {id}.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/citizen')}
                  className="rounded-lg bg-purple-50 px-6 py-3 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Înapoi la dashboard
                </button>
                <Link
                  href="/citizen/requests"
                  className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors inline-block"
                >
                  Vezi toate dosarele
                </Link>
              </div>
            </div>
          </main>
        </div>
      </CitizenPageLayout>
    );
  }

  return (
    <CitizenPageLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-purple-700">
                  Status dosar
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Urmărește progresul cererii tale
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/chat"
                  className="rounded-lg bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  Chat
                </Link>
                <Link
                  href="/citizen/requests"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  Dosarele mele
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dossier Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {dossierStatus.type}
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    În procesare
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Număr dosar:</span>{" "}
                    <span className="font-mono">{dossierStatus.dossier_id}</span>
                  </p>
                  <p>
                    <span className="font-medium">Data depunerii:</span>{" "}
                    {formatDate(dossierStatus.submitted_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Reîmprospătează"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">
                    Etapa curentă
                  </p>
                  <p className="text-base font-bold text-purple-700">
                    {getCurrentStepLabel()}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <StatusTimeline
              steps={dossierStatus.steps}
              currentStep={dossierStatus.current_step}
            />

            {/* Documents Section */}
            {documents.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Documente încărcate ({documents.length})
                </h3>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.file_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.document_type_ai || 'Document'} • {new Date(doc.uploaded_at).toLocaleDateString('ro-RO')}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {doc.validation_status === 'approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Aprobat
                          </span>
                        )}
                        {doc.validation_status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⏳ În așteptare
                          </span>
                        )}
                        {doc.validation_status === 'rejected' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ✗ Respins
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ai întrebări despre dosarul tău?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Dacă ai nevoie de informații suplimentare sau clarificări despre
                  starea dosarului, te poți adresa la registratura primăriei sau ne
                  poți contacta prin chat.
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  <span>Deschide chat-ul</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </CitizenPageLayout>
  );
}
