'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import { createRequest, getRequestTypes, RequestType } from '../../../lib/requestService'
import { uploadDocument, isValidFileType, isValidFileSize, formatFileSize } from '../../../lib/documentService'

export default function NewRequestPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Tip cerere, 2: Detalii, 3: Documente
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Form data
    const [requestType, setRequestType] = useState<RequestType>('certificat_urbanism')
    const [description, setDescription] = useState('')
    const [address, setAddress] = useState('')
    const [cadastralNumber, setCadastralNumber] = useState('')
    
    // Documents
    const [files, setFiles] = useState<File[]>([])
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
    
    const requestTypes = getRequestTypes()

    const handleNext = () => {
        if (step === 1 && !requestType) {
            setError('Te rugăm să selectezi tipul cererii.')
            return
        }
        if (step === 2 && !address.trim()) {
            setError('Adresa este obligatorie.')
            return
        }
        setError(null)
        setStep(step + 1)
    }

    const handleBack = () => {
        setError(null)
        setStep(step - 1)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const validFiles: File[] = []
        const errors: string[] = []

        selectedFiles.forEach(file => {
            if (!isValidFileType(file)) {
                errors.push(`${file.name}: Tip fișier invalid. Acceptăm doar PDF, JPG, PNG, DOC, DOCX.`)
            } else if (!isValidFileSize(file)) {
                errors.push(`${file.name}: Fișierul depășește 10MB.`)
            } else {
                validFiles.push(file)
            }
        })

        if (errors.length > 0) {
            setError(errors.join('\n'))
        } else {
            setError(null)
        }

        setFiles([...files, ...validFiles])
    }

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            // 1. Creează cererea
            console.log('Creating request...')
            const request = await createRequest({
                request_type: requestType,
                metadata: {
                    description,
                    address,
                    cadastral_number: cadastralNumber
                }
            })

            console.log('Request created:', request.id)

            // 2. Upload documentele
            if (files.length > 0) {
                console.log('Uploading documents...')
                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
                    
                    try {
                        await uploadDocument({
                            requestId: request.id,
                            file
                        })
                        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
                    } catch (uploadError) {
                        console.error(`Error uploading ${file.name}:`, uploadError)
                        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }))
                    }
                }
            }

            // 3. Redirect la lista de cereri
            console.log('Request submitted successfully!')
            router.push('/citizen/requests')
            
        } catch (err: any) {
            console.error('Error submitting request:', err)
            setError(err.message || 'A apărut o eroare la salvarea cererii.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout role="citizen">
            <div className="max-w-3xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                                        ${step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {s}
                                    </div>
                                    <span className={`text-xs mt-2 ${step >= s ? 'text-purple-600' : 'text-gray-500'}`}>
                                        {s === 1 && 'Tip cerere'}
                                        {s === 2 && 'Detalii'}
                                        {s === 3 && 'Documente'}
                                    </span>
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-semibold text-purple-700 mb-6">
                        Cerere Nouă de Urbanism
                    </h1>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Tip Cerere */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-3">
                                    Selectează tipul cererii <span className="text-purple-600">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {requestTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setRequestType(type.value as RequestType)}
                                            className={`p-4 border-2 rounded-lg text-left transition-all
                                                ${requestType === type.value
                                                    ? 'border-purple-600 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-800">{type.label}</span>
                                                {requestType === type.value && (
                                                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Detalii */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">
                                    Adresa imobilului <span className="text-purple-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="ex: Str. Exemplu nr. 123, București"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white
                                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">
                                    Număr cadastral (opțional)
                                </label>
                                <input
                                    type="text"
                                    value={cadastralNumber}
                                    onChange={(e) => setCadastralNumber(e.target.value)}
                                    placeholder="ex: 123456"
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white
                                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-2">
                                    Descriere cerere (opțional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descrie pe scurt ce vrei să construiești/modifici..."
                                    rows={4}
                                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-white
                                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documente */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-purple-700 mb-3">
                                    Încarcă documentele necesare
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="file-upload"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-medium text-purple-600">Click pentru a selecta fișiere</span> sau trage aici
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF, JPG, PNG, DOC până la 10MB
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {/* Lista fișiere */}
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700">Fișiere selectate:</h3>
                                    {files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
                            >
                                ← Înapoi
                            </button>
                        ) : (
                            <button
                                onClick={() => router.push('/citizen')}
                                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-700"
                            >
                                Anulează
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Continuă →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Se trimite...
                                    </>
                                ) : (
                                    'Trimite cererea'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
