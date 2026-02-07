
import React, { useState, useEffect, useRef } from 'react';
import { HanziData, SRSItem } from '../types';

declare var HanziWriter: any;

interface FlashcardProps {
  word: HanziData;
  srsItem?: SRSItem;
  onRate: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
  onNext: () => void;
  onPrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  word, 
  srsItem,
  onRate, 
  onNext, 
  onPrev,
  hasPrev,
  hasNext
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [useTraditional, setUseTraditional] = useState(false);
  const strokeRef = useRef<HTMLDivElement>(null);
  const writersRef = useRef<any[]>([]);

  // Clear writers and flip state on word change
  useEffect(() => {
    setIsFlipped(false);
    writersRef.current = [];
  }, [word.simplified]);

  // Handle HanziWriter animation
  useEffect(() => {
    if (isFlipped && strokeRef.current) {
      // Clear previous
      strokeRef.current.innerHTML = '';
      writersRef.current = [];

      const chars = word.simplified.split('');
      chars.forEach((char, index) => {
        const charContainer = document.createElement('div');
        charContainer.id = `stroke-${word.simplified}-${index}`;
        charContainer.className = "inline-block mx-1 bg-white rounded-lg shadow-sm border border-slate-100 p-1";
        strokeRef.current?.appendChild(charContainer);

        const writer = HanziWriter.create(charContainer.id, char, {
          width: 80,
          height: 80,
          padding: 5,
          strokeColor: '#4f46e5', // indigo-600
          outlineColor: '#f1f5f9', // slate-100
          radicalColor: '#f59e0b', // amber-500
          showOutline: true,
          delayBetweenStrokes: 150
        });
        
        writersRef.current.push(writer);
        writer.animateCharacter();
      });
    }
  }, [isFlipped, word.simplified]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'ArrowRight':
          if (hasNext && !isFlipped) onNext();
          break;
        case 'ArrowLeft':
          if (hasPrev && !isFlipped) onPrev();
          break;
        case 'Digit1':
        case 'Numpad1':
          if (isFlipped) onRate('again');
          break;
        case 'Digit2':
        case 'Numpad2':
          if (isFlipped) onRate('hard');
          break;
        case 'Digit3':
        case 'Numpad3':
          if (isFlipped) onRate('good');
          break;
        case 'Digit4':
        case 'Numpad4':
          if (isFlipped) onRate('easy');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, hasNext, hasPrev, onNext, onPrev, onRate]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Card Container */}
      <div 
        className="w-full h-[540px] card-flip-container cursor-pointer relative"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`card-flip-inner shadow-xl rounded-3xl w-full h-full ${isFlipped ? 'is-flipped' : ''}`}>
          
          {/* Front Face */}
          <div className={`card-face bg-white border border-slate-100 flex flex-col items-center justify-center p-8 transition-opacity duration-300 ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              {word.level.map(l => (
                <span key={l} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {l}
                </span>
              ))}
              {srsItem && srsItem.interval > 0 && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                  {Math.floor(srsItem.interval)}d
                </span>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-9xl font-bold mb-8 text-slate-800 transition-transform hover:scale-110 duration-500">
                {useTraditional ? word.forms[0].traditional : word.simplified}
              </span>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Click or Space to flip
              </p>
            </div>
            
            {!isFlipped && (
              <button 
                onClick={(e) => { e.stopPropagation(); setUseTraditional(!useTraditional); }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black px-4 py-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-tighter shadow-sm border border-slate-100"
              >
                {useTraditional ? 'Show Simplified' : 'Show Traditional'}
              </button>
            )}
          </div>

          {/* Back Face (Answer) */}
          <div className={`card-face card-back bg-slate-50 border border-slate-200 flex flex-col transition-opacity duration-300 ${!isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
             <div className="w-full h-full overflow-y-auto custom-scrollbar p-6 space-y-6">
                
                {/* Header Info */}
                <div className="text-center">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pronunciation & Stroke Order</div>
                   
                   {/* Stroke Order Animation Container */}
                   <div 
                    ref={strokeRef}
                    className="flex justify-center items-center mb-6 min-h-[90px] animate-fadeIn"
                   ></div>

                   <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-widest">
                        Radical: {word.radical}
                      </span>
                      {word.pos.map(p => (
                        <span key={p} className="px-3 py-1 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-widest">
                          {p}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Iterate over all forms */}
                {word.forms.map((form, fIdx) => (
                  <div key={fIdx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    {word.forms.length > 1 && (
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
                              {/* Fixed Bullet Alignment */}
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
             </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="w-full relative z-20 min-h-[96px]">
        {isFlipped ? (
          <div className="grid grid-cols-4 gap-3 animate-fadeIn">
            <button 
              onClick={(e) => { e.stopPropagation(); onRate('again'); }}
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-white border-2 border-rose-100 text-rose-500 font-bold hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm active:scale-95"
            >
              <span className="text-sm">Again</span>
              <span className="text-[9px] text-rose-300 font-black uppercase">1 [1m]</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRate('hard'); }}
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-white border-2 border-orange-100 text-orange-500 font-bold hover:bg-orange-50 hover:border-orange-200 transition-all shadow-sm active:scale-95"
            >
              <span className="text-sm">Hard</span>
              <span className="text-[9px] text-orange-300 font-black uppercase">2 [1d]</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRate('good'); }}
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
            >
              <span className="text-sm">Good</span>
              <span className="text-[9px] text-indigo-300 font-black uppercase">3 [3d]</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRate('easy'); }}
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-2xl bg-white border-2 border-emerald-100 text-emerald-600 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm active:scale-95"
            >
              <span className="text-sm">Easy</span>
              <span className="text-[9px] text-emerald-300 font-black uppercase">4 [7d]</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 w-full h-[72px]">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              disabled={!hasPrev}
              title="Left Arrow"
              className="p-4 rounded-2xl bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:hover:text-slate-400 active:scale-95 h-full min-w-[64px]"
            >
              <i className="fas fa-arrow-left text-lg"></i>
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
              className="flex-1 py-4 px-8 rounded-2xl font-black text-lg bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 h-full uppercase tracking-widest"
            >
              Show Answer [Space]
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              disabled={!hasNext}
              title="Right Arrow"
              className="p-4 rounded-2xl bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:hover:text-slate-400 active:scale-95 h-full min-w-[64px]"
            >
              <i className="fas fa-arrow-right text-lg"></i>
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        <p>1-4: Rate • Space: Flip • Arrows: Navigate</p>
      </div>
    </div>
  );
};

export default Flashcard;
