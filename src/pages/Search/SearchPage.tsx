import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Hash, GraduationCap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [serialId, setSerialId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialId.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alumni_registrations')
        .select('serial_id')
        .eq('serial_id', serialId.trim().toUpperCase())
        .single();

      if (error || !data) {
        alert('Alumni registration not found. Please check the serial ID and try again.');
        return;
      }

      navigate(`/print/${data.serial_id}`);
    } catch (err) {
      console.error('Search error:', err);
      alert('Alumni registration not found. Please check the serial ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Search Alumni Records</h1>
        <p className="text-gray-600 text-lg">Enter your serial member ID to retrieve your registration</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Hash className="h-4 w-4 mr-2 text-blue-600" />
              Serial Member ID
            </label>
            <input
              type="text"
              value={serialId}
              onChange={(e) => setSerialId(e.target.value.toUpperCase())}
              placeholder="Enter your 8-character serial ID..."
              maxLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-lg tracking-wider"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: ABC12345
            </p>
          </div>

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full"
            icon={Search}
          >
            Search Registration
          </Button>
        </form>
      </Card>

      <div className="mt-8 text-center">
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
                Your serial ID was provided after submitting your alumni registration. It's an 8-character code containing letters and numbers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SearchPage;