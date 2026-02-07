
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HanziData } from '../types';

declare var HanziWriter: any;

interface SearchProps {
  database: HanziData[];
}

const Search: React.FC<SearchProps> = ({ database }) => {
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<HanziData | null>(null);
  const strokeRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return database.filter(item => 
      item.simplified.includes(q) || 
      item.forms.some(f => f.transcriptions.pinyin.toLowerCase().includes(q)) ||
      item.forms.some(f => f.meanings.some(m => m.toLowerCase().includes(q)))
    ).slice(0, 10);
  }, [query, database]);

  useEffect(() => {
    if (selectedWord && strokeRef.current) {
      // Clear previous animations
      strokeRef.current.innerHTML = '';

      const chars = selectedWord.simplified.split('');
      chars.forEach((char, index) => {
        const charContainer = document.createElement('div');
        const containerId = `search-stroke-${selectedWord.simplified}-${index}`;
        charContainer.id = containerId;
        charContainer.className = "inline-block mx-1 bg-white rounded-xl shadow-sm border border-slate-100 p-1";
        strokeRef.current?.appendChild(charContainer);

        const writer = HanziWriter.create(containerId, char, {
          width: 90,
          height: 90,
          padding: 5,
          strokeColor: '#4f46e5', // indigo-600
          outlineColor: '#f1f5f9', // slate-100
          radicalColor: '#f59e0b', // amber-500
          showOutline: true,
          delayBetweenStrokes: 150
        });
        
        writer.animateCharacter();
      });
    }
  }, [selectedWord]);

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
          <div className="bg-slate-50 w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedWord(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-xl z-10"
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="text-center mb-8">
              <div className="mb-6 flex flex-col items-center">
                <div ref={strokeRef} className="flex justify-center items-center mb-4 min-h-[100px] flex-wrap gap-2"></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stroke Animation</div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest">
                  Radical: {selectedWord.radical}
                </span>
                {selectedWord.pos.map(p => (
                  <span key={p} className="px-3 py-1 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-widest">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              {selectedWord.forms.map((form, fIdx) => (
                <div key={fIdx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
                  {selectedWord.forms.length > 1 && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase">
                      Form {fIdx + 1}
                    </div>
                  )}
                  
                  <div className="mb-5">
                    <div className="text-3xl font-black text-indigo-900 mb-1 leading-none">{form.transcriptions.pinyin}</div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                      {form.transcriptions.numeric} • {form.transcriptions.bopomofo}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest border-b border-slate-50 pb-1 flex items-center gap-2">
                        <i className="fas fa-book-open text-[8px]"></i> Meanings
                      </h4>
                      <ul className="text-slate-700 font-medium text-base space-y-3">
                        {form.meanings.map((m, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-indigo-400 font-black text-[8px] h-[1.5rem] flex items-center shrink-0">•</span>
                            <span className="leading-tight pt-[0.1rem]">{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {form.classifiers && form.classifiers.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest border-b border-slate-50 pb-1 flex items-center gap-2">
                          <i className="fas fa-layer-group text-[8px]"></i> Measure Words
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {form.classifiers.map(c => (
                            <span key={c} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100 shadow-sm">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4 flex flex-wrap gap-2 justify-center">
                 {selectedWord.level.map(l => (
                    <span key={l} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                       {l}
                    </span>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
