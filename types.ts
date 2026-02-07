
export interface Transcription {
  pinyin: string;
  numeric: string;
  wadegiles: string;
  bopomofo: string;
  romatzyh: string;
}

export interface WordForm {
  traditional: string;
  transcriptions: Transcription;
  meanings: string[];
  classifiers: string[];
}

export interface HanziData {
  simplified: string;
  radical: string;
  level: string[];
  frequency: number;
  pos: string[];
  forms: WordForm[];
}

export enum HSKSystem {
  NEW = 'new',
  OLD = 'old'
}

export interface SRSItem {
  simplified: string;
  nextReview: number; // timestamp
  interval: number; // in days
  ease: number;
  reviewsCount: number;
}

export type SRSDataMap = Record<string, SRSItem>;

export interface StudyStats {
  mastered: string[];
  learning: string[];
}
