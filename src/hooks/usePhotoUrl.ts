import { useEffect, useState } from 'react';
import { loadPhoto } from '../lib/db';

export function usePhotoUrl(photoRef: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoRef) {
      setUrl(null);
      return;
    }
    let objectUrl: string | null = null;
    loadPhoto(photoRef).then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      }
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoRef]);

  return url;
}
