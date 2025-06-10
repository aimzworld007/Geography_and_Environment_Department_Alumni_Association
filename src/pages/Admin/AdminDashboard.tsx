import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Edit, Trash2, Eye, Calendar, Hash, User, Phone, Mail, GraduationCap } from 'lucide-react';
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
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete registration');
    }
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
        <LoadingSpinner size="lg\" text="Loading dashboard..." />
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

      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
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
          <div className="text-sm text-gray-600">
            {filteredRecords.length} of {records.length} registrations
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Photo and Basic Info */}
                <div className="flex items-start space-x-4">
                  {record.photo_url && (
                    <img
                      src={record.photo_url}
                      alt="Alumni"
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-blue-600" />
                      <span className="font-mono font-bold text-blue-700">{record.serial_id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-900">{record.full_name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(record.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

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
            <p className="text-gray-500">No alumni registrations found</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;