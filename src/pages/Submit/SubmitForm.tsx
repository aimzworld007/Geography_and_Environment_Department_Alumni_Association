import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Phone, Mail, MapPin, GraduationCap, Briefcase, Heart, CheckCircle, AlertCircle } from 'lucide-react';
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
      <div className="text-center mb-8">
          <center>  
          <<img src="https://raw.githubusercontent.com/aimzworld007/Geography_and_Environment_Department_Alumni_Association/refs/heads/main/img/logo.png" height="250" width="250" />

   </center>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Alumni Association Registration Form</h1>
        <p className="text-gray-600 text-lg">Geography and Environment Department - Chittagong College</p>
        
        {/* Database Connection Status */}
        <div className="mt-4 flex items-center justify-center space-x-2">
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
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <Card className="mb-6 bg-green-50 border-green-200">
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
        <Card className="mb-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Submission Error</h3>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    Female
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.emailAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <input
                  type="tel"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Emergency contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Relation</label>
                <input
                  type="text"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyRelation: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="e.g., Father, Mother, Spouse"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                <textarea
                  value={formData.currentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your current address"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your permanent address"
                />
              </div>
            </div>
          </div>

          {/* Academic Background */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
              Academic Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Registree Status</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="registreeStatus"
                      value="Former Student"
                      checked={formData.registreeStatus === 'Former Student'}
                      onChange={(e) => setFormData(prev => ({ ...prev, registreeStatus: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    Former Student
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="registreeStatus"
                      value="Current Student"
                      checked={formData.registreeStatus === 'Current Student'}
                      onChange={(e) => setFormData(prev => ({ ...prev, registreeStatus: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    Current Student
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your student ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <input
                  type="text"
                  value={formData.session}
                  onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                  placeholder="e.g., 2020-21"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch No.</label>
                <input
                  type="text"
                  value={formData.batchNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNo: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your batch number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Program/Degree</label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="programDegree"
                      value="B.Sc."
                      checked={formData.programDegree === 'B.Sc.'}
                      onChange={(e) => setFormData(prev => ({ ...prev, programDegree: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    B.Sc.
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="programDegree"
                      value="M.Sc."
                      checked={formData.programDegree === 'M.Sc.'}
                      onChange={(e) => setFormData(prev => ({ ...prev, programDegree: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    M.Sc.
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="programDegree"
                      value="Other"
                      checked={formData.programDegree === 'Other'}
                      onChange={(e) => setFormData(prev => ({ ...prev, programDegree: e.target.value }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    Other
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
              Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Occupation</label>
                <input
                  type="text"
                  value={formData.currentOccupation}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentOccupation: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your current occupation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Company Name</label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation/Position</label>
                <input
                  type="text"
                  value={formData.designationPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, designationPosition: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your designation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Email</label>
                <input
                  type="email"
                  value={formData.professionalEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, professionalEmail: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter professional email"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Address</label>
                <textarea
                  value={formData.workAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, workAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your work address"
                />
              </div>
            </div>
          </div>

          {/* Engagement with Association */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Engagement with the Association
            </h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interestedInActivities}
                    onChange={(e) => setFormData(prev => ({ ...prev, interestedInActivities: e.target.checked }))}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Are you interested in actively participating in alumni activities?
                  </span>
                </label>
              </div>

              {formData.interestedInActivities && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Areas of Interest (select all that apply):
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {areasOfInterestOptions.map((area) => (
                      <label key={area} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.areasOfInterest.includes(area)}
                          onChange={(e) => handleAreasOfInterestChange(area, e.target.checked)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-orange-600" />
              Photo Upload
            </h2>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
              {photoPreview ? (
                <div className="space-y-3">
                  <img src={photoPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg shadow-sm" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photoFile: null }));
                    }}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Click to upload your photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any Suggestions or Messages for the Association:
              </label>
              <textarea
                value={formData.suggestionsMessages}
                onChange={(e) => setFormData(prev => ({ ...prev, suggestionsMessages: e.target.value }))}
                rows={4}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Share your thoughts, suggestions, or messages..."
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Declaration</h2>
            <p className="text-sm text-gray-700 mb-4">
              I hereby confirm that the information provided above is true and correct to the best of my knowledge. 
              I agree to be contacted for alumni association activities and communications.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex space-x-4">
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
      </Card>
    </div>
  );
};

export default SubmitForm;