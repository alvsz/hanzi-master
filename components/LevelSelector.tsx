
import React from 'react';
import { HSKSystem } from '../types';

interface LevelSelectorProps {
  selectedSystem: HSKSystem;
  setSelectedSystem: (sys: HSKSystem) => void;
  selectedLevel: number;
  setSelectedLevel: (level: number) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  selectedSystem, 
  setSelectedSystem, 
  selectedLevel, 
  setSelectedLevel 
}) => {
  const levels = selectedSystem === HSKSystem.NEW ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Study System</label>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { setSelectedSystem(HSKSystem.NEW); setSelectedLevel(1); }}
            className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${
              selectedSystem === HSKSystem.NEW 
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'border-slate-100 text-slate-500 hover:border-slate-300'
            }`}
          >
            <i className="fas fa-star mr-2"></i> New HSK (1-9)
          </button>
          <button 
            onClick={() => { setSelectedSystem(HSKSystem.OLD); setSelectedLevel(1); }}
            className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${
              selectedSystem === HSKSystem.OLD 
                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' 
                : 'border-slate-100 text-slate-500 hover:border-slate-300'
            }`}
          >
            <i className="fas fa-history mr-2"></i> Old HSK (1-6)
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Target Level</label>
          <span className="text-sm font-medium text-slate-400">Cumulative learning enabled</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${
                selectedLevel === lvl
                  ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500 italic">
          * Selecting level {selectedLevel} will include all characters from levels 1 through {selectedLevel}.
        </p>
      </div>
    </div>
  );
};

export default LevelSelector;
