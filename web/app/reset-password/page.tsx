'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import AuthLayout from '../../components/AuthLayout'
import AuthCard from '../../components/AuthCard'
import PasswordInput from '../../components/PasswordInput'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [validSession, setValidSession] = useState(false)

    useEffect(() => {
        // Verifică dacă utilizatorul are o sesiune validă (vine din link-ul de reset)
        checkSession()
    }, [])

    const checkSession = async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
            setErrors({ general: 'Link-ul de resetare a expirat sau este invalid. Te rugăm să soliciți un nou link.' })
            setValidSession(false)
            return
        }

        setValidSession(true)
    }

    const validate = (): boolean => {
        const e: { password?: string; confirmPassword?: string } = {}

        if (!password) {
            e.password = 'Parola este obligatorie.'
        } else if (password.length < 8) {
            e.password = 'Parola trebuie să aibă cel puțin 8 caractere.'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            e.password = 'Parola trebuie să conțină cel puțin o literă mare, o literă mică și o cifră.'
        }

        if (!confirmPassword) {
            e.confirmPassword = 'Confirmarea parolei este obligatorie.'
        } else if (password !== confirmPassword) {
            e.confirmPassword = 'Parolele nu se potrivesc.'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault()
        setErrors({})

        if (!validate()) return

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('Password update error:', error)
                setErrors({ general: error.message || 'A apărut o eroare la resetarea parolei.' })
                setLoading(false)
                return
            }

            setSuccess(true)
            
            // Redirecționează către login după 3 secunde
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err) {
            console.error('Unexpected error:', err)
            setErrors({ general: 'A apărut o eroare neașteptată. Te rugăm să încerci din nou.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout>
            <AuthCard title="Setează Parolă Nouă">
                {!validSession && errors.general ? (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                        <button
                            onClick={() => router.push('/forgot-password')}
                            className="w-full inline-flex justify-center items-center rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-purple-700 transition-all"
                        >
                            Solicită un nou link de resetare
                        </button>
                    </div>
                ) : success ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-green-800 mb-1">
                                        Parolă resetată cu succes!
                                    </h3>
                                    <p className="text-sm text-green-700">
                                        Parola ta a fost actualizată. Vei fi redirecționat către pagina de autentificare în câteva secunde...
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/login')}
                            className="w-full inline-flex justify-center items-center rounded-lg bg-purple-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-purple-700 transition-all"
                        >
                            Autentifică-te acum
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800">
                                Alege o parolă nouă pentru contul tău. Parola trebuie să aibă cel puțin 8 caractere și să conțină litere mari, litere mici și cifre.
                            </p>
                        </div>

                        <PasswordInput
                            id="password"
                            label="Parolă Nouă"
                            value={password}
                            onChange={setPassword}
                            placeholder="Cel puțin 8 caractere"
                            autoComplete="new-password"
                            error={errors.password ?? null}
                            required
                        />

                        <PasswordInput
                            id="confirmPassword"
                            label="Confirmă Parola"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="Introdu din nou parola"
                            autoComplete="new-password"
                            error={errors.confirmPassword ?? null}
                            required
                        />

                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{errors.general}</p>
                            </div>
                        )}

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
                                    Se actualizează...
                                </>
                            ) : (
                                'Resetează Parola'
                            )}
                        </button>
                    </form>
                )}
            </AuthCard>
        </AuthLayout>
    )
}
