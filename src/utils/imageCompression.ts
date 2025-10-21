/**
 * Comprimi un'immagine riducendone qualità e dimensioni
 * Target: max 50KB per compatibilità Firebase
 */
export async function compressImage(
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calcola dimensioni mantenendo aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Crea canvas per ridimensionare
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context non disponibile'));
          return;
        }

        // Disegna immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in base64 con compressione
        let compressed = canvas.toDataURL('image/jpeg', quality);

        // Se ancora troppo grande, riduci ulteriormente la qualità
        let currentQuality = quality;
        while (compressed.length > 50000 && currentQuality > 0.1) {
          currentQuality -= 0.1;
          compressed = canvas.toDataURL('image/jpeg', currentQuality);
        }

        resolve(compressed);
      };

      img.onerror = () => {
        reject(new Error('Errore caricamento immagine'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Errore lettura file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Ottieni dimensione in KB di una stringa base64
 */
export function getBase64Size(base64: string): number {
  const sizeInBytes = (base64.length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
}
