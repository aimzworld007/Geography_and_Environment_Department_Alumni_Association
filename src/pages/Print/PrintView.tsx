import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
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
        <LoadingSpinner size="lg" text="Loading record..." />
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

      {/* Print Form - Exact Format Match */}
      <div className="print-form bg-white p-8 border-2 border-gray-300 print:border-black print:shadow-none">
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
          <div className="w-32 h-40 border-2 border-blue-400 flex items-center justify-center bg-blue-50 flex-shrink-0">
            {record.photo_url ? (
              <img
                src={record.photo_url}
                alt="Alumni Photo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="text-blue-600 text-center text-sm p-2">[Photo]</div>';
                }}
              />
            ) : (
              <div className="text-blue-600 text-center text-sm">[Photo]</div>
            )}
          </div>
        </div>

        {/* Form Number and Title */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form No: {record.serial_id}</span>
          </div>
          <div className="text-center">
            <div className="inline-block bg-purple-600 text-white px-6 py-2 rounded-full">
              <span className="font-semibold">Membership Registration Form</span>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-red-600 mb-3 underline">Personal Details</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-32 font-medium">Full Name</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{record.full_name}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Date of Birth</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1">
                {record.date_of_birth ? new Date(record.date_of_birth).toLocaleDateString() : '........../........../......................'}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="w-32 font-medium">Gender</span>
              <span className="mr-2">:</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" checked={record.gender === 'Male'} readOnly className="mr-1" />
                  <span>Male</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.gender === 'Female'} readOnly className="mr-1" />
                  <span>Female</span>
                </label>
              </div>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Mobile Number</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{record.mobile_number || '........................................................................................................................................................'}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Email Address</span>
              <span className="mr-2">:</span>
              <span className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1">{record.email_address}</span>
              <span className="font-medium">Blood Group:</span>
              <span className="ml-2 border-b border-dotted border-gray-400 pb-1 w-20">{record.blood_group || '.............................'}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Emergency Contact</span>
              <span className="mr-2">:</span>
              <span className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1">{record.emergency_contact || '...........................................................................'}</span>
              <span className="font-medium">(Relation):</span>
              <span className="ml-2 border-b border-dotted border-gray-400 pb-1 w-24">{record.emergency_relation || '................................'}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Current Address</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{record.current_address || '........................................................................................................................................................'}</span>
            </div>
            <div className="ml-36 border-b border-dotted border-gray-400 pb-1 text-transparent">.</div>
            
            <div className="flex">
              <span className="w-32 font-medium">Permanent Address</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{record.permanent_address || '........................................................................................................................................................'}</span>
            </div>
            <div className="ml-36 border-b border-dotted border-gray-400 pb-1 text-transparent">.</div>
          </div>
        </div>

        {/* Registree Status */}
        <div className="mb-6">
          <div className="flex items-center">
            <span className="font-bold text-blue-600 underline mr-4">Registree Status</span>
            <span className="mr-2">:</span>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input type="checkbox" checked={record.registree_status === 'Former Student'} readOnly className="mr-1" />
                <span>Former Student</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={record.registree_status === 'Current Student'} readOnly className="mr-1" />
                <span>Current Student</span>
              </label>
            </div>
          </div>
        </div>

        {/* Academic Background */}
        <div className="mb-6">
          <h3 className="font-bold text-blue-600 underline mb-3">Academic Background:</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-32 font-medium">Student ID (if available)</span>
              <span className="mr-2">:</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1">{record.student_id || '........................................................................................................................................................'}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Session</span>
              <span className="mr-2">:</span>
              <span className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1">{record.session || '.....................................................................'}</span>
              <span className="font-medium">Batch No.:</span>
              <span className="ml-2 border-b border-dotted border-gray-400 pb-1 w-32">{record.batch_no || '................................................................'}</span>
            </div>
            
            <div className="flex items-center">
              <span className="w-32 font-medium">Program/Degree Completed:</span>
              <div className="flex items-center space-x-4 ml-2">
                <label className="flex items-center">
                  <input type="checkbox" checked={record.program_degree === 'B.Sc.'} readOnly className="mr-1" />
                  <span>B.Sc.</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.program_degree === 'M.Sc.'} readOnly className="mr-1" />
                  <span>M.Sc.</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.program_degree === 'Other'} readOnly className="mr-1" />
                  <span>Other (please specify):</span>
                  <span className="ml-2 border-b border-dotted border-gray-400 pb-1 w-32">
                    {record.program_degree && !['B.Sc.', 'M.Sc.'].includes(record.program_degree) ? record.program_degree : '....................................................'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="mb-6">
          <h3 className="font-bold text-purple-600 underline mb-3">Professional Information :</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="w-32 font-medium">Current Occupation</span>
              <span className="mr-2">:</span>
              <span className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1">{record.current_occupation || '........................................,'}</span>
              <span className="font-medium">Organization/Company Name:</span>
              <span className="ml-2 border-b border-dotted border-gray-400 pb-1 w-40">{record.organization_name || '............................................................'}</span>
            </div>
            <div className="ml-36 border-b border-dotted border-gray-400 pb-1 text-transparent">.</div>
            
            <div className="flex">
              <span className="w-32 font-medium">Designation/Position</span>
              <span className="mr-2">:</span>
              <span className="flex-1 mr-4 border-b border-dotted border-gray-400 pb-1">{record.designation_position || '..........................................'}</span>
              <span className="font-medium">Work Address:</span>
              <span className="ml-2 border-b border-dotted border-gray-400 pb-1 w-40">{record.work_address || '......................................................................................'}</span>
            </div>
            
            <div className="flex">
              <span className="w-32 font-medium">Professional Email (if different):</span>
              <span className="flex-1 border-b border-dotted border-gray-400 pb-1 ml-2">{record.professional_email || '.............................................................................................................................................'}</span>
            </div>
          </div>
        </div>

        {/* Engagement with Association */}
        <div className="mb-6">
          <h3 className="font-bold text-green-600 underline mb-3">Engagement with the Association</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <span className="font-medium">Are you interested in actively participating in alumni activities?</span>
              <div className="flex items-center space-x-4 ml-4">
                <label className="flex items-center">
                  <input type="checkbox" checked={record.interested_in_activities === true} readOnly className="mr-1" />
                  <span>Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.interested_in_activities === false} readOnly className="mr-1" />
                  <span>No</span>
                </label>
              </div>
            </div>
            
            <div>
              <span className="font-medium">Areas of Interest (please select all that apply):</span>
              <div className="mt-2 space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" checked={record.areas_of_interest?.includes('Mentorship Programs')} readOnly className="mr-2" />
                  <span>Mentorship Programs</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.areas_of_interest?.includes('Event Planning and Coordination')} readOnly className="mr-2" />
                  <span>Event Planning and Coordination</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.areas_of_interest?.includes('Career Development Support')} readOnly className="mr-2" />
                  <span>Career Development Support</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.areas_of_interest?.includes('Research Collaboration')} readOnly className="mr-2" />
                  <span>Research Collaboration</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.areas_of_interest?.includes('Fundraising Initiatives')} readOnly className="mr-2" />
                  <span>Fundraising Initiatives</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={record.areas_of_interest?.includes('Other')} readOnly className="mr-2" />
                  <span>Other (please specify)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-6">
          <h3 className="font-bold text-purple-600 underline mb-3">Additional Information</h3>
          <div className="text-sm">
            <span className="font-medium">Any Suggestions or Messages for the Association:</span>
            <div className="mt-2 space-y-1">
              <div className="border-b border-dotted border-gray-400 pb-1 min-h-[20px]">
                {record.suggestions_messages ? record.suggestions_messages.substring(0, 100) : '................................................................................................................................................................................'}
              </div>
              <div className="border-b border-dotted border-gray-400 pb-1 min-h-[20px]">
                {record.suggestions_messages && record.suggestions_messages.length > 100 ? record.suggestions_messages.substring(100, 200) : '................................................................................................................................................................................................'}
              </div>
              <div className="border-b border-dotted border-gray-400 pb-1 min-h-[20px]">
                {record.suggestions_messages && record.suggestions_messages.length > 200 ? record.suggestions_messages.substring(200) : '................................................................................................................................................................................................'}
              </div>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="mb-8">
          <h3 className="font-bold text-blue-600 underline mb-3">Declaration</h3>
          <p className="text-sm mb-4">
            I hereby confirm that the information provided above is true and correct to the best of my knowledge. I agree to be contacted for alumni association activities and communications.
          </p>
          <div className="flex justify-between items-end">
            <div>
              <span className="font-medium">Signature: </span>
              <span className="border-b border-black w-40 inline-block ml-2">_________________</span>
            </div>
            <div>
              <span className="font-medium">Date: </span>
              <span className="border-b border-dotted border-gray-400 pb-1">
                {new Date(record.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print-form {
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

export default PrintView;