'use client'
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AutoLogout() {
  useEffect(() => {
    // Detectează doar închiderea efectivă a tab-ului, nu refresh-ul
    const handleVisibilityChange = async () => {
      // Dacă tab-ul devine hidden și după 2 secunde e încă hidden, deconectează
      if (document.visibilityState === 'hidden') {
        setTimeout(async () => {
          if (document.visibilityState === 'hidden') {
            // Tab-ul este închis sau minimizat pentru mai mult de 2 secunde
            // Nu facem nimic - păstrăm sesiunea activă
          }
        }, 2000)
      }
    }

    // Comentat - nu mai deconectăm automat
    // document.addEventListener('visibilitychange', handleVisibilityChange)

    // return () => {
    //   document.removeEventListener('visibilitychange', handleVisibilityChange)
    // }
  }, [])

  // Componenta nu renderează nimic vizibil
  return null
}
