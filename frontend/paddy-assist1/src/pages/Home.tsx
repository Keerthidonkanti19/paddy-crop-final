// import { useState } from 'react';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { Header } from '@/components/Header';
// import { ImageUploader } from '@/components/ImageUploader';
// import { DiseaseResult } from '@/components/DiseaseResult';
// import { CropHealthChart } from '@/components/CropHealthChart';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { DiseaseInfo, mockDetection } from '@/data/diseaseData';
// import { Loader2, Search, Sparkles } from 'lucide-react';

// const Home = () => {
//   const { t } = useLanguage();
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [detectionResult, setDetectionResult] = useState<DiseaseInfo | null>(null);

//   const handleDetect = async () => {
//     if (!selectedFile) return;

//     setIsAnalyzing(true);
//     setDetectionResult(null);

//     // Simulate API call delay
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     const result = mockDetection();
//     setDetectionResult(result);

//     setIsAnalyzing(false);

//     // Save to history
//     const history = JSON.parse(localStorage.getItem('paddy_history') || '[]');
//     history.unshift({
//       id: crypto.randomUUID(),
//       image: selectedFile,
//       disease: result,
//       timestamp: new Date().toISOString(),
//     });
//     localStorage.setItem('paddy_history', JSON.stringify(history.slice(0, 50)));
//   };

//   const handleClear = () => {
//     setSelectedFile(null);
//     setDetectionResult(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />

//       <main className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto space-y-8">
//           {/* Welcome Section */}
//           <div className="text-center space-y-2">
//             <h1 className="text-3xl font-bold text-gradient">{t('paddyDiseaseDetector')}</h1>
//             <p className="text-muted-foreground">{t('helpFarmers')}</p>
//           </div>

//           {/* Image Upload Section */}
//           <ImageUploader
//             onImageSelect={(file, preview) => {
//             setSelectedFile(file);
//             setSelectedImage(preview);
//             }}
//             selectedImage={selectedImage}
//             onClear={handleClear}
//           />

//           {/* Detect Button */}
//           {selectedImage && !detectionResult && (
//             <div className="flex justify-center">
//               <Button
//                 onClick={handleDetect}
//                 disabled={isAnalyzing}
//                 size="lg"
//                 className="gradient-primary text-primary-foreground px-8 py-6 text-lg"
//               >
//                 {isAnalyzing ? (
//                   <>
//                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                     Analyzing...
//                   </>
//                 ) : (
//                   <>
//                     <Search className="mr-2 h-5 w-5" />
//                     {t('detectDisease')}
//                   </>
//                 )}
//               </Button>
//             </div>
//           )}

//           {/* Loading Animation */}
//           {isAnalyzing && (
//             <Card className="border-primary/20">
//               <CardContent className="py-12">
//                 <div className="flex flex-col items-center space-y-4">
//                   <div className="relative">
//                     <div className="w-20 h-20 rounded-full gradient-primary animate-pulse" />
//                     <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-primary-foreground animate-bounce" />
//                   </div>
//                   <p className="text-lg font-medium">Analyzing your crop image...</p>
//                   <p className="text-sm text-muted-foreground">
//                     Our AI is examining the leaf patterns and colors
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           )}

//           {/* Results Section */}
//           {detectionResult && (
//             <div className="space-y-8 animate-in fade-in-50 duration-500">
//               <DiseaseResult disease={detectionResult} />
//               <CropHealthChart disease={detectionResult} />
              
//               <div className="flex justify-center">
//                 <Button
//                   onClick={handleClear}
//                   variant="outline"
//                   size="lg"
//                 >
//                   Analyze Another Image
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Home;


import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { DiseaseResult } from "@/components/DiseaseResult";
import { CropHealthChart } from "@/components/CropHealthChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Sparkles } from "lucide-react";
import type { AnalysisResult, HistoryItem } from "@/types/analysis";

const Home = () => {
  const { t, language } = useLanguage();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<AnalysisResult | null>(null);

  const handleDetect = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setDetectionResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile); // MUST be "file"
      formData.append("language", language);

      const response = await fetch("http://127.0.0.1:8001/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => "");
        throw new Error(`Analyze failed: ${msg || response.statusText}`);
      }

      const data: AnalysisResult = await response.json();

      setDetectionResult(data);

      const history: HistoryItem[] = JSON.parse(localStorage.getItem("paddy_history") || "[]");
      history.unshift({
        id: crypto.randomUUID(),
        image: selectedImage,
        predicted_class: data.predicted_class,
        confidence_score: data.confidence_score,
        language: data.language,
        recommendations: data.recommendations,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(
        "paddy_history",
        JSON.stringify(history.slice(0, 50))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Check ML API and LLM configuration.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setDetectionResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gradient">
              {t("paddyDiseaseDetector")}
            </h1>
            <p className="text-muted-foreground">
              {t("helpFarmers")}
            </p>
          </div>

          {/* Image Upload */}
          <ImageUploader
            onImageSelect={(file: File, preview: string) => {
              setSelectedFile(file);
              setSelectedImage(preview);
            }}
            selectedImage={selectedImage}
            onClear={handleClear}
          />

          {/* Detect Button */}
          {selectedImage && !detectionResult && (
            <div className="flex justify-center">
              <Button
                onClick={handleDetect}
                disabled={isAnalyzing}
                size="lg"
                className="gradient-primary text-primary-foreground px-8 py-6 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    {t("detectDisease")}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Loading */}
          {isAnalyzing && (
            <Card className="border-primary/20">
              <CardContent className="py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full gradient-primary animate-pulse" />
                    <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-primary-foreground animate-bounce" />
                  </div>
                  <p className="text-lg font-medium">
                    Analyzing your crop image...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Our AI is examining the leaf patterns and texture
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {detectionResult && (
            <div className="space-y-8 animate-in fade-in-50 duration-500">
              <DiseaseResult disease={detectionResult} />
              <CropHealthChart disease={detectionResult} />

              <div className="flex justify-center">
                <Button onClick={handleClear} variant="outline" size="lg">
                  Analyze Another Image
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Home;
