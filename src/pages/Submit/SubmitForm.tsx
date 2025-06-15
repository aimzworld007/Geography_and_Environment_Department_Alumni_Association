import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Phone, Mail, MapPin, GraduationCap, Briefcase, Heart, CheckCircle, AlertCircle, Camera, X } from 'lucide-react';
import { supabase, testConnection } from '../../lib/supabase';
import { generateSerialId } from '../../utils/serialGenerator';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const SubmitForm: React.FC = () => {
  const navigate = useNavigate();
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    emailAddress: '',
    bloodGroup: '',
    emergencyContact: '',
    emergencyRelation: '',
    currentAddress: '',
    permanentAddress: '',
    registreeStatus: '',
    studentId: '',
    session: '',
    batchNo: '',
    programDegree: '',
    currentOccupation: '',
    organizationName: '',
    designationPosition: '',
    workAddress: '',
    professionalEmail: '',
    interestedInActivities: false,
    areasOfInterest: [] as string[],
    suggestionsMessages: '',
    photoFile: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const areasOfInterestOptions = [
    'Mentorship Programs',
    'Event Planning and Coordination',
    'Career Development Support',
    'Research Collaboration',
    'Fundraising Initiatives',
    'Other'
  ];

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    const connected = await testConnection();
    setDbConnected(connected);
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

      setFormData(prev => ({ ...prev, photoFile: file }));
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photoFile: null }));
  };

  const handleAreasOfInterestChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      areasOfInterest: checked
        ? [...prev.areasOfInterest, area]
        : prev.areasOfInterest.filter(item => item !== area)
    }));
  };

  const uploadPhoto = async (file: File, serialId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${serialId}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
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

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage('Full Name is required');
      return false;
    }
    
    if (!formData.emailAddress.trim()) {
      setErrorMessage('Email Address is required');
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    // Validate mobile number if provided
    if (formData.mobileNumber && formData.mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid mobile number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setErrorMessage('');
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    if (!dbConnected) {
      setErrorMessage('Database connection not available. Please check your Supabase configuration.');
      setSubmitStatus('error');
      return;
    }

    setLoading(true);
    
    try {
      const serialId = generateSerialId();
      let photoUrl = null;

      // Upload photo if provided
      if (formData.photoFile) {
        photoUrl = await uploadPhoto(formData.photoFile, serialId);
        if (!photoUrl) {
          console.warn('Photo upload failed, continuing without photo');
        }
      }

      // Prepare data for insertion
      const insertData = {
        serial_id: serialId,
        full_name: formData.fullName.trim(),
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        mobile_number: formData.mobileNumber.trim() || null,
        email_address: formData.emailAddress.trim(),
        blood_group: formData.bloodGroup || null,
        emergency_contact: formData.emergencyContact.trim() || null,
        emergency_relation: formData.emergencyRelation.trim() || null,
        current_address: formData.currentAddress.trim() || null,
        permanent_address: formData.permanentAddress.trim() || null,
        registree_status: formData.registreeStatus || null,
        student_id: formData.studentId.trim() || null,
        session: formData.session.trim() || null,
        batch_no: formData.batchNo.trim() || null,
        program_degree: formData.programDegree || null,
        current_occupation: formData.currentOccupation.trim() || null,
        organization_name: formData.organizationName.trim() || null,
        designation_position: formData.designationPosition.trim() || null,
        work_address: formData.workAddress.trim() || null,
        professional_email: formData.professionalEmail.trim() || null,
        interested_in_activities: formData.interestedInActivities,
        areas_of_interest: formData.areasOfInterest.length > 0 ? formData.areasOfInterest : null,
        suggestions_messages: formData.suggestionsMessages.trim() || null,
        photo_url: photoUrl
      };

      const { data, error } = await supabase
        .from('alumni_registrations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database insertion error:', error);
        throw new Error(error.message || 'Failed to save registration');
      }

      setSubmitStatus('success');
      
      // Navigate to print view after a short delay
      setTimeout(() => {
        navigate(`/print/${serialId}`);
      }, 2000);

    } catch (error: any) {
      console.error('Submission error:', error);
      setErrorMessage(error.message || 'Failed to submit registration. Please try again.');
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      dateOfBirth: '',
      gender: '',
      mobileNumber: '',
      emailAddress: '',
      bloodGroup: '',
      emergencyContact: '',
      emergencyRelation: '',
      currentAddress: '',
      permanentAddress: '',
      registreeStatus: '',
      studentId: '',
      session: '',
      batchNo: '',
      programDegree: '',
      currentOccupation: '',
      organizationName: '',
      designationPosition: '',
      workAddress: '',
      professionalEmail: '',
      interestedInActivities: false,
      areasOfInterest: [],
      suggestionsMessages: '',
      photoFile: null
    });
    setPhotoPreview(null);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Database Connection Status */}
      <div className="no-print mb-6 flex items-center justify-center space-x-2">
        {dbConnected === null ? (
          <div className="flex items-center text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
            <span className="text-sm">Checking database connection...</span>
          </div>
        ) : dbConnected ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Database connected</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Database connection failed</span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <Card className="no-print mb-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Registration Successful!</h3>
              <p className="text-green-700">Your alumni registration has been submitted successfully. Redirecting to your registration details...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && errorMessage && (
        <Card className="no-print mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Submission Error</h3>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Form - Exact Format Match */}
      <div className="form-container bg-white p-8 border-2 border-gray-300">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 mr-4 flex-shrink-0">
              <img 
                src="https://raw.githubusercontent.com/aimzworld007/Geography_and_Environment_Department_Alumni_Association/refs/heads/main/img/logo.png" 
                alt="Department Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600 mb-1">Alumni Association of Geography and Environment</h1>
              <h2 className="text-xl font-semibold text-black mb-1">Chittagong College, Chattogram</h2>
              <p className="text-sm text-black">Email: geoenvironment.alumni@gmail.com</p>
              <p className="text-sm text-black">ESTD: 5th May 2025</p>
            </div>
          </div>
          <div className="w-32 h-40 border-2 border-blue-400 flex items-center justify-center bg-blue-50 flex-shrink-0 relative cursor-pointer hover:bg-blue-100 transition-colors">
            {photoPreview ? (
              <div className="relative w-full h-full">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="text-blue-600 text-center text-sm p-2">
                <Camera className="h-8 w-8 mx-auto mb-1" />
                [Photo]
                <br />
                <span className="text-xs">Click to upload</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Form Number and Title */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form No:</span>
          </div>
          <div className="text-center">
            <div className="inline-block bg-purple-600 text-white px-6 py-2 rounded-full">
              <span className="font-semibold">Membership Registration Form</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details Section */}
          <div>
            <h3 className="text-lg font-bold text-red-600 mb-3 underline">Personal Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="w-32 font-medium">Full Name</span>
                <span className="mr-2">:</span>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Date of Birth</span>
                <span className="mr-2">:</span>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Gender</span>
                <span className="mr-2">:</span>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mr-1" 
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="gender" 
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mr-1" 
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Mobile Number</span>
                <span className="mr-2">:</span>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Enter your mobile number"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Email Address</span>
                <span className="mr-2">:</span>
                <input
                  type="email"
                  required
                  value={formData.emailAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                  className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Enter your email address"
                />
                <span className="font-medium">Blood Group:</span>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="ml-2 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 w-20"
                >
                  <option value="">Select</option>
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
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Emergency Contact</span>
                <span className="mr-2">:</span>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Emergency contact number"
                />
                <span className="font-medium">(Relation):</span>
                <input
                  type="text"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyRelation: e.target.value }))}
                  className="ml-2 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 w-24"
                  placeholder="Relation"
                />
              </div>
              
              <div className="flex items-start">
                <span className="w-32 font-medium pt-1">Current Address</span>
                <span className="mr-2 pt-1">:</span>
                <textarea
                  value={formData.currentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                  rows={2}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Enter your current address"
                />
              </div>
              
              <div className="flex items-start">
                <span className="w-32 font-medium pt-1">Permanent Address</span>
                <span className="mr-2 pt-1">:</span>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                  rows={2}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Enter your permanent address"
                />
              </div>
            </div>
          </div>

          {/* Registree Status */}
          <div>
            <div className="flex items-center">
              <span className="font-bold text-blue-600 underline mr-4">Registree Status</span>
              <span className="mr-2">:</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="registreeStatus" 
                    value="Former Student"
                    checked={formData.registreeStatus === 'Former Student'}
                    onChange={(e) => setFormData(prev => ({ ...prev, registreeStatus: e.target.value }))}
                    className="mr-1" 
                  />
                  <span>Former Student</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="registreeStatus" 
                    value="Current Student"
                    checked={formData.registreeStatus === 'Current Student'}
                    onChange={(e) => setFormData(prev => ({ ...prev, registreeStatus: e.target.value }))}
                    className="mr-1" 
                  />
                  <span>Current Student</span>
                </label>
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div>
            <h3 className="font-bold text-blue-600 underline mb-3">Academic Background:</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="w-32 font-medium">Student ID (if available)</span>
                <span className="mr-2">:</span>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Enter your student ID"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Session</span>
                <span className="mr-2">:</span>
                <input
                  type="text"
                  value={formData.session}
                  onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                  className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 2020-21"
                />
                <span className="font-medium">Batch No.:</span>
                <input
                  type="text"
                  value={formData.batchNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNo: e.target.value }))}
                  className="ml-2 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 w-32"
                  placeholder="Batch number"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Program/Degree Completed:</span>
                <div className="flex items-center space-x-4 ml-2">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="programDegree" 
                      value="B.Sc."
                      checked={formData.programDegree === 'B.Sc.'}
                      onChange={(e) => setFormData(prev => ({ ...prev, programDegree: e.target.value }))}
                      className="mr-1" 
                    />
                    <span>B.Sc.</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="programDegree" 
                      value="M.Sc."
                      checked={formData.programDegree === 'M.Sc.'}
                      onChange={(e) => setFormData(prev => ({ ...prev, programDegree: e.target.value }))}
                      className="mr-1" 
                    />
                    <span>M.Sc.</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="programDegree" 
                      value="Other"
                      checked={formData.programDegree === 'Other'}
                      onChange={(e) => setFormData(prev => ({ ...prev, programDegree: e.target.value }))}
                      className="mr-1" 
                    />
                    <span>Other (please specify):</span>
                    <input
                      type="text"
                      disabled={formData.programDegree !== 'Other'}
                      className="ml-2 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 w-32 disabled:opacity-50"
                      placeholder="Specify"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="font-bold text-purple-600 underline mb-3">Professional Information :</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="w-32 font-medium">Current Occupation</span>
                <span className="mr-2">:</span>
                <input
                  type="text"
                  value={formData.currentOccupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentOccupation: e.target.value }))}
                  className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Enter your current occupation"
                />
                <span className="font-medium">Organization/Company Name:</span>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="ml-2 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 w-40"
                  placeholder="Organization name"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Designation/Position</span>
                <span className="mr-2">:</span>
                <input
                  type="text"
                  value={formData.designationPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, designationPosition: e.target.value }))}
                  className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500"
                  placeholder="Enter your designation"
                />
                <span className="font-medium">Work Address:</span>
                <input
                  type="text"
                  value={formData.workAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, workAddress: e.target.value }))}
                  className="ml-2 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 w-40"
                  placeholder="Work address"
                />
              </div>
              
              <div className="flex items-center">
                <span className="w-32 font-medium">Professional Email (if different):</span>
                <input
                  type="email"
                  value={formData.professionalEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, professionalEmail: e.target.value }))}
                  className="flex-1 border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 ml-2"
                  placeholder="Enter professional email"
                />
              </div>
            </div>
          </div>

          {/* Engagement with Association */}
          <div>
            <h3 className="font-bold text-green-600 underline mb-3">Engagement with the Association</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="font-medium">Are you interested in actively participating in alumni activities?</span>
                <div className="flex items-center space-x-4 ml-4">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="interestedInActivities" 
                      value="true"
                      checked={formData.interestedInActivities === true}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestedInActivities: e.target.value === 'true' }))}
                      className="mr-1" 
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="interestedInActivities" 
                      value="false"
                      checked={formData.interestedInActivities === false}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestedInActivities: e.target.value === 'true' }))}
                      className="mr-1" 
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Areas of Interest (please select all that apply):</span>
                <div className="mt-2 space-y-1">
                  {areasOfInterestOptions.map((area) => (
                    <label key={area} className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.areasOfInterest.includes(area)}
                        onChange={(e) => handleAreasOfInterestChange(area, e.target.checked)}
                        className="mr-2" 
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="font-bold text-purple-600 underline mb-3">Additional Information</h3>
            <div className="text-sm">
              <span className="font-medium">Any Suggestions or Messages for the Association:</span>
              <div className="mt-2">
                <textarea
                  value={formData.suggestionsMessages}
                  onChange={(e) => setFormData(prev => ({ ...prev, suggestionsMessages: e.target.value }))}
                  rows={4}
                  className="w-full border-b border-dotted border-gray-400 pb-1 bg-transparent focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Share your thoughts, suggestions, or messages..."
                />
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div>
            <h3 className="font-bold text-blue-600 underline mb-3">Declaration</h3>
            <p className="text-sm mb-4">
              I hereby confirm that the information provided above is true and correct to the best of my knowledge. I agree to be contacted for alumni association activities and communications.
            </p>
            <div className="flex justify-between items-end">
              <div>
                <span className="font-medium">Signature: </span>
                <span className="border-b border-black w-40 inline-block ml-2"> </span>
              </div>
              <div>
                <span className="font-medium">Date: </span>
                <span className="border-b border-dotted border-gray-400 pb-1">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="no-print pt-6 flex space-x-4">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="flex-1"
              disabled={!dbConnected || submitStatus === 'success'}
            >
              {loading ? 'Submitting Registration...' : 'Submit Registration'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={resetForm}
              disabled={loading || submitStatus === 'success'}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .form-container {
            border: 2px solid black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SubmitForm;