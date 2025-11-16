-- =====================================================
-- System Settings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email notifications
  email_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_for_new_requests BOOLEAN DEFAULT true,
  email_notifications_for_urgent_deadlines BOOLEAN DEFAULT true,
  email_reminder_days_before_deadline INTEGER DEFAULT 3 CHECK (email_reminder_days_before_deadline >= 1 AND email_reminder_days_before_deadline <= 30),

  -- AI settings
  ai_auto_validation_enabled BOOLEAN DEFAULT true,
  ai_confidence_threshold NUMERIC DEFAULT 0.85 CHECK (ai_confidence_threshold >= 0.5 AND ai_confidence_threshold <= 1.0),
  ai_auto_assignment_enabled BOOLEAN DEFAULT false,

  -- System settings
  legal_deadline_default_days INTEGER DEFAULT 30 CHECK (legal_deadline_default_days >= 1 AND legal_deadline_default_days <= 365),
  max_file_upload_size_mb INTEGER DEFAULT 10 CHECK (max_file_upload_size_mb >= 1 AND max_file_upload_size_mb <= 100),
  require_gdpr_consent BOOLEAN DEFAULT true,

  -- Backup
  auto_backup_enabled BOOLEAN DEFAULT true,
  backup_frequency_days INTEGER DEFAULT 7 CHECK (backup_frequency_days >= 1 AND backup_frequency_days <= 30),

  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings (only one row should exist)
INSERT INTO public.system_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON public.system_settings(updated_at);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read settings
CREATE POLICY "Admins can read system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can update settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update timestamp
CREATE TRIGGER update_system_settings_timestamp
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION update_system_settings_timestamp();
