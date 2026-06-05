import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://jyhszqnzomzaaqtbgicm.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aHN6cW56b216YWFxdGJnaWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODI4MzgsImV4cCI6MjA5NDY1ODgzOH0.kZmHZcZ8qCqsADBPQI-yGqjIGEgtTmspjaQusRAwQH8"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)