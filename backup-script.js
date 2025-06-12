const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create backup directory structure
const backupDir = './project-backup';
const dbDir = path.join(backupDir, 'database');
const srcDir = path.join(backupDir, 'source-code');

// Ensure directories exist
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

console.log('Creating project backup...');

// Database schema export
const dbSchema = {
  "schema_version": "1.0",
  "created_at": new Date().toISOString(),
  "database_name": "alumni_association",
  "tables": [
    {
      "name": "alumni_registrations",
      "columns": [
        {"name": "id", "type": "uuid", "primary_key": true, "default": "gen_random_uuid()"},
        {"name": "serial_id", "type": "text", "unique": true, "not_null": true},
        {"name": "full_name", "type": "text", "not_null": true},
        {"name": "date_of_birth", "type": "date", "nullable": true},
        {"name": "gender", "type": "text", "nullable": true},
        {"name": "mobile_number", "type": "text", "nullable": true},
        {"name": "email_address", "type": "text", "nullable": true},
        {"name": "blood_group", "type": "text", "nullable": true},
        {"name": "emergency_contact", "type": "text", "nullable": true},
        {"name": "emergency_relation", "type": "text", "nullable": true},
        {"name": "current_address", "type": "text", "nullable": true},
        {"name": "permanent_address", "type": "text", "nullable": true},
        {"name": "registree_status", "type": "text", "nullable": true},
        {"name": "student_id", "type": "text", "nullable": true},
        {"name": "session", "type": "text", "nullable": true},
        {"name": "batch_no", "type": "text", "nullable": true},
        {"name": "program_degree", "type": "text", "nullable": true},
        {"name": "current_occupation", "type": "text", "nullable": true},
        {"name": "organization_name", "type": "text", "nullable": true},
        {"name": "designation_position", "type": "text", "nullable": true},
        {"name": "work_address", "type": "text", "nullable": true},
        {"name": "professional_email", "type": "text", "nullable": true},
        {"name": "interested_in_activities", "type": "boolean", "default": false},
        {"name": "areas_of_interest", "type": "text[]", "nullable": true},
        {"name": "suggestions_messages", "type": "text", "nullable": true},
        {"name": "photo_url", "type": "text", "nullable": true},
        {"name": "created_at", "type": "timestamptz", "default": "now()"},
        {"name": "updated_at", "type": "timestamptz", "default": "now()"}
      ],
      "indexes": [
        {"name": "alumni_registrations_pkey", "type": "PRIMARY KEY", "columns": ["id"]},
        {"name": "alumni_registrations_serial_id_key", "type": "UNIQUE", "columns": ["serial_id"]},
        {"name": "idx_alumni_registrations_serial_id", "type": "INDEX", "columns": ["serial_id"]}
      ],
      "policies": [
        {
          "name": "Public can read alumni registrations",
          "command": "SELECT",
          "role": "public",
          "using": "true"
        },
        {
          "name": "Public can insert alumni registrations", 
          "command": "INSERT",
          "role": "public",
          "with_check": "true"
        },
        {
          "name": "Authenticated users can manage all alumni registrations",
          "command": "ALL",
          "role": "authenticated",
          "using": "true",
          "with_check": "true"
        }
      ],
      "rls_enabled": true
    }
  ]
};

// Write database schema
fs.writeFileSync(path.join(dbDir, 'schema.json'), JSON.stringify(dbSchema, null, 2));

// Copy migration files
const migrationContent = `/*
  # Alumni Association Registration Database Schema

  1. New Tables
    - \`alumni_registrations\`
      - Complete table structure for alumni registration system
      - All personal, academic, and professional information fields
      - Photo upload support with URL storage
      - Areas of interest as array field
      - Timestamps for audit trail

  2. Security
    - Enable RLS on \`alumni_registrations\` table
    - Add policy for public read access (for search functionality)
    - Add policy for public insert access (for form submission)
    - Add policy for authenticated users to manage all records (admin access)

  3. Indexes
    - Primary key on id
    - Unique constraint on serial_id
    - Index on serial_id for fast searches
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
CREATE INDEX IF NOT EXISTS idx_alumni_registrations_serial_id ON alumni_registrations(serial_id);`;

fs.writeFileSync(path.join(dbDir, 'migration.sql'), migrationContent);

// Create README for database
const dbReadme = `# Alumni Association Database

## Overview
This database schema supports a comprehensive alumni registration and management system for the Geography and Environment Department at Chittagong College.

## Tables

### alumni_registrations
Main table storing all alumni registration data including:
- Personal information (name, contact, emergency contacts)
- Academic background (student ID, session, batch, degree)
- Professional information (occupation, organization, position)
- Association engagement preferences
- Photo storage via URL
- Audit timestamps

## Security
- Row Level Security (RLS) enabled
- Public access for reading and inserting (form submissions)
- Authenticated access for full management (admin functions)

## Setup Instructions
1. Create a new Supabase project
2. Run the migration.sql file in the SQL editor
3. Configure storage bucket for photos (optional)
4. Set up authentication for admin access

## Environment Variables Required
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Features Supported
- Alumni registration form
- Search by serial ID
- Admin dashboard for management
- Photo upload capability
- Export/print functionality
`;

fs.writeFileSync(path.join(dbDir, 'README.md'), dbReadme);

console.log('Database backup created successfully!');
console.log('Project backup structure ready!');