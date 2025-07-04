import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a placeholder client when environment variables are not available
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not configured. Please set up your Supabase connection.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('alumni_registrations')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection error:', error);
      return false;
    }
    
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};