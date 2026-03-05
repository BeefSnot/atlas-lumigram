import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseStorage, getDownloadURL, ref, uploadBytes, uploadString } from 'firebase/storage';

import { LumigramTheme } from '../../constants/LumigramTheme';
import { useAuth } from '../../contexts/AuthContext';
import { firebaseDb, firebaseStorage, firebaseStorageAppspotFallback } from '../../lib/firebase';

function getBlobFromUri(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Failed to read image file for upload.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

async function uploadImageToStorage(
  storage: FirebaseStorage,
  storagePath: string,
  imageUri: string,
  imageBase64: string,
  mimeType: string
) {
  const imageRef = ref(storage, storagePath);

  if (Platform.OS === 'web') {
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    await uploadString(imageRef, dataUrl, 'data_url');
  } else {
    const imageBlob = await getBlobFromUri(imageUri);

    await uploadBytes(imageRef, imageBlob, {
      contentType: mimeType,
    });

    const maybeClose = (imageBlob as Blob & { close?: () => void }).close;
    if (typeof maybeClose === 'function') {
      maybeClose.call(imageBlob);
    }
  }

  const imageUrl = await getDownloadURL(imageRef);
  return imageUrl;
}

export default function AddPostScreen() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSelectImage = async () => {
    const pickerPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!pickerPermission.granted) {
      Alert.alert('Permission required', 'Please allow image picker access to continue.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedAsset = result.assets[0];

      setSelectedImageUri(selectedAsset.uri);
      setSelectedImageBase64(selectedAsset.base64 ?? null);
      setSelectedImageMimeType(selectedAsset.mimeType ?? 'image/jpeg');
    }
  };

  const handleAddPost = async () => {
    if (!selectedImageUri) {
      Alert.alert('Missing image', 'Please select an image first.');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Missing caption', 'Please enter a caption for your post.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication required', 'Please log in again before creating a post.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (!selectedImageBase64) {
        Alert.alert('Image processing failed', 'Please re-select your image and try again.');
        return;
      }

      const uriParts = selectedImageUri.split('.');
      const extension = uriParts.length > 1 ? uriParts[uriParts.length - 1] : 'jpg';
      const storagePath = `posts/${user.uid}/${Date.now()}.${extension}`;
      const mimeType = selectedImageMimeType ?? 'image/jpeg';

      let imageUrl: string;

      try {
        imageUrl = await uploadImageToStorage(
          firebaseStorage,
          storagePath,
          selectedImageUri,
          selectedImageBase64,
          mimeType
        );
      } catch (primaryError) {
        const shouldRetryWithFallback =
          (primaryError as { code?: string }).code === 'storage/unknown' && !!firebaseStorageAppspotFallback;

        if (!shouldRetryWithFallback) {
          throw primaryError;
        }

        if (__DEV__) {
          console.warn('[Firebase Storage] Retrying upload with appspot fallback bucket');
        }

        imageUrl = await uploadImageToStorage(
          firebaseStorageAppspotFallback as FirebaseStorage,
          storagePath,
          selectedImageUri,
          selectedImageBase64,
          mimeType
        );
      }

      await addDoc(collection(firebaseDb, 'posts'), {
        imageUrl,
        caption: caption.trim(),
        createdAt: serverTimestamp(),
        createdByUserId: user.uid,
      });

      Alert.alert('Post added', 'Your post has been uploaded successfully.');
      setSelectedImageUri(null);
      setSelectedImageBase64(null);
      setSelectedImageMimeType(null);
      setCaption('');
    } catch (error) {
      const storageError = error as {
        code?: string;
        message?: string;
        serverResponse?: string;
      };

      if (__DEV__) {
        console.error('[Firebase Storage] Upload failed', {
          code: storageError.code,
          message: storageError.message,
          serverResponse: storageError.serverResponse,
        });
      }

      const message =
        storageError.code === 'storage/unknown'
          ? 'Firebase Storage returned an unknown error. Verify Storage is enabled, rules allow authenticated uploads, and (for web localhost) bucket CORS allows your origin.'
          : storageError.message ?? 'Unable to upload post right now.';

      Alert.alert('Upload failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>

      <TouchableOpacity style={styles.imagePickerContainer} onPress={handleSelectImage}>
        {selectedImageUri ? (
          <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>Tap to select an image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.captionInput}
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.postButton} onPress={handleAddPost} disabled={isSubmitting}>
        <Text style={styles.postButtonText}>{isSubmitting ? 'Uploading...' : 'Add Post'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: LumigramTheme.spacing.screen,
    backgroundColor: LumigramTheme.colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: LumigramTheme.colors.textPrimary,
    marginBottom: 14,
  },
  imagePickerContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: LumigramTheme.radius.lg,
    borderWidth: 1,
    borderColor: LumigramTheme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: LumigramTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePickerText: {
    color: LumigramTheme.colors.textSecondary,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: LumigramTheme.colors.border,
    borderRadius: LumigramTheme.radius.md,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    color: LumigramTheme.colors.textPrimary,
    backgroundColor: LumigramTheme.colors.surface,
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: LumigramTheme.colors.accent,
    borderRadius: LumigramTheme.radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: LumigramTheme.colors.accentText,
    fontSize: 16,
    fontWeight: '700',
  },
});
