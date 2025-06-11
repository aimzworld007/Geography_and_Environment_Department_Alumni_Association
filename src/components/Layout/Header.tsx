import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Search, UserCheck, FileText } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-200">
 <img src="https://raw.githubusercontent.com/aimzworld007/Geography_and_Environment_Department_Alumni_Association/refs/heads/main/img/logo.png" height="50" width="50" />

              
            </div>
            <span className="text-xl font-bold text-gray-900">Geography Alumni Association </span>
          </Link>

          <nav className="flex space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                isActive('/')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Submit Data</span>
            </Link>
            <Link
              to="/search"
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                isActive('/search')
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                isActive('/admin') || location.pathname.startsWith('/admin')
                  ? 'bg-indigo-100 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;