import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LumigramTheme } from '../../constants/LumigramTheme';

export default function AddPostScreen() {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

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
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const handleAddPost = () => {
    if (!selectedImageUri) {
      Alert.alert('Missing image', 'Please select an image first.');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Missing caption', 'Please enter a caption for your post.');
      return;
    }

    Alert.alert('Post added', 'Your post has been added.');
    setSelectedImageUri(null);
    setCaption('');
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

      <TouchableOpacity style={styles.postButton} onPress={handleAddPost}>
        <Text style={styles.postButtonText}>Add Post</Text>
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
