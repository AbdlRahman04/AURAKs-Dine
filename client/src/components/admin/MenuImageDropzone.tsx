import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type MenuImageDropzoneProps = {
  imageUrl: string;
  selectedFile: File | null;
  disabled?: boolean;
  error?: string;
  onFileChange: (file: File | null) => void;
  onError: (message: string) => void;
};

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}

export default function MenuImageDropzone({
  imageUrl,
  selectedFile,
  disabled = false,
  error,
  onFileChange,
  onError,
}: MenuImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(imageUrl || null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageUrl, selectedFile]);

  const selectFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Choose an image file. The server will convert supported image formats to WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError("Image is too large. Choose an image smaller than 10 MB.");
      return;
    }

    onError("");
    onFileChange(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-dashed bg-muted/20 transition-colors",
          isDragging && "border-primary bg-primary/10",
          error && "border-destructive/70",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) selectFile(event.dataTransfer.files[0]);
        }}
      >
        {previewUrl ? (
          <div className="relative aspect-[4/3] bg-muted">
            <img
              src={previewUrl}
              alt="Menu item preview"
              className="h-full w-full object-cover"
              width="640"
              height="480"
              onError={() => {
                setPreviewUrl(null);
                onError("This image preview could not be loaded. Choose another image.");
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/70 p-3 text-white">
              <span className="min-w-0 truncate text-sm">
                {selectedFile ? `${selectedFile.name} · ${formatBytes(selectedFile.size)}` : "Current image"}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() => {
                  onFileChange(null);
                  onError("");
                }}
                aria-label="Remove menu image"
              >
                <X className="mr-1 h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Drop a menu image here</p>
              <p className="text-sm text-muted-foreground">Any supported image format will be converted to WebP</p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              Choose image
            </Button>
          </div>
        )}
      </div>

      {previewUrl && (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Replace image
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          selectFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        aria-label="Choose menu image"
      />
      <p className={cn("text-xs text-muted-foreground", error && "text-destructive")} role={error ? "alert" : undefined}>
        {error || "Maximum 10 MB. Images are resized and stored as optimized WebP."}
      </p>
    </div>
  );
}
