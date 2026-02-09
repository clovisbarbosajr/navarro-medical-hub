/**
 * Redimensiona uma imagem para caber em dimensões específicas.
 * Usado para campanhas/galeria onde o formato precisa ser padronizado.
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 400,
  quality: number = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        // Calculate target dimensions maintaining aspect ratio
        const targetRatio = maxWidth / maxHeight;
        const imgRatio = img.width / img.height;

        let cropX = 0;
        let cropY = 0;
        let cropW = img.width;
        let cropH = img.height;

        if (imgRatio > targetRatio) {
          // Image is wider — crop sides
          cropW = img.height * targetRatio;
          cropX = (img.width - cropW) / 2;
        } else {
          // Image is taller — crop top/bottom
          cropH = img.width / targetRatio;
          cropY = (img.height - cropH) / 2;
        }

        canvas.width = maxWidth;
        canvas.height = maxHeight;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, maxWidth, maxHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Redimensiona e faz upload para o storage.
 */
export const resizeAndUpload = async (
  supabase: any,
  file: File,
  folder: string,
  maxWidth: number = 800,
  maxHeight: number = 400
): Promise<string | null> => {
  try {
    const resizedBlob = await resizeImage(file, maxWidth, maxHeight);
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\.[^.]+$/, ".webp")}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, resizedBlob, {
        contentType: "image/webp",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Resize and upload error:", err);
    return null;
  }
};
