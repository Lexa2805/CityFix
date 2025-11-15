'use client'
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AutoLogout() {
  useEffect(() => {
    // Funcție care se execută când utilizatorul închide tab-ul/fereastra
    const handleBeforeUnload = async () => {
      await supabase.auth.signOut()
    }

    // Adaugă event listener pentru închiderea paginii
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup: elimină event listener când componenta se demontează
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Componenta nu renderează nimic vizibil
  return null
}
