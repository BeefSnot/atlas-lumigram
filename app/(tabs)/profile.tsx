import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { LumigramTheme } from '../../constants/LumigramTheme';
import { profileFeed } from '@/placeholder';

export default function ProfileScreen() {
  const params = useLocalSearchParams<{ username?: string | string[]; avatar?: string | string[] }>();
  const [username, setUsername] = useState('atlas-lumi');
  const [avatar, setAvatar] = useState('https://placedog.net/300x300?id=77');

  useEffect(() => {
    const nextUsername = Array.isArray(params.username) ? params.username[0] : params.username;
    const nextAvatar = Array.isArray(params.avatar) ? params.avatar[0] : params.avatar;

    if (nextUsername) {
      setUsername(nextUsername);
    }

    if (nextAvatar) {
      setAvatar(nextAvatar);
    }
  }, [params.avatar, params.username]);

  const handleOpenEditProfile = () => {
    router.push({
      pathname: '/(tabs)/edit-profile' as never,
      params: {
        username,
        avatar,
      },
    });
  };

  const renderItem = ({ item }: { item: (typeof profileFeed)[number] }) => {
    return <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="cover" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleOpenEditProfile}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
        </TouchableOpacity>
        <Text style={styles.username}>{username}</Text>
      </View>

      <FlatList
        data={profileFeed}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LumigramTheme.colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: LumigramTheme.colors.border,
    backgroundColor: LumigramTheme.colors.surface,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: LumigramTheme.colors.border,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: LumigramTheme.colors.textPrimary,
  },
  gridContent: {
    padding: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gridImage: {
    width: '33%',
    aspectRatio: 1,
  },
});
