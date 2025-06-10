/*
  # Alumni Association Registration Database Schema

  1. New Tables
    - `alumni_registrations`
      - `id` (uuid, primary key)
      - `serial_id` (text, unique identifier for searching)
      - `full_name` (text)
      - `date_of_birth` (date)
      - `gender` (text)
      - `mobile_number` (text)
      - `email_address` (text)
      - `blood_group` (text)
      - `emergency_contact` (text)
      - `emergency_relation` (text)
      - `current_address` (text)
      - `permanent_address` (text)
      - `registree_status` (text)
      - `student_id` (text)
      - `session` (text)
      - `batch_no` (text)
      - `program_degree` (text)
      - `current_occupation` (text)
      - `organization_name` (text)
      - `designation_position` (text)
      - `work_address` (text)
      - `professional_email` (text)
      - `interested_in_activities` (boolean)
      - `areas_of_interest` (text[])
      - `suggestions_messages` (text)
      - `photo_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `alumni_registrations` table
    - Add policy for public read access (for search functionality)
    - Add policy for public insert access (for form submission)
    - Add policy for authenticated users to manage all records (admin access)
*/

CREATE TABLE IF NOT EXISTS alumni_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  date_of_birth date,
  gender text,
  mobile_number text,
  email_address text,
  blood_group text,
  emergency_contact text,
  emergency_relation text,
  current_address text,
  permanent_address text,
  registree_status text,
  student_id text,
  session text,
  batch_no text,
  program_degree text,
  current_occupation text,
  organization_name text,
  designation_position text,
  work_address text,
  professional_email text,
  interested_in_activities boolean DEFAULT false,
  areas_of_interest text[],
  suggestions_messages text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alumni_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public access to read records (for search functionality)
CREATE POLICY "Public can read alumni registrations"
  ON alumni_registrations
  FOR SELECT
  TO public
  USING (true);

-- Allow public access to insert records (for form submission)
CREATE POLICY "Public can insert alumni registrations"
  ON alumni_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users (admins) to manage all records
CREATE POLICY "Authenticated users can manage all alumni registrations"
  ON alumni_registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster serial_id searches
CREATE INDEX IF NOT EXISTS idx_alumni_registrations_serial_id ON alumni_registrations(serial_id);