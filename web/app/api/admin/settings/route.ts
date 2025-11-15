import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SystemSettings {
  email_notifications_enabled: boolean
  email_notifications_for_new_requests: boolean
  email_notifications_for_urgent_deadlines: boolean
  email_reminder_days_before_deadline: number
  ai_auto_validation_enabled: boolean
  ai_confidence_threshold: number
  ai_auto_assignment_enabled: boolean
  legal_deadline_default_days: number
  max_file_upload_size_mb: number
  require_gdpr_consent: boolean
  auto_backup_enabled: boolean
  backup_frequency_days: number
}

// GET - Retrieve current settings
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single()

    if (error) {
      // If no settings exist, return defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          data: {
            email_notifications_enabled: true,
            email_notifications_for_new_requests: true,
            email_notifications_for_urgent_deadlines: true,
            email_reminder_days_before_deadline: 3,
            ai_auto_validation_enabled: true,
            ai_confidence_threshold: 0.85,
            ai_auto_assignment_enabled: false,
            legal_deadline_default_days: 30,
            max_file_upload_size_mb: 10,
            require_gdpr_consent: true,
            auto_backup_enabled: true,
            backup_frequency_days: 7
          }
        })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-au putut încărca setările'
    console.error('Settings load error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Save settings
export async function POST(request: Request) {
  try {
    const settings: SystemSettings = await request.json()

    // Validate settings
    if (settings.ai_confidence_threshold < 0.5 || settings.ai_confidence_threshold > 1) {
      return NextResponse.json(
        { error: 'Pragul de încredere AI trebuie să fie între 0.5 și 1.0' },
        { status: 400 }
      )
    }

    if (settings.email_reminder_days_before_deadline < 1 || settings.email_reminder_days_before_deadline > 30) {
      return NextResponse.json(
        { error: 'Zilele de reminder trebuie să fie între 1 și 30' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from('system_settings')
      .select('id')
      .single()

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('system_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('system_settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    }

    // Log the settings change in activity log
    await supabase.from('activity_log').insert({
      action_type: 'admin_settings_update',
      details: {
        updated_fields: Object.keys(settings),
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Setările au fost salvate cu succes' 
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nu s-au putut salva setările'
    console.error('Settings save error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
