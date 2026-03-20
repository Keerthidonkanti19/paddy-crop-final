import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { AnalysisResult } from '@/types/analysis';

interface CropHealthChartProps {
  disease: AnalysisResult | null;
}

export const CropHealthChart = ({ disease }: CropHealthChartProps) => {
  const { t } = useLanguage();

  const isHealthy = disease ? disease.predicted_class.toLowerCase().includes('healthy') : false;
  const severity = disease
    ? Math.round((isHealthy ? 0.05 : Math.min(0.95, Math.max(0.15, disease.confidence_score))) * 100)
    : 0;

  const healthData = disease
    ? [
        { name: 'Healthy', value: isHealthy ? 95 : 100 - severity, color: 'hsl(120, 50%, 40%)' },
        { name: 'Affected', value: isHealthy ? 5 : severity, color: 'hsl(0, 70%, 50%)' },
      ]
    : [
        { name: 'Healthy', value: 100, color: 'hsl(120, 50%, 40%)' },
        { name: 'Affected', value: 0, color: 'hsl(0, 70%, 50%)' },
      ];

  const treatmentData = [
    { name: 'Week 1', recovery: 20, predicted: 25 },
    { name: 'Week 2', recovery: 45, predicted: 50 },
    { name: 'Week 3', recovery: 70, predicted: 75 },
    { name: 'Week 4', recovery: 90, predicted: 95 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('cropHealth')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recovery Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={treatmentData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="recovery" name="Current Recovery %" fill="hsl(120, 35%, 30%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" name="Predicted %" fill="hsl(85, 50%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
