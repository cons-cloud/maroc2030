import { supabase } from './supabase';

export const uploadImage = async (
  file: File,
  bucket: string = 'services',
  folder?: string
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (
  files: File[],
  bucket: string = 'services',
  folder?: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

export const deleteImage = async (url: string, bucket: string = 'services'): Promise<void> => {
  try {
    const urlParts = url.split('/');
    const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const validateImageFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.' };
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `La taille du fichier dépasse ${maxSizeMB}MB.` };
  }

  return { valid: true };
};
