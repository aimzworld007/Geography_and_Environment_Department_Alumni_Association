export interface DatabaseRecord {
  id: string;
  serial_id: string;
  text_data?: string;
  image_url?: string;
  number_data?: number;
  created_at: string;
  updated_at?: string;
}

export interface AlumniRegistration {
  id: string;
  serial_id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  mobile_number?: string;
  email_address?: string;
  blood_group?: string;
  emergency_contact?: string;
  emergency_relation?: string;
  current_address?: string;
  permanent_address?: string;
  registree_status?: string;
  student_id?: string;
  session?: string;
  batch_no?: string;
  program_degree?: string;
  current_occupation?: string;
  organization_name?: string;
  designation_position?: string;
  work_address?: string;
  professional_email?: string;
  interested_in_activities?: boolean;
  areas_of_interest?: string[];
  suggestions_messages?: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface SearchResult extends DatabaseRecord {}