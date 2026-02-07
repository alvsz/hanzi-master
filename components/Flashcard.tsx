
import React, { useState, useEffect } from 'react';
import { HanziData, SRSItem } from '../types';

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

  const primaryForm = word.forms[0];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* 
        Card Container with fixed height. 
      */}
      <div 
        className="w-full h-[480px] card-flip-container cursor-pointer relative"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`card-flip-inner shadow-xl rounded-3xl w-full h-full ${isFlipped ? 'is-flipped' : ''}`}>
          
          {/* Front Face - Only visible when not flipped */}
          <div className={`card-face bg-white border border-slate-100 flex flex-col items-center justify-center p-8 transition-opacity duration-300 ${isFlipped ? 'opacity-0 invisible' : 'opacity-100'}`}>
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
                {useTraditional ? primaryForm.traditional : word.simplified}
              </span>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                Press Space to flip
              </p>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setUseTraditional(!useTraditional); }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black px-4 py-2 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-tighter shadow-sm border border-slate-100"
            >
              {useTraditional ? 'Use Simplified' : 'Use Traditional'}
            </button>
          </div>

          {/* Back Face (Answer) - Only visible when flipped */}
          <div className={`card-face card-back bg-indigo-50 border border-indigo-100 flex flex-col transition-opacity duration-300 ${!isFlipped ? 'opacity-0 invisible' : 'opacity-100'}`}>
             <div className="w-full h-full overflow-y-auto custom-scrollbar p-8 flex flex-col items-center">
                <div className="mb-6 text-center w-full shrink-0">
                  <h3 className="text-5xl font-black text-indigo-900 mb-2">{primaryForm.transcriptions.pinyin}</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                    {word.pos.map(p => (
                       <span key={p} className="text-indigo-600 text-[10px] uppercase tracking-widest font-black bg-white border border-indigo-100 px-2.5 py-1 rounded-lg shadow-sm">
                         {p}
                       </span>
                    ))}
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black bg-white border border-slate-100 px-2.5 py-1 rounded-lg shadow-sm">
                      Radical: {word.radical}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 w-full text-left">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-50 pb-1">Meanings</h4>
                    <ul className="text-slate-700 font-medium text-base space-y-3">
                      {primaryForm.meanings.map((m, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-indigo-500 font-black mt-1.5 text-[10px]">●</span>
                          <span className="leading-tight">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {primaryForm.classifiers && primaryForm.classifiers.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white shadow-sm">
                      <h4 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-50 pb-1">Measure Words</h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {primaryForm.classifiers.map(c => (
                          <span key={c} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-100 shadow-sm">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              className="flex-1 py-4 px-8 rounded-2xl font-black text-lg bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 h-full"
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

      <div className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <p>1-4: Rate • Space: Flip • Arrows: Navigate</p>
      </div>
    </div>
  );
};

export default Flashcard;
