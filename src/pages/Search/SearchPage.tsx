import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hash, GraduationCap, User, Phone, Mail, Eye, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AlumniRegistration } from '../../types/database';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [serialId, setSerialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<AlumniRegistration | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialId.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    setSearchResult(null);

    try {
      const { data, error } = await supabase
        .from('alumni_registrations')
        .select('*')
        .eq('serial_id', serialId.trim())
        .single();

      if (error || !data) {
        setSearchResult(null);
        return;
      }

      setSearchResult(data);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSerialId('');
    setSearchResult(null);
    setSearchPerformed(false);
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Search Alumni Records</h1>
        <p className="text-gray-600 text-lg">Enter your serial member ID to retrieve your registration</p>
      </div>

      <Card className="mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 mr-2 text-blue-600" />
              Serial Member ID
            </label>
            <input
              type="text"
              value={serialId}
              onChange={(e) => setSerialId(e.target.value)}
              placeholder="Enter your serial ID..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-lg tracking-wider"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: 12345678
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="flex-1"
              icon={Search}
            >
              Search Registration
            </Button>
            {(searchResult || searchPerformed) && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={clearSearch}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Search Results */}
      {searchPerformed && (
        <div>
          {searchResult ? (
            <Card>
              <div className="flex items-start space-x-6">
                {/* Photo Section */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center">
                    {searchResult.photo_url ? (
                      <img
                        src={searchResult.photo_url}
                        alt="Alumni Photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<div class="text-gray-400 text-center p-2 flex items-center justify-center h-full"><div><div class="w-8 h-8 mx-auto mb-1 text-gray-300"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div><div class="text-xs">No Photo</div></div></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center p-2 flex items-center justify-center h-full">
                        <div>
                          <User className="h-8 w-8 mx-auto mb-1" />
                          <div className="text-xs">No Photo</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Information Section */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{searchResult.full_name}</h2>
                      <div className="flex items-center space-x-1 mb-2">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-bold text-blue-700 text-lg">{searchResult.serial_id}</span>
                      </div>
                      {searchResult.registree_status && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          searchResult.registree_status === 'Former Student' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {searchResult.registree_status}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => navigate(`/print/${searchResult.serial_id}`)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Printer}
                        onClick={() => printRecord(searchResult)}
                      >
                        Print
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-green-600" />
                        Contact Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-900">{searchResult.email_address}</span>
                        </div>
                        {searchResult.mobile_number && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <span className="text-gray-900">{searchResult.mobile_number}</span>
                          </div>
                        )}
                        {searchResult.gender && (
                          <div className="text-gray-600">
                            <span className="font-medium">Gender:</span> {searchResult.gender}
                          </div>
                        )}
                        {searchResult.blood_group && (
                          <div className="text-gray-600">
                            <span className="font-medium">Blood Group:</span> {searchResult.blood_group}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                        Academic Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        {searchResult.student_id && (
                          <div className="text-gray-600">
                            <span className="font-medium">Student ID:</span> {searchResult.student_id}
                          </div>
                        )}
                        {searchResult.session && (
                          <div className="text-gray-600">
                            <span className="font-medium">Session:</span> {searchResult.session}
                          </div>
                        )}
                        {searchResult.batch_no && (
                          <div className="text-gray-600">
                            <span className="font-medium">Batch:</span> {searchResult.batch_no}
                          </div>
                        )}
                        {searchResult.program_degree && (
                          <div className="text-gray-600">
                            <span className="font-medium">Degree:</span> {searchResult.program_degree}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Information */}
                    {(searchResult.current_occupation || searchResult.organization_name) && (
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {searchResult.current_occupation && (
                            <div className="text-gray-600">
                              <span className="font-medium">Occupation:</span> {searchResult.current_occupation}
                            </div>
                          )}
                          {searchResult.organization_name && (
                            <div className="text-gray-600">
                              <span className="font-medium">Organization:</span> {searchResult.organization_name}
                            </div>
                          )}
                          {searchResult.designation_position && (
                            <div className="text-gray-600">
                              <span className="font-medium">Position:</span> {searchResult.designation_position}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Engagement Status */}
                  {searchResult.interested_in_activities && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Interested in Alumni Activities
                      </span>
                    </div>
                  )}

                  {/* Registration Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Registered on: {new Date(searchResult.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-8">
              <div className="text-red-600 mb-4">
                <Search className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">No Record Found</h3>
              </div>
              <p className="text-gray-600 mb-4">
                No alumni registration found with serial ID: <span className="font-mono font-bold">{serialId}</span>
              </p>
              <p className="text-gray-500 text-sm">
                Please check the serial ID and try again, or contact the alumni association for assistance.
              </p>
            </Card>
          )}
        </div>
      )}

      {!searchPerformed && (
        <div className="text-center">
          <Card padding="sm" className="bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Hash className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Need Help?</h3>
                <p className="text-sm text-blue-700">
                  Your serial ID was provided after submitting your alumni registration. It's a numeric code containing only numbers.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchPage;