import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{ username?: string | string[]; avatar?: string | string[] }>();

  const initialUsername = Array.isArray(params.username) ? params.username[0] : params.username;
  const initialAvatar = Array.isArray(params.avatar) ? params.avatar[0] : params.avatar;

  const [username, setUsername] = useState(initialUsername ?? 'atlas-lumi');
  const [avatar, setAvatar] = useState(initialAvatar ?? 'https://placedog.net/300x300?id=77');

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to update your profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert('Missing username', 'Please enter a username before saving.');
      return;
    }

    router.replace({
      pathname: '/(tabs)/profile',
      params: {
        username: trimmedUsername,
        avatar,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePickImage}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LumigramTheme.colors.background,
    alignItems: 'center',
    padding: LumigramTheme.spacing.screen,
    paddingTop: 36,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: LumigramTheme.colors.border,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: LumigramTheme.colors.border,
    borderRadius: LumigramTheme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: LumigramTheme.colors.textPrimary,
    marginBottom: 16,
    backgroundColor: LumigramTheme.colors.surface,
  },
  saveButton: {
    width: '100%',
    height: 50,
    borderRadius: LumigramTheme.radius.md,
    backgroundColor: LumigramTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: LumigramTheme.colors.accentText,
    fontWeight: '700',
    fontSize: 16,
  },
});
