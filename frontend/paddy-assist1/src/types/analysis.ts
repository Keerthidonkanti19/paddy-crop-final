export interface AiRecommendations {
  symptoms: string[];
  causes: string[];
  treatment_steps: string[];
  prevention_methods: string[];
}

export interface AnalysisResult {
  predicted_class: string;
  confidence_score: number;
  language: string;
  recommendations: AiRecommendations;
}

export interface HistoryItem {
  id: string;
  image?: string | null;
  predicted_class: string;
  confidence_score: number;
  language: string;
  recommendations?: AiRecommendations;
  timestamp: string;
}

