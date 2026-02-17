import { useState, useRef } from "react";
import { Camera, Upload, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChatAuth } from "@/contexts/ChatAuthContext";

const FirstLoginSetup = ({ onComplete }: { onComplete: () => void }) => {
  const { user, profile, refreshProfile } = useChatAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      // Resize to 256x256 keeping aspect ratio (fit, no crop)
      const blob = await resizeAvatar(file, 256);
      const ext = file.type === "image/png" ? "png" : "jpg";
      const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(filePath, blob, { upsert: true, contentType: `image/${ext}` });
      if (!error) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        await (supabase as any).from("user_profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
        await refreshProfile();
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="glass-strong rounded-3xl p-8 max-w-sm w-full mx-4 space-y-6 animate-in text-center">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Bem-vindo(a)!</h2>
          <p className="text-sm text-muted-foreground mt-1">{profile?.display_name}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-28 h-28 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center cursor-pointer hover:border-primary/70 transition-colors overflow-hidden bg-secondary/30"
          >
            {previewUrl || profile?.avatar_url ? (
              <img src={previewUrl || profile?.avatar_url!} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="hidden"
            onChange={handleFile}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Enviando..." : previewUrl || profile?.avatar_url ? "Trocar foto" : "Adicionar foto de perfil"}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Formatos aceitos: JPG, JPEG, PNG
        </p>

        <button
          onClick={onComplete}
          className="menu-btn w-full h-11 flex items-center justify-center gap-2 text-sm"
        >
          {previewUrl || profile?.avatar_url ? "Continuar" : "Pular por agora"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function resizeAvatar(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        // Fit inside maxSize x maxSize without cropping
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Blob fail")), file.type === "image/png" ? "image/png" : "image/jpeg", 0.9);
      };
      img.onerror = () => reject(new Error("Image load fail"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Read fail"));
    reader.readAsDataURL(file);
  });
}

export default FirstLoginSetup;
