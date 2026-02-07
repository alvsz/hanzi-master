
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <span className="text-xl font-bold">汉</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">Hanzi Master</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">HSK Flashcard Suite</p>
          </div>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
            <i className="fab fa-github text-xl"></i>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
