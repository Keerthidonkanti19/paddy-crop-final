import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUploader = ({
  onImageSelect,
  selectedImage,
  onClear,
}: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    onImageSelect(file, preview);
  };

  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
      {!selectedImage ? (
        <>
          <p className="mb-4 text-muted-foreground">
            Upload or capture a photo of your paddy crop leaf
          </p>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload size={16} /> Upload Image
            </Button>

            <Button variant="outline" className="gap-2" disabled>
              <Camera size={16} /> Capture Photo
            </Button>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
          />
        </>
      ) : (
        <div className="relative inline-block">
          <img
            src={selectedImage}
            alt="Selected leaf"
            className="max-h-64 rounded-lg mx-auto"
          />

          <Button
            size="icon"
            variant="destructive"
            className="absolute -top-3 -right-3"
            onClick={onClear}
          >
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};
