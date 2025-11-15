'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from '../../components/AuthLayout'
import AuthCard from '../../components/AuthCard'
import TextInput from '../../components/TextInput'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        setError(null)

        if (!email) {
            setError('Te rugăm să introduci adresa de email.')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Format email invalid.')
            return
        }

        setLoading(true)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (resetError) {
                console.error('Password reset error:', resetError)
                setError('A apărut o eroare. Verifică adresa de email și încearcă din nou.')
                setLoading(false)
                return
            }

            setSuccess(true)
        } catch (err) {
            console.error('Unexpected error:', err)
            setError('A apărut o eroare neașteptată. Te rugăm să încerci din nou.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <AuthCard title="Resetare Parolă">
                {/* Buton înapoi */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Înapoi la autentificare
                    </button>
                </div>

                {success ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-green-800 mb-1">
                                        Email trimis cu succes!
                                    </h3>
                                    <p className="text-sm text-green-700">
                                        Am trimis un email la <strong>{email}</strong> cu instrucțiuni pentru resetarea parolei.
                                    </p>
                                    <p className="text-sm text-green-700 mt-2">
                                        Verifică inbox-ul (și folderul spam) și urmează link-ul din email pentru a-ți reseta parola.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/login')}
                            className="w-full inline-flex justify-center items-center rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
                        >
                            Înapoi la autentificare
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                Introdu adresa ta de email și îți vom trimite un link pentru resetarea parolei.
                            </p>
                        </div>

                        <TextInput
                            id="email"
                            label="Email"
                            value={email}
                            onChange={setEmail}
                            placeholder="nume@exemplu.ro"
                            autoComplete="email"
                            error={error}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center items-center rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Se trimite...
                                </>
                            ) : (
                                'Trimite link de resetare'
                            )}
                        </button>

                        <p className="text-sm text-center text-gray-600">
                            Ți-ai amintit parola?{' '}
                            <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                                Autentifică-te
                            </a>
                        </p>
                    </form>
                )}
            </AuthCard>
        </AuthLayout>
    )
}
