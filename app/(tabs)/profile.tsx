import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

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
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 8,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
  },
  gridContent: {
    padding: 2,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  gridImage: {
    width: '33%',
    aspectRatio: 1,
  },
});
