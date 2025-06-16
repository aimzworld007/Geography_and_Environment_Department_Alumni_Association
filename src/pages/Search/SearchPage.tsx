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
                        onClick={() => {
                          const printWindow = window.open(`/print/${searchResult.serial_id}`, '_blank');
                          if (printWindow) {
                            printWindow.onload = () => printWindow.print();
                          }
                        }}
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