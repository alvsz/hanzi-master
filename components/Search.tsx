
import React, { useState, useMemo } from 'react';
import { HanziData } from '../types';

interface SearchProps {
  database: HanziData[];
}

const Search: React.FC<SearchProps> = ({ database }) => {
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<HanziData | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return database.filter(item => 
      item.simplified.includes(q) || 
      item.forms[0].transcriptions.pinyin.toLowerCase().includes(q) ||
      item.forms[0].meanings.some(m => m.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [query, database]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by character, pinyin, or meaning..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg"
        />
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto overflow-x-hidden">
          {results.map((word, idx) => (
            <div 
              key={idx}
              onClick={() => { setSelectedWord(word); setQuery(''); }}
              className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-slate-800 w-12 text-center">{word.simplified}</span>
                <div>
                  <div className="font-bold text-indigo-600">{word.forms[0].transcriptions.pinyin}</div>
                  <div className="text-sm text-slate-500 truncate max-w-xs">{word.forms[0].meanings[0]}</div>
                </div>
              </div>
              <div className="flex gap-1">
                {word.level.map(l => (
                  <span key={l} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-400 rounded uppercase">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedWord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedWord(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedWord(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-xl"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="text-center mb-8">
              <span className="text-8xl font-bold text-slate-800">{selectedWord.simplified}</span>
              <div className="mt-4 text-2xl font-bold text-indigo-600">{selectedWord.forms[0].transcriptions.pinyin}</div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meanings</h4>
                <div className="text-slate-700 leading-relaxed font-medium">
                  {selectedWord.forms[0].meanings.join(', ')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Radical</h4>
                  <div className="text-slate-700 font-bold text-xl">{selectedWord.radical}</div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Part of Speech</h4>
                  <div className="text-slate-700 font-bold uppercase text-sm">{selectedWord.pos.join(' / ')}</div>
                </div>
              </div>
              
              {selectedWord.forms[0].classifiers && selectedWord.forms[0].classifiers.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Measure Words</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.forms[0].classifiers.map(c => (
                      <span key={c} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
