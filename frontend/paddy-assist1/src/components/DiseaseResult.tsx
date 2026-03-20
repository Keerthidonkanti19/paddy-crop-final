import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Volume2, VolumeX, AlertTriangle, CheckCircle, Pill, Leaf, Shield } from 'lucide-react';
import { useState } from 'react';
import type { AnalysisResult } from '@/types/analysis';

interface DiseaseResultProps {
  disease: AnalysisResult;
}

export const DiseaseResult = ({ disease }: DiseaseResultProps) => {
  const { t, language } = useLanguage();
  const { speak, stop } = useVoiceAssistant();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const predictedClassLabel = disease.predicted_class.replace(/_/g, ' ');
  const confidencePct = Math.round(disease.confidence_score * 100);
  const isHealthy = disease.predicted_class.toLowerCase().includes('healthy');

  const severityColor = isHealthy
    ? 'bg-green-500/20 text-green-700 border-green-500'
    : confidencePct >= 85
      ? 'bg-red-500/20 text-red-700 border-red-500'
      : confidencePct >= 65
        ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500'
        : 'bg-green-500/20 text-green-700 border-green-500';

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
      setIsSpeaking(false);
    } else {
      const rec = disease.recommendations;
      const symptoms = rec.symptoms.slice(0, 6).join(', ');
      const causes = rec.causes.slice(0, 4).join(', ');
      const treatment = rec.treatment_steps.slice(0, 4).join('. ');
      const prevention = rec.prevention_methods.slice(0, 4).join(', ');

      const text =
        `${t('diseaseDetected')}: ${predictedClassLabel}. ` +
        `Confidence: ${confidencePct} percent. ` +
        `Symptoms: ${symptoms}. ` +
        `Causes: ${causes}. ` +
        `Treatment: ${treatment}. ` +
        `Prevention: ${prevention}.`;
      
      speak(text);
      setIsSpeaking(true);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {isHealthy ? (
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{predictedClassLabel}</CardTitle>
              <Badge className={`mt-1 ${severityColor}`}>
                {t('severity')}: {isHealthy ? 'LOW' : confidencePct >= 85 ? 'HIGH' : confidencePct >= 65 ? 'MEDIUM' : 'LOW'}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSpeak}
            className="gap-2"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {t('speakResult')}
          </Button>
        </div>
        <p className="text-muted-foreground mt-4">
          {language === disease.language
            ? `Confidence score: ${disease.confidence_score.toFixed(4)}`
            : `Confidence score: ${disease.confidence_score.toFixed(4)} (LLM language: ${disease.language})`}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="symptoms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="symptoms" className="gap-2">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="treatment" className="gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Treatment</span>
            </TabsTrigger>
            <TabsTrigger value="prevention" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t('prevention')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="symptoms" className="mt-4">
            <ul className="space-y-2">
              {disease.recommendations.symptoms.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="treatment" className="mt-4">
            <ol className="space-y-2 list-decimal pl-5">
              {disease.recommendations.treatment_steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </TabsContent>
          
          <TabsContent value="prevention" className="mt-4">
            <ul className="space-y-2">
              {disease.recommendations.prevention_methods.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
