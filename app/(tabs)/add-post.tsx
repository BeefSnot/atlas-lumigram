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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  imagePickerContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#666',
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
});
