import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History as HistoryIcon, Trash2, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HistoryItem } from '@/types/analysis';

const History = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('paddy_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('paddy_history');
    setHistory([]);
  };

  const deleteItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('paddy_history', JSON.stringify(updated));
  };

  const severityColors = {
    low: 'bg-green-500/20 text-green-700',
    medium: 'bg-yellow-500/20 text-yellow-700',
    high: 'bg-red-500/20 text-red-700',
  };

  const severityFromConfidence = (confidenceScore: number) => {
    const pct = Math.round(confidenceScore * 100);
    if (pct >= 85) return 'high' as const;
    if (pct >= 65) return 'medium' as const;
    return 'low' as const;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full gradient-primary">
                <HistoryIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('history')}</h1>
                <p className="text-muted-foreground">
                  {history.length} scan{history.length !== 1 ? 's' : ''} recorded
                </p>
              </div>
            </div>
            {history.length > 0 && (
              <Button variant="destructive" size="sm" onClick={clearHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* History List */}
          {history.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No scan history yet</p>
                <p className="text-muted-foreground mb-4">
                  Start by analyzing your first crop image
                </p>
                <Button onClick={() => navigate('/home')} className="gradient-primary text-primary-foreground">
                  Go to Home
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {history.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt="Crop"
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                            No image
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {item.predicted_class.replace(/_/g, ' ')}
                              </h3>
                              <Badge className={severityColors[severityFromConfidence(item.confidence_score)]}>
                                {Math.round(item.confidence_score * 100)}%
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
