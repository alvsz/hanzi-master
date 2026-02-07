
import React from 'react';
import { HanziData, SRSDataMap } from '../types';

interface StatsProps {
  studyList: HanziData[];
  srsData: SRSDataMap;
}

const Stats: React.FC<StatsProps> = ({ studyList, srsData }) => {
  const stats = studyList.reduce((acc, item) => {
    const srs = srsData[item.simplified];
    if (!srs) acc.new++;
    else if (srs.interval < 3) acc.learning++;
    else if (srs.interval < 21) acc.reviewing++;
    else acc.mastered++;
    return acc;
  }, { new: 0, learning: 0, reviewing: 0, mastered: 0 });

  const masteredCount = stats.reviewing + stats.mastered;
  const percentage = studyList.length > 0 ? Math.round((masteredCount / studyList.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">New</div>
        <div className="text-2xl font-bold text-slate-800">{stats.new}</div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Learning</div>
        <div className="text-2xl font-bold text-indigo-600">{stats.learning}</div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Reviewing</div>
        <div className="text-2xl font-bold text-amber-600">{stats.reviewing}</div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Mastery</div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-emerald-600">{percentage}%</div>
          <div className="flex-1 bg-slate-100 h-1.5 rounded-full">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
