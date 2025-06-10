import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Phone, Mail, MapPin, GraduationCap, Briefcase, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { generateSerialId } from '../../utils/serialGenerator';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const SubmitForm: React.FC = () => {
  const navigate = useNavigate();
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

  const areasOfInterestOptions = [
    'Mentorship Programs',
    'Event Planning and Coordination',
    'Career Development Support',
    'Research Collaboration',
    'Fundraising Initiatives',
    'Other'
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.emailAddress) {
      alert('Please fill in the required fields (Full Name and Email Address)');
      return;
    }

    setLoading(true);
    try {
      const serialId = generateSerialId();
      let photoUrl = null;

      if (formData.photoFile) {
        photoUrl = await uploadPhoto(formData.photoFile, serialId);
      }

      const { data, error } = await supabase
        .from('alumni_registrations')
        .insert({
          serial_id: serialId,
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          mobile_number: formData.mobileNumber || null,
          email_address: formData.emailAddress,
          blood_group: formData.bloodGroup || null,
          emergency_contact: formData.emergencyContact || null,
          emergency_relation: formData.emergencyRelation || null,
          current_address: formData.currentAddress || null,
          permanent_address: formData.permanentAddress || null,
          registree_status: formData.registreeStatus || null,
          student_id: formData.studentId || null,
          session: formData.session || null,
          batch_no: formData.batchNo || null,
          program_degree: formData.programDegree || null,
          current_occupation: formData.currentOccupation || null,
          organization_name: formData.organizationName || null,
          designation_position: formData.designationPosition || null,
          work_address: formData.workAddress || null,
          professional_email: formData.professionalEmail || null,
          interested_in_activities: formData.interestedInActivities,
          areas_of_interest: formData.areasOfInterest,
          suggestions_messages: formData.suggestionsMessages || null,
          photo_url: photoUrl
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/print/${serialId}`);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Alumni Association Registration</h1>
        <p className="text-gray-600 text-lg">Geography and Environment Department - Chittagong College</p>
      </div>

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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mr-2"
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
                      className="mr-2"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Relation</label>
                <input
                  type="text"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyRelation: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Address</label>
                <textarea
                  value={formData.currentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                <textarea
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, permanentAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mr-2"
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
                      className="mr-2"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <input
                  type="text"
                  value={formData.session}
                  onChange={(e) => setFormData(prev => ({ ...prev, session: e.target.value }))}
                  placeholder="e.g., 2020-21"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch No.</label>
                <input
                  type="text"
                  value={formData.batchNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNo: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="mr-2"
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
                      className="mr-2"
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
                      className="mr-2"
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
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Company Name</label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation/Position</label>
                <input
                  type="text"
                  value={formData.designationPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, designationPosition: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Email</label>
                <input
                  type="email"
                  value={formData.professionalEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, professionalEmail: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Address</label>
                <textarea
                  value={formData.workAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, workAddress: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
              {photoPreview ? (
                <div className="space-y-3">
                  <img src={photoPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg shadow-sm" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData(prev => ({ ...prev, photoFile: null }));
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
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
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          <div className="pt-4">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full"
            >
              Submit Registration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SubmitForm;