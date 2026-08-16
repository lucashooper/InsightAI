import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';

function decodeBase64(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const len = base64.length;
  let bufferLength = Math.floor((len * 3) / 4);
  if (base64[len - 1] === '=') bufferLength--;
  if (base64[len - 2] === '=') bufferLength--;
  const arraybuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arraybuffer);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e0 = lookup[base64.charCodeAt(i)];
    const e1 = lookup[base64.charCodeAt(i + 1)];
    const e2 = lookup[base64.charCodeAt(i + 2)];
    const e3 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = (e0 << 2) | (e1 >> 4);
    bytes[p++] = ((e1 & 15) << 4) | (e2 >> 2);
    bytes[p++] = ((e2 & 3) << 6) | (e3 & 63);
  }
  return arraybuffer;
}

/** Android's native crop UI often hides Done/Cancel — skip in-app crop on Android. */
export function profilePicturePickerOptions(): ImagePicker.ImagePickerOptions {
  return {
    mediaTypes: ['images'],
    allowsEditing: Platform.OS === 'ios',
    aspect: [1, 1],
    quality: 0.8,
  };
}

export async function uploadProfilePictureFromUri(userId: string, uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decodeBase64(base64);
  const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${userId}/${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(fileName, arrayBuffer, {
      contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);
  return urlData.publicUrl;
}
