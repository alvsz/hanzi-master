
import React, { useState, useEffect, useMemo } from 'react';
import { HANZI_DATABASE } from './data';
import { HSKSystem, HanziData, SRSDataMap, SRSItem } from './types';
import Header from './components/Header';
import LevelSelector from './components/LevelSelector';
import Flashcard from './components/Flashcard';
import Stats from './components/Stats';
import Search from './components/Search';

const App: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<HSKSystem>(HSKSystem.NEW);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [srsData, setSrsData] = useState<SRSDataMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [sessionList, setSessionList] = useState<HanziData[]>([]);

  // Persistence
  useEffect(() => {
    const savedSRS = localStorage.getItem('hanzi-srs');
    if (savedSRS) setSrsData(JSON.parse(savedSRS));

    const savedSettings = localStorage.getItem('hanzi-settings');
    if (savedSettings) {
      try {
        const { system, level } = JSON.parse(savedSettings);
        setSelectedSystem(system);
        setSelectedLevel(level);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hanzi-srs', JSON.stringify(srsData));
  }, [srsData]);

  useEffect(() => {
    localStorage.setItem('hanzi-settings', JSON.stringify({ system: selectedSystem, level: selectedLevel }));
  }, [selectedSystem, selectedLevel]);

  // SRS Logic
  const updateSRS = (simplified: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const now = Date.now();
    const current = srsData[simplified] || {
      simplified,
      nextReview: 0,
      interval: 0,
      ease: 2.5,
      reviewsCount: 0
    };

    let newInterval: number;
    let newEase = current.ease;

    switch (rating) {
      case 'again':
        newInterval = 0;
        newEase = Math.max(1.3, current.ease - 0.2);
        break;
      case 'hard':
        newInterval = Math.max(1, current.interval * 1.2);
        newEase = Math.max(1.3, current.ease - 0.15);
        break;
      case 'good':
        newInterval = current.interval === 0 ? 1 : current.interval * current.ease;
        break;
      case 'easy':
        newInterval = current.interval === 0 ? 4 : current.interval * current.ease * 1.3;
        newEase = current.ease + 0.15;
        break;
      default:
        newInterval = 1;
    }

    const nextReview = rating === 'again' 
      ? now 
      : now + newInterval * 24 * 60 * 60 * 1000;

    const updatedItem: SRSItem = {
      ...current,
      nextReview,
      interval: newInterval,
      ease: newEase,
      reviewsCount: current.reviewsCount + 1
    };

    setSrsData(prev => ({ ...prev, [simplified]: updatedItem }));
    
    if (rating === 'again') {
      const currentCard = sessionList[currentIndex];
      setSessionList(prev => [...prev, currentCard]);
    }
    
    handleNext();
  };

  const baseList = useMemo(() => {
    return HANZI_DATABASE.filter(item => {
      return item.level.some(l => {
        const [sys, val] = l.split('-');
        const levelNum = parseInt(val);
        return sys === selectedSystem && levelNum <= selectedLevel;
      });
    });
  }, [selectedSystem, selectedLevel]);

  const dueList = useMemo(() => {
    const now = Date.now();
    return baseList.filter(item => {
      const srs = srsData[item.simplified];
      return srs ? srs.nextReview <= now : true;
    }).sort((a, b) => {
      const srsA = srsData[a.simplified];
      const srsB = srsData[b.simplified];
      if (!srsA && srsB) return -1;
      if (srsA && !srsB) return 1;
      return (srsA?.nextReview || 0) - (srsB?.nextReview || 0);
    });
  }, [baseList, srsData]);

  const handleNext = () => {
    if (currentIndex < sessionList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsStudying(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const startStudy = () => {
    if (dueList.length > 0) {
      setSessionList([...dueList]);
      setCurrentIndex(0);
      setIsStudying(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {!isStudying ? (
          <div className="space-y-8 animate-fadeIn">
            <Search database={HANZI_DATABASE} />

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-3">
                <i className="fas fa-graduation-cap text-indigo-600"></i>
                Learning Path
              </h2>
              <LevelSelector 
                selectedSystem={selectedSystem}
                setSelectedSystem={setSelectedSystem}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />
              <div className="mt-8">
                <button 
                  onClick={startStudy}
                  disabled={dueList.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                >
                  <i className="fas fa-play mr-3"></i> 
                  {dueList.length > 0 
                    ? `Start Session (${dueList.length} cards due)` 
                    : "No cards due for review!"}
                </button>
              </div>
            </div>

            <Stats studyList={baseList} srsData={srsData} />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setIsStudying(false)}
                className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors font-black text-sm uppercase tracking-widest"
              >
                <i className="fas fa-chevron-left"></i> Home
              </button>
              <div className="bg-white px-4 py-1 rounded-full border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-tighter">
                Card {currentIndex + 1} / {sessionList.length}
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-10 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentIndex + 1) / sessionList.length) * 100}%` }}
              ></div>
            </div>

            {sessionList[currentIndex] && (
              <Flashcard 
                key={sessionList[currentIndex].simplified}
                word={sessionList[currentIndex]}
                srsItem={srsData[sessionList[currentIndex].simplified]}
                onRate={(rating) => updateSRS(sessionList[currentIndex].simplified, rating)}
                onNext={handleNext}
                onPrev={handlePrev}
                hasPrev={currentIndex > 0}
                hasNext={currentIndex < sessionList.length - 1}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
