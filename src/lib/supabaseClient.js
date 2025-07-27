import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mmjcseoaujzpgrcfogml.supabase.co'  // Ganti dengan URL Supabase kamu
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tamNzZW9hdWp6cGdyY2ZvZ21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTgyMzcsImV4cCI6MjA2ODMzNDIzN30.sRNh8OgyVtMbjXlF01Hv3T3yhsc7cpFzHnog3ZAJqok'        // Ganti dengan anon/public key Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
