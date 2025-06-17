import { createClient } from '@supabase/supabase-js'
const url = "https://mkoiswzigibhylmtkzdh.supabase.co";
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rb2lzd3ppZ2liaHlsbXRremRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2MjE3NzgsImV4cCI6MjA2MzE5Nzc3OH0.cYGkooDws3gZlgfjjyBXVg0yzA6mPC7Kp7StwHy6XHE'
export const supabase = createClient(url, key)