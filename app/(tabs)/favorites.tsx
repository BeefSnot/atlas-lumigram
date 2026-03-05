import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

import { LumigramTheme } from '../../constants/LumigramTheme';
import { useAuth } from '../../contexts/AuthContext';
import { firebaseDb } from '../../lib/firebase';

type FavoritePost = {
  id: string;
  imageUrl: string;
  caption: string;
  createdByLabel: string;
};

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoritePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const favoritesQuery = query(
        collection(firebaseDb, 'users', user.uid, 'favorites'),
        orderBy('favoritedAt', 'desc')
      );

      const snapshot = await getDocs(favoritesQuery);
      const nextFavorites: FavoritePost[] = snapshot.docs
        .map((favoriteDoc) => {
          const data = favoriteDoc.data() as {
            imageUrl?: string;
            caption?: string;
            createdByLabel?: string;
            createdByUserId?: string;
            favoritedAt?: Timestamp;
          };

          if (!data.imageUrl) {
            return null;
          }

          return {
            id: favoriteDoc.id,
            imageUrl: data.imageUrl,
            caption: data.caption ?? '',
            createdByLabel: data.createdByLabel ?? data.createdByUserId ?? 'unknown-user',
          };
        })
        .filter((favorite): favorite is FavoritePost => favorite !== null);

      setFavorites(nextFavorites);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const renderItem = ({ item }: { item: FavoritePost }) => {
    return <FavoriteFeedItem item={item} />;
  };

  if (isLoading) {
    return (
      <View style={styles.centeredStateContainer}>
        <ActivityIndicator size="large" color={LumigramTheme.colors.accent} />
      </View>
    );
  }

  if (!favorites.length) {
    return (
      <View style={styles.centeredStateContainer}>
        <Text style={styles.emptyStateText}>No favorites yet. Double tap a post to save one.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onRefresh={loadFavorites}
        refreshing={isLoading}
      />
    </View>
  );
}

function FavoriteFeedItem({ item }: { item: FavoritePost }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.createdBy}>{item.createdByLabel}</Text>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />

      <View style={styles.captionContainer}>
        <Text style={styles.caption}>{item.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LumigramTheme.colors.background,
  },
  centeredStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LumigramTheme.spacing.screen,
    backgroundColor: LumigramTheme.colors.background,
  },
  emptyStateText: {
    color: LumigramTheme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  card: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LumigramTheme.colors.border,
    borderRadius: LumigramTheme.radius.lg,
    overflow: 'hidden',
    backgroundColor: LumigramTheme.colors.surface,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  createdBy: {
    fontWeight: '700',
    fontSize: 16,
    color: LumigramTheme.colors.textPrimary,
  },
  image: {
    width: '100%',
    height: 360,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  caption: {
    fontSize: 15,
    color: LumigramTheme.colors.textSecondary,
  },
});
