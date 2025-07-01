import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Edit, Trash2, Eye, Calendar, Hash, User, Phone, Mail, GraduationCap, Download, Printer, Save, X, FileText, Users, CheckSquare, Square, Camera, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AlumniRegistration } from '../../types/database';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<AlumniRegistration | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AlumniRegistration>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchRecords();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin');
      return;
    }
    setUser(user);
  };

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alumni registration?')) return;

    try {
      const { error } = await supabase
        .from('alumni_registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRecords(prev => prev.filter(record => record.id !== id));
      setSelectedRecords(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete registration');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedRecords.size} selected registrations?`)) return;

    try {
      const { error } = await supabase
        .from('alumni_registrations')
        .delete()
        .in('id', Array.from(selectedRecords));

      if (error) throw error;
      
      setRecords(prev => prev.filter(record => !selectedRecords.has(record.id)));
      setSelectedRecords(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete selected registrations');
    }
  };

  const handleSelectRecord = (id: string) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(record => record.id)));
    }
    setSelectAll(!selectAll);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File, serialId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `userimage/${serialId}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Photo upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  const handleEdit = (record: AlumniRegistration) => {
    setEditingRecord(record);
    setEditFormData({
      full_name: record.full_name,
      email_address: record.email_address,
      mobile_number: record.mobile_number,
      gender: record.gender,
      blood_group: record.blood_group,
      current_address: record.current_address,
      permanent_address: record.permanent_address,
      student_id: record.student_id,
      session: record.session,
      batch_no: record.batch_no,
      program_degree: record.program_degree,
      current_occupation: record.current_occupation,
      organization_name: record.organization_name,
      designation_position: record.designation_position,
      work_address: record.work_address,
      professional_email: record.professional_email,
      interested_in_activities: record.interested_in_activities,
      suggestions_messages: record.suggestions_messages,
      photo_url: record.photo_url
    });
    setPhotoPreview(record.photo_url || null);
    setPhotoFile(null);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;

    setUpdateLoading(true);
    try {
      let photoUrl = editFormData.photo_url;

      // Upload new photo if selected
      if (photoFile) {
        setPhotoUploading(true);
        const uploadedUrl = await uploadPhoto(photoFile, editingRecord.serial_id);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
        setPhotoUploading(false);
      }

      const { error } = await supabase
        .from('alumni_registrations')
        .update({
          ...editFormData,
          photo_url: photoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRecord.id);

      if (error) throw error;

      // Update local state
      setRecords(prev => prev.map(record => 
        record.id === editingRecord.id 
          ? { ...record, ...editFormData, photo_url: photoUrl, updated_at: new Date().toISOString() }
          : record
      ));

      setEditingRecord(null);
      setEditFormData({});
      setPhotoFile(null);
      setPhotoPreview(null);
      alert('Registration updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update registration');
    } finally {
      setUpdateLoading(false);
      setPhotoUploading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Serial ID', 'Full Name', 'Email', 'Mobile', 'Gender', 'Blood Group',
      'Student ID', 'Session', 'Batch', 'Degree', 'Occupation', 'Organization',
      'Position', 'Interested in Activities', 'Created At'
    ];

    const csvData = filteredRecords.map(record => [
      record.serial_id,
      record.full_name,
      record.email_address || '',
      record.mobile_number || '',
      record.gender || '',
      record.blood_group || '',
      record.student_id || '',
      record.session || '',
      record.batch_no || '',
      record.program_degree || '',
      record.current_occupation || '',
      record.organization_name || '',
      record.designation_position || '',
      record.interested_in_activities ? 'Yes' : 'No',
      new Date(record.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `alumni_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printRecord = (record: AlumniRegistration) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Alumni Registration - ${record.full_name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .print-form { 
              max-width: 800px; 
              margin: 0 auto; 
              border: 2px solid black; 
              padding: 20px; 
            }
            .header { 
              display: flex; 
              align-items: flex-start; 
              justify-content: space-between; 
              margin-bottom: 20px; 
            }
            .logo-section { 
              display: flex; 
              align-items: center; 
            }
            .logo { 
              width: 80px; 
              height: 80px; 
              margin-right: 15px; 
            }
            .title-section h1 { 
              color: #2563eb; 
              font-size: 24px; 
              margin: 0 0 5px 0; 
              font-weight: bold; 
            }
            .title-section h2 { 
              color: black; 
              font-size: 20px; 
              margin: 0 0 5px 0; 
              font-weight: 600; 
            }
            .title-section p { 
              color: black; 
              font-size: 14px; 
              margin: 2px 0; 
            }
            .photo-section { 
              width: 128px; 
              height: 160px; 
              border: 2px solid #60a5fa; 
              background: #eff6ff; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              overflow: hidden;
            }
            .photo-section img { 
              width: 100%; 
              height: 100%; 
              object-fit: cover; 
            }
            .form-title { 
              text-align: center; 
              margin: 20px 0; 
            }
            .form-title .badge { 
              background: #7c3aed; 
              color: white; 
              padding: 8px 24px; 
              border-radius: 25px; 
              font-weight: 600; 
            }
            .section { 
              margin-bottom: 20px; 
            }
            .section h3 { 
              font-weight: bold; 
              margin-bottom: 10px; 
              text-decoration: underline; 
            }
            .personal { color: #dc2626; }
            .academic { color: #2563eb; }
            .professional { color: #7c3aed; }
            .engagement { color: #059669; }
            .additional { color: #7c3aed; }
            .declaration { color: #2563eb; }
            .field { 
              display: flex; 
              align-items: center; 
              margin: 8px 0; 
              font-size: 14px; 
            }
            .field-label { 
              width: 150px; 
              font-weight: 500; 
            }
            .field-value { 
              flex: 1; 
              border-bottom: 1px dotted #666; 
              padding-bottom: 2px; 
              margin-left: 10px; 
            }
            .checkbox-group { 
              display: flex; 
              gap: 20px; 
              margin-left: 10px; 
            }
            .checkbox-item { 
              display: flex; 
              align-items: center; 
              gap: 5px; 
            }
            .signature-section { 
              display: flex; 
              justify-content: space-between; 
              margin-top: 20px; 
            }
            .signature-line { 
              border-bottom: 1px solid black; 
              width: 200px; 
              display: inline-block; 
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .print-form { border: 2px solid black; }
            }
          </style>
        </head>
        <body>
          <div class="print-form">
            <div class="header">
              <div class="logo-section">
                <img src="https://raw.githubusercontent.com/aimzworld007/Geography_and_Environment_Department_Alumni_Association/refs/heads/main/img/logo.png" alt="Logo" class="logo">
                <div class="title-section">
                  <h1>Alumni Association of Geography and Environment</h1>
                  <h2>Chittagong College, Chattogram</h2>
                  <p>Email: geoenvironment.alumni@gmail.com</p>
                  <p>ESTD: 5th May 2025</p>
                </div>
              </div>
              <div class="photo-section">
                ${record.photo_url 
                  ? `<img src="${record.photo_url}" alt="Alumni Photo" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\"color: #2563eb; text-align: center; font-size: 12px; padding: 10px;\\">Photo Not Available</div>'" />`
                  : '<div style="color: #2563eb; text-align: center; font-size: 12px; padding: 10px;">No Photo</div>'
                }
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <div style="font-size: 14px; margin-bottom: 10px;">Form No: ${record.serial_id}</div>
              <div class="form-title">
                <span class="badge">Membership Registration Form</span>
              </div>
            </div>

            <div class="section">
              <h3 class="personal">Personal Details</h3>
              <div class="field">
                <span class="field-label">Full Name</span>
                <span>:</span>
                <span class="field-value">${record.full_name}</span>
              </div>
              <div class="field">
                <span class="field-label">Date of Birth</span>
                <span>:</span>
                <span class="field-value">${record.date_of_birth ? new Date(record.date_of_birth).toLocaleDateString() : ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Gender</span>
                <span>:</span>
                <div class="checkbox-group">
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.gender === 'Male' ? 'checked' : ''} disabled>
                    <span>Male</span>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.gender === 'Female' ? 'checked' : ''} disabled>
                    <span>Female</span>
                  </div>
                </div>
              </div>
              <div class="field">
                <span class="field-label">Mobile Number</span>
                <span>:</span>
                <span class="field-value">${record.mobile_number || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Email Address</span>
                <span>:</span>
                <span class="field-value" style="flex: 0.6;">${record.email_address}</span>
                <span style="margin-left: 20px; font-weight: 500;">Blood Group:</span>
                <span class="field-value" style="flex: 0.2; margin-left: 10px;">${record.blood_group || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Emergency Contact</span>
                <span>:</span>
                <span class="field-value" style="flex: 0.6;">${record.emergency_contact || ''}</span>
                <span style="margin-left: 20px; font-weight: 500;">(Relation):</span>
                <span class="field-value" style="flex: 0.2; margin-left: 10px;">${record.emergency_relation || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Current Address</span>
                <span>:</span>
                <span class="field-value">${record.current_address || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Permanent Address</span>
                <span>:</span>
                <span class="field-value">${record.permanent_address || ''}</span>
              </div>
            </div>

            <div class="section">
              <div class="field">
                <span style="font-weight: bold; color: #2563eb; text-decoration: underline;">Registree Status</span>
                <span>:</span>
                <div class="checkbox-group">
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.registree_status === 'Former Student' ? 'checked' : ''} disabled>
                    <span>Former Student</span>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.registree_status === 'Current Student' ? 'checked' : ''} disabled>
                    <span>Current Student</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="academic">Academic Background:</h3>
              <div class="field">
                <span class="field-label">Student ID</span>
                <span>:</span>
                <span class="field-value">${record.student_id || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Session</span>
                <span>:</span>
                <span class="field-value" style="flex: 0.6;">${record.session || ''}</span>
                <span style="margin-left: 20px; font-weight: 500;">Batch No.:</span>
                <span class="field-value" style="flex: 0.3; margin-left: 10px;">${record.batch_no || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Program/Degree:</span>
                <div class="checkbox-group">
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.program_degree === 'B.Sc.' ? 'checked' : ''} disabled>
                    <span>B.Sc.</span>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.program_degree === 'M.Sc.' ? 'checked' : ''} disabled>
                    <span>M.Sc.</span>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.program_degree === 'Other' ? 'checked' : ''} disabled>
                    <span>Other: ${record.program_degree && !['B.Sc.', 'M.Sc.'].includes(record.program_degree) ? record.program_degree : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="professional">Professional Information:</h3>
              <div class="field">
                <span class="field-label">Current Occupation</span>
                <span>:</span>
                <span class="field-value" style="flex: 0.5;">${record.current_occupation || ''}</span>
                <span style="margin-left: 20px; font-weight: 500;">Organization:</span>
                <span class="field-value" style="flex: 0.4; margin-left: 10px;">${record.organization_name || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Designation/Position</span>
                <span>:</span>
                <span class="field-value" style="flex: 0.5;">${record.designation_position || ''}</span>
                <span style="margin-left: 20px; font-weight: 500;">Work Address:</span>
                <span class="field-value" style="flex: 0.4; margin-left: 10px;">${record.work_address || ''}</span>
              </div>
              <div class="field">
                <span class="field-label">Professional Email</span>
                <span>:</span>
                <span class="field-value">${record.professional_email || ''}</span>
              </div>
            </div>

            <div class="section">
              <h3 class="engagement">Engagement with the Association</h3>
              <div class="field">
                <span style="font-weight: 500;">Are you interested in actively participating in alumni activities?</span>
                <div class="checkbox-group" style="margin-left: 20px;">
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.interested_in_activities === true ? 'checked' : ''} disabled>
                    <span>Yes</span>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" ${record.interested_in_activities === false ? 'checked' : ''} disabled>
                    <span>No</span>
                  </div>
                </div>
              </div>
              <div style="margin-top: 10px;">
                <span style="font-weight: 500;">Areas of Interest:</span>
                <div style="margin-top: 5px;">
                  ${['Mentorship Programs', 'Event Planning and Coordination', 'Career Development Support', 'Research Collaboration', 'Fundraising Initiatives', 'Other'].map(area => `
                    <div class="checkbox-item" style="margin: 3px 0;">
                      <input type="checkbox" ${record.areas_of_interest?.includes(area) ? 'checked' : ''} disabled>
                      <span>${area}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="section">
              <h3 class="additional">Additional Information</h3>
              <div style="font-weight: 500; margin-bottom: 10px;">Any Suggestions or Messages for the Association:</div>
              <div style="border-bottom: 1px dotted #666; min-height: 60px; padding: 5px;">
                ${record.suggestions_messages || ''}
              </div>
            </div>

            <div class="section">
              <h3 class="declaration">Declaration</h3>
              <p style="font-size: 14px; margin-bottom: 20px;">
                I hereby confirm that the information provided above is true and correct to the best of my knowledge. 
                I agree to be contacted for alumni association activities and communications.
              </p>
              <div class="signature-section">
                <div>
                  <span style="font-weight: 500;">Signature: </span>
                  <span class="signature-line"></span>
                </div>
                <div>
                  <span style="font-weight: 500;">Date: </span>
                  <span style="border-bottom: 1px dotted #666; padding-bottom: 2px;">
                    ${new Date(record.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const printSelectedRecords = () => {
    const recordsToPrint = selectedRecords.size > 0 
      ? filteredRecords.filter(record => selectedRecords.has(record.id))
      : filteredRecords;

    recordsToPrint.forEach((record, index) => {
      setTimeout(() => {
        printRecord(record);
      }, index * 1000);
    });
  };

  const filteredRecords = records.filter(record =>
    record.serial_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.email_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage alumni registrations</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
          <Button onClick={handleLogout} variant="secondary" icon={LogOut} size="sm">
            Logout
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Registrations</p>
              <p className="text-2xl font-bold">{records.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Members</p>
              <p className="text-2xl font-bold">{records.filter(r => r.interested_in_activities).length}</p>
            </div>
            <User className="h-8 w-8 text-green-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Former Students</p>
              <p className="text-2xl font-bold">{records.filter(r => r.registree_status === 'Former Student').length}</p>
            </div>
            <GraduationCap className="h-8 w-8 text-purple-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Selected</p>
              <p className="text-2xl font-bold">{selectedRecords.size}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Search and Export Controls */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 lg:mr-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by serial ID, name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {filteredRecords.length} of {records.length} registrations
            </div>
            {selectedRecords.size > 0 && (
              <Button onClick={handleBulkDelete} variant="danger" size="sm">
                Delete Selected ({selectedRecords.size})
              </Button>
            )}
            <Button onClick={exportToCSV} variant="success" icon={Download} size="sm">
              Export CSV
            </Button>
            <Button onClick={printSelectedRecords} variant="secondary" icon={Printer} size="sm">
              {selectedRecords.size > 0 ? `Print Selected (${selectedRecords.size})` : 'Print All'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Selection Controls */}
      {filteredRecords.length > 0 && (
        <Card className="mb-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredRecords.length} records)
                </span>
              </label>
              {selectedRecords.size > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {selectedRecords.size} selected
                </span>
              )}
            </div>
            
            {selectedRecords.size > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => {
                    setSelectedRecords(new Set());
                    setSelectAll(false);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Edit Registration</h2>
                <button
                  onClick={() => {
                    setEditingRecord(null);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Serial ID: {editingRecord.serial_id}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Photo Upload Section */}
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Photo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-xs">No Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={Upload}
                        className="w-full cursor-pointer"
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                      >
                        Change Photo
                      </Button>
                    </label>
                    {photoPreview && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPhotoPreview(null);
                          setPhotoFile(null);
                          setEditFormData(prev => ({ ...prev, photo_url: null }));
                        }}
                        className="w-full"
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Photo Guidelines</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Maximum file size: 10MB</li>
                    <li>• Supported formats: JPG, PNG, GIF</li>
                    <li>• Recommended size: 300x400 pixels</li>
                    <li>• Clear, professional headshot preferred</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.full_name || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email_address || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email_address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="tel"
                    value={editFormData.mobile_number || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={editFormData.gender || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={editFormData.blood_group || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, blood_group: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={editFormData.student_id || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, student_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                  <input
                    type="text"
                    value={editFormData.session || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, session: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch No</label>
                  <input
                    type="text"
                    value={editFormData.batch_no || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, batch_no: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program/Degree</label>
                  <select
                    value={editFormData.program_degree || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, program_degree: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Degree</option>
                    <option value="B.Sc.">B.Sc.</option>
                    <option value="M.Sc.">M.Sc.</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Occupation</label>
                  <input
                    type="text"
                    value={editFormData.current_occupation || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, current_occupation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    value={editFormData.organization_name || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    value={editFormData.designation_position || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, designation_position: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Email</label>
                  <input
                    type="email"
                    value={editFormData.professional_email || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, professional_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                  <textarea
                    value={editFormData.current_address || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, current_address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                  <textarea
                    value={editFormData.permanent_address || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, permanent_address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Address</label>
                  <textarea
                    value={editFormData.work_address || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, work_address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions/Messages</label>
                  <textarea
                    value={editFormData.suggestions_messages || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, suggestions_messages: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.interested_in_activities || false}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, interested_in_activities: e.target.checked }))}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Interested in actively participating in alumni activities
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setEditingRecord(null);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                variant="secondary"
                icon={X}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                loading={updateLoading || photoUploading}
                icon={Save}
              >
                {photoUploading ? 'Uploading Photo...' : updateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="grid gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Selection Checkbox */}
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    checked={selectedRecords.has(record.id)}
                    onChange={() => handleSelectRecord(record.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {/* Photo and Name Column */}
                <div className="flex flex-col items-center space-y-3 min-w-[140px]">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                    {record.photo_url ? (
                      <img
                        src={record.photo_url}
                        alt="Alumni"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<div class="text-xs text-gray-400 text-center p-2 flex items-center justify-center h-full"><div><div class="w-6 h-6 mx-auto mb-1 text-gray-300"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>No Photo</div></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="text-xs text-gray-400 text-center p-2 flex items-center justify-center h-full">
                        <div>
                          <User className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                          No Photo
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Hash className="h-3 w-3 text-blue-600" />
                      <span className="font-mono font-bold text-blue-700 text-sm">{record.serial_id}</span>
                    </div>
                    <div className="font-medium text-gray-900 text-sm text-center leading-tight">
                      {record.full_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(record.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-900">{record.email_address}</span>
                    </div>
                    {record.mobile_number && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-green-600" />
                        <span className="text-gray-900">{record.mobile_number}</span>
                      </div>
                    )}
                    {record.gender && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Gender:</span> {record.gender}
                      </div>
                    )}
                    {record.blood_group && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Blood:</span> {record.blood_group}
                      </div>
                    )}
                  </div>

                  {/* Academic Info */}
                  <div className="space-y-2">
                    {record.student_id && (
                      <div className="flex items-center space-x-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                        <span className="text-gray-900">ID: {record.student_id}</span>
                      </div>
                    )}
                    {record.session && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Session:</span> {record.session}
                      </div>
                    )}
                    {record.batch_no && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Batch:</span> {record.batch_no}
                      </div>
                    )}
                    {record.program_degree && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Degree:</span> {record.program_degree}
                      </div>
                    )}
                    {record.registree_status && (
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.registree_status === 'Former Student' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {record.registree_status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-2">
                    {record.current_occupation && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Occupation:</span> {record.current_occupation}
                      </div>
                    )}
                    {record.organization_name && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Organization:</span> {record.organization_name}
                      </div>
                    )}
                    {record.designation_position && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Position:</span> {record.designation_position}
                      </div>
                    )}
                    {record.interested_in_activities && (
                      <div className="text-sm">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          Interested in Activities
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Eye}
                  onClick={() => navigate(`/print/${record.serial_id}`)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Printer}
                  onClick={() => printRecord(record)}
                >
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Edit}
                  onClick={() => handleEdit(record)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredRecords.length === 0 && (
          <Card className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No alumni registrations found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;