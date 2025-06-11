import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Calendar, Hash, User, Phone, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AlumniRegistration } from '../../types/database';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PrintView: React.FC = () => {
  const { serialId } = useParams<{ serialId: string }>();
  const [record, setRecord] = useState<AlumniRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!serialId) return;

      try {
        const { data, error } = await supabase
          .from('alumni_registrations')
          .select('*')
          .eq('serial_id', serialId)
          .single();

        if (error) throw error;
        setRecord(data);
      } catch (err) {
        setError('Record not found');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [serialId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg\" text="Loading record..." />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Record Not Found</h2>
          <p className="text-gray-600 mb-6">The requested alumni registration could not be found.</p>
          <Link to="/">
            <Button icon={ArrowLeft}>Back to Registration</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="no-print flex justify-between items-center mb-6">
        <Link to="/">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Registration
          </Button>
        </Link>
        <Button onClick={handlePrint} icon={Printer}>
          Print Registration
        </Button>
      </div>

      <Card className="print:shadow-none print:border-none">
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
              <GraduationCap className="h-8 w-8 text-white" />
              <img src="logo.jpg" alt="logo" width="75" height="100">
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">Alumni Association Registration</h1>
              <p className="text-gray-600">Geography and Environment Department</p>
              <p className="text-gray-600">Chittagong College, Chattogram</p>
            </div>
          </div>
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-mono text-lg">
            <Hash className="h-5 w-5 mr-2" />
            {record.serial_id}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Section */}
          {record.photo_url && (
            <div className="lg:col-span-1">
              <div className="text-center">
                <img
                  src={record.photo_url}
                  alt="Alumni Photo"
                  className="w-48 h-48 object-cover rounded-lg border-4 border-gray-200 mx-auto"
                />
              </div>
            </div>
          )}

          {/* Main Information */}
          <div className={`${record.photo_url ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-8`}>
            {/* Personal Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Full Name:</span>
                  <p className="text-gray-900 font-medium">{record.full_name}</p>
                </div>
                {record.date_of_birth && (
                  <div>
                    <span className="font-medium text-gray-500">Date of Birth:</span>
                    <p className="text-gray-900">{new Date(record.date_of_birth).toLocaleDateString()}</p>
                  </div>
                )}
                {record.gender && (
                  <div>
                    <span className="font-medium text-gray-500">Gender:</span>
                    <p className="text-gray-900">{record.gender}</p>
                  </div>
                )}
                {record.blood_group && (
                  <div>
                    <span className="font-medium text-gray-500">Blood Group:</span>
                    <p className="text-gray-900">{record.blood_group}</p>
                  </div>
                )}
                {record.mobile_number && (
                  <div>
                    <span className="font-medium text-gray-500">Mobile:</span>
                    <p className="text-gray-900">{record.mobile_number}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-500">Email:</span>
                  <p className="text-gray-900">{record.email_address}</p>
                </div>
                {record.emergency_contact && (
                  <div>
                    <span className="font-medium text-gray-500">Emergency Contact:</span>
                    <p className="text-gray-900">{record.emergency_contact} ({record.emergency_relation})</p>
                  </div>
                )}
              </div>
              
              {(record.current_address || record.permanent_address) && (
                <div className="mt-4 space-y-3">
                  {record.current_address && (
                    <div>
                      <span className="font-medium text-gray-500">Current Address:</span>
                      <p className="text-gray-900 text-sm">{record.current_address}</p>
                    </div>
                  )}
                  {record.permanent_address && (
                    <div>
                      <span className="font-medium text-gray-500">Permanent Address:</span>
                      <p className="text-gray-900 text-sm">{record.permanent_address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Academic Background */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                Academic Background
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {record.registree_status && (
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    <p className="text-gray-900">{record.registree_status}</p>
                  </div>
                )}
                {record.student_id && (
                  <div>
                    <span className="font-medium text-gray-500">Student ID:</span>
                    <p className="text-gray-900">{record.student_id}</p>
                  </div>
                )}
                {record.session && (
                  <div>
                    <span className="font-medium text-gray-500">Session:</span>
                    <p className="text-gray-900">{record.session}</p>
                  </div>
                )}
                {record.batch_no && (
                  <div>
                    <span className="font-medium text-gray-500">Batch No:</span>
                    <p className="text-gray-900">{record.batch_no}</p>
                  </div>
                )}
                {record.program_degree && (
                  <div>
                    <span className="font-medium text-gray-500">Program/Degree:</span>
                    <p className="text-gray-900">{record.program_degree}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            {(record.current_occupation || record.organization_name || record.designation_position) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {record.current_occupation && (
                    <div>
                      <span className="font-medium text-gray-500">Occupation:</span>
                      <p className="text-gray-900">{record.current_occupation}</p>
                    </div>
                  )}
                  {record.organization_name && (
                    <div>
                      <span className="font-medium text-gray-500">Organization:</span>
                      <p className="text-gray-900">{record.organization_name}</p>
                    </div>
                  )}
                  {record.designation_position && (
                    <div>
                      <span className="font-medium text-gray-500">Position:</span>
                      <p className="text-gray-900">{record.designation_position}</p>
                    </div>
                  )}
                  {record.professional_email && (
                    <div>
                      <span className="font-medium text-gray-500">Professional Email:</span>
                      <p className="text-gray-900">{record.professional_email}</p>
                    </div>
                  )}
                </div>
                {record.work_address && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-500">Work Address:</span>
                    <p className="text-gray-900 text-sm">{record.work_address}</p>
                  </div>
                )}
              </div>
            )}

            {/* Engagement Information */}
            {(record.interested_in_activities || record.areas_of_interest?.length) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <User className="h-5 w-5 mr-2 text-red-600" />
                  Association Engagement
                </h2>
                <div className="text-sm">
                  <div className="mb-3">
                    <span className="font-medium text-gray-500">Interested in Activities:</span>
                    <p className="text-gray-900">{record.interested_in_activities ? 'Yes' : 'No'}</p>
                  </div>
                  {record.areas_of_interest && record.areas_of_interest.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-500">Areas of Interest:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {record.areas_of_interest.map((area, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {record.suggestions_messages && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
                  Additional Information
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 text-sm whitespace-pre-wrap">{record.suggestions_messages}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Registered: {new Date(record.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Hash className="h-4 w-4 mr-1" />
              <span>ID: {record.serial_id}</span>
            </div>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintView;