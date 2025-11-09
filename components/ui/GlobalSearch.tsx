

import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { SearchIcon, CaseIcon, UsersIcon } from '../icons/IconComponents';

const GlobalSearch: React.FC = () => {
  const { cases, technicians } = useData();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ cases: any[], technicians: any[] }>({ cases: [], technicians: [] });
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      let filteredCases = [];
      let filteredTechnicians = [];
      
      if (user?.role === 'technician') {
          const techProfile = technicians.find(t => t.userId === user.id);
          if (techProfile) {
              filteredCases = cases.filter(c => c.technicianId === techProfile.id && c.caseName.toLowerCase().includes(query.toLowerCase()));
          }
          // Technicians cannot search for other technicians
          filteredTechnicians = [];
      } else { // Admin search
          filteredCases = cases.filter(c => c.caseName.toLowerCase().includes(query.toLowerCase()));
          filteredTechnicians = technicians.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
      }
      
      setResults({ cases: filteredCases, technicians: filteredTechnicians });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, cases, technicians, user]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={user?.role === 'technician' ? "Search my cases..." : "Search cases, technicians..."}
          className="w-full md:w-80 pl-10 pr-4 py-2 text-sm border border-transparent rounded-lg bg-white/5 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-glow transition-all"
        />
      </div>
      {isOpen && (results.cases.length > 0 || results.technicians.length > 0) && (
        <div className="absolute mt-2 w-full md:w-96 rounded-xl shadow-lg bg-surface-elevated/80 backdrop-blur-xl border border-border-color z-10">
          <div className="max-h-80 overflow-y-auto">
            {results.cases.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-semibold text-text-tertiary px-4 py-2">Cases</h3>
                <ul>
                  {results.cases.slice(0, 5).map(c => (
                    <li key={c.id}>
                      <Link to={`/${user?.role}/cases/${c.id}`} onClick={handleLinkClick} className="flex items-center px-4 py-2 text-sm hover:bg-white/5">
                        <CaseIcon className="w-4 h-4 mr-3" />
                        {c.caseName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.technicians.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-semibold text-text-tertiary px-4 py-2 border-t border-border-color">Technicians</h3>
                <ul>
                  {results.technicians.slice(0, 5).map(t => (
                    <li key={t.id}>
                      <Link to={`/admin/technicians/${t.id}`} onClick={handleLinkClick} className="flex items-center px-4 py-2 text-sm hover:bg-white/5">
                         <UsersIcon className="w-4 h-4 mr-3" />
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
