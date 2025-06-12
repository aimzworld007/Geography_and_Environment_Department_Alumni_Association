const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createProjectZip() {
  console.log('Creating comprehensive project zip...');
  
  const output = fs.createWriteStream('alumni-association-complete-backup.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', function() {
    console.log(`✅ Backup created successfully!`);
    console.log(`📦 Total size: ${archive.pointer()} bytes`);
    console.log(`📁 File: alumni-association-complete-backup.zip`);
    console.log(`\n🎯 This backup contains:`);
    console.log(`   • Complete source code`);
    console.log(`   • Database schema and migrations`);
    console.log(`   • Configuration files`);
    console.log(`   • Documentation`);
    console.log(`   • Deployment settings`);
  });

  archive.on('error', function(err) {
    console.error('❌ Error creating zip:', err);
    throw err;
  });

  archive.pipe(output);

  // Add all source files
  const filesToInclude = [
    // Root configuration files
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'eslint.config.js',
    'index.html',
    'README.md',
    
    // Source code
    'src/main.tsx',
    'src/App.tsx',
    'src/index.css',
    'src/vite-env.d.ts',
    
    // Components
    'src/components/Layout/Layout.tsx',
    'src/components/Layout/Header.tsx',
    'src/components/UI/Button.tsx',
    'src/components/UI/Card.tsx',
    'src/components/UI/LoadingSpinner.tsx',
    
    // Pages
    'src/pages/Submit/SubmitForm.tsx',
    'src/pages/Search/SearchPage.tsx',
    'src/pages/Print/PrintView.tsx',
    'src/pages/Admin/AdminLogin.tsx',
    'src/pages/Admin/AdminDashboard.tsx',
    
    // Utilities and types
    'src/lib/supabase.ts',
    'src/types/database.ts',
    'src/utils/serialGenerator.ts',
    
    // Database migrations
    'supabase/migrations/20250610174256_golden_shadow.sql'
  ];

  // Add each file to the archive
  filesToInclude.forEach(file => {
    if (fs.existsSync(file)) {
      archive.file(file, { name: file });
    }
  });

  // Add database documentation
  const dbDocumentation = {
    schema: {
      "name": "public",
      "tables": [{
        "name": "alumni_registrations",
        "description": "Main table for storing alumni registration data",
        "columns": [
          {"name": "id", "type": "uuid", "description": "Primary key"},
          {"name": "serial_id", "type": "text", "description": "Unique 8-character identifier for searching"},
          {"name": "full_name", "type": "text", "description": "Alumni full name"},
          {"name": "date_of_birth", "type": "date", "description": "Date of birth"},
          {"name": "gender", "type": "text", "description": "Gender (Male/Female)"},
          {"name": "mobile_number", "type": "text", "description": "Mobile phone number"},
          {"name": "email_address", "type": "text", "description": "Primary email address"},
          {"name": "blood_group", "type": "text", "description": "Blood group (A+, B+, etc.)"},
          {"name": "emergency_contact", "type": "text", "description": "Emergency contact number"},
          {"name": "emergency_relation", "type": "text", "description": "Relationship to emergency contact"},
          {"name": "current_address", "type": "text", "description": "Current residential address"},
          {"name": "permanent_address", "type": "text", "description": "Permanent address"},
          {"name": "registree_status", "type": "text", "description": "Former Student or Current Student"},
          {"name": "student_id", "type": "text", "description": "College student ID"},
          {"name": "session", "type": "text", "description": "Academic session (e.g., 2020-21)"},
          {"name": "batch_no", "type": "text", "description": "Batch number"},
          {"name": "program_degree", "type": "text", "description": "B.Sc., M.Sc., or Other"},
          {"name": "current_occupation", "type": "text", "description": "Current job/occupation"},
          {"name": "organization_name", "type": "text", "description": "Current employer"},
          {"name": "designation_position", "type": "text", "description": "Job title/position"},
          {"name": "work_address", "type": "text", "description": "Work place address"},
          {"name": "professional_email", "type": "text", "description": "Work email address"},
          {"name": "interested_in_activities", "type": "boolean", "description": "Interest in alumni activities"},
          {"name": "areas_of_interest", "type": "text[]", "description": "Array of interest areas"},
          {"name": "suggestions_messages", "type": "text", "description": "Additional messages/suggestions"},
          {"name": "photo_url", "type": "text", "description": "URL to uploaded photo"},
          {"name": "created_at", "type": "timestamptz", "description": "Record creation timestamp"},
          {"name": "updated_at", "type": "timestamptz", "description": "Last update timestamp"}
        ],
        "security": {
          "rls_enabled": true,
          "policies": [
            "Public read access for search functionality",
            "Public insert access for form submissions", 
            "Authenticated full access for admin management"
          ]
        }
      }]
    },
    setup_instructions: {
      "database": [
        "1. Create new Supabase project",
        "2. Run migration SQL in Supabase SQL editor",
        "3. Configure storage bucket named 'photos' for image uploads",
        "4. Set up authentication (email/password)",
        "5. Get project URL and anon key for environment variables"
      ],
      "deployment": [
        "1. Clone/extract project files",
        "2. Run 'npm install' to install dependencies",
        "3. Create .env file with Supabase credentials",
        "4. Run 'npm run dev' for development",
        "5. Run 'npm run build' for production build",
        "6. Deploy to Netlify, Vercel, or similar platform"
      ]
    }
  };

  archive.append(JSON.stringify(dbDocumentation, null, 2), { name: 'database/complete-schema.json' });

  // Add project documentation
  const projectReadme = `# Alumni Association Management System

## 🎓 Geography and Environment Department - Chittagong College

A comprehensive web-based system for managing alumni registrations, built with modern technologies.

### ✨ Features
- **Registration Form**: Complete alumni registration with photo upload
- **Search System**: Find registrations by serial ID
- **Admin Dashboard**: Manage all registrations with full CRUD operations
- **Print/Export**: Generate printable registration cards
- **Responsive Design**: Works on all devices
- **Secure**: Row-level security with Supabase

### 🛠️ Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Deployment**: Netlify

### 🚀 Quick Start
1. Extract this backup
2. Install dependencies: \`npm install\`
3. Set up Supabase project and run migrations
4. Configure environment variables
5. Start development: \`npm run dev\`

### 📁 Project Structure
\`\`\`
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components
│   └── UI/             # Basic UI elements
├── pages/              # Page components
│   ├── Submit/         # Registration form
│   ├── Search/         # Search functionality
│   ├── Print/          # Print view
│   └── Admin/          # Admin dashboard
├── lib/                # External service configs
├── types/              # TypeScript definitions
└── utils/              # Utility functions
\`\`\`

### 🔧 Environment Variables
\`\`\`
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 📊 Database Schema
See \`database/\` folder for complete schema documentation and migration files.

### 🎨 Design Features
- Modern, clean interface
- Consistent color scheme and typography
- Smooth animations and transitions
- Mobile-responsive design
- Print-optimized layouts

### 🔐 Security
- Row Level Security (RLS) enabled
- Public access for form submissions and searches
- Admin authentication required for management
- Input validation and sanitization

### 📝 License
This project is created for educational purposes for Chittagong College.
`;

  archive.append(projectReadme, { name: 'README.md' });

  // Add environment template
  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Instructions:
# 1. Create a new Supabase project at https://supabase.com
# 2. Go to Settings > API in your Supabase dashboard
# 3. Copy the Project URL and paste it as VITE_SUPABASE_URL
# 4. Copy the anon/public key and paste it as VITE_SUPABASE_ANON_KEY
# 5. Rename this file to .env
`;

  archive.append(envTemplate, { name: '.env.example' });

  // Finalize the archive
  await archive.finalize();
}

createProjectZip().catch(console.error);