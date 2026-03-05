import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import {
  collection,
  doc,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { LumigramTheme } from '../../constants/LumigramTheme';
import { firebaseDb } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

type FeedPost = {
  id: string;
  imageUrl: string;
  caption: string;
  createdByLabel: string;
  createdByUserId: string;
  createdAtText: string;
  createdAtTimestamp: number;
};

const PAGE_SIZE = 10;

export default function HomeScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const mapDocumentToPost = useCallback((doc: QueryDocumentSnapshot<DocumentData>): FeedPost | null => {
    const data = doc.data();
    const imageUrl = data.imageUrl;
    const caption = typeof data.caption === 'string' ? data.caption : '';
    const createdByUserId = typeof data.createdByUserId === 'string' ? data.createdByUserId : 'unknown-user';
    const createdByDisplayName =
      typeof data.createdByDisplayName === 'string' && data.createdByDisplayName.trim()
        ? data.createdByDisplayName.trim()
        : createdByUserId;
    const createdAt = data.createdAt as Timestamp | undefined;

    if (typeof imageUrl !== 'string' || !imageUrl) {
      return null;
    }

    const createdAtDate = createdAt ? createdAt.toDate() : null;
    const createdAtTimestamp = createdAtDate ? createdAtDate.getTime() : 0;

    return {
      id: doc.id,
      imageUrl,
      caption,
      createdByLabel: createdByDisplayName,
      createdByUserId,
      createdAtText: createdAtDate ? createdAtDate.toLocaleString() : 'Pending timestamp',
      createdAtTimestamp,
    };
  }, []);

  const fetchPage = useCallback(
    async (mode: 'initial' | 'refresh' | 'load-more') => {
      if (mode === 'load-more' && (isLoadingMore || !hasMore || !lastVisible)) {
        return;
      }

      if (mode === 'refresh') {
        setIsRefreshing(true);
      } else if (mode === 'load-more') {
        setIsLoadingMore(true);
      }

      try {
        const postsQuery =
          mode === 'load-more' && lastVisible
            ? query(collection(firebaseDb, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE))
            : query(collection(firebaseDb, 'posts'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

        const snapshot = await getDocs(postsQuery);
        const mappedPosts = snapshot.docs.map(mapDocumentToPost).filter((post): post is FeedPost => post !== null);

        if (mode === 'load-more') {
          setPosts((prevPosts) => [...prevPosts, ...mappedPosts]);
        } else {
          setPosts(mappedPosts);
        }

        if (snapshot.docs.length > 0) {
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        }

        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } finally {
        if (mode === 'refresh') {
          setIsRefreshing(false);
        } else if (mode === 'load-more') {
          setIsLoadingMore(false);
        }

        if (mode === 'initial') {
          setIsInitialLoading(false);
        }
      }
    },
    [hasMore, isLoadingMore, lastVisible, mapDocumentToPost]
  );

  useEffect(() => {
    void fetchPage('initial');
  }, []);

  const onRefresh = useCallback(() => {
    setLastVisible(null);
    setHasMore(true);
    void fetchPage('refresh');
  }, [fetchPage]);

  const onEndReached = useCallback(() => {
    void fetchPage('load-more');
  }, [fetchPage]);

  const addToFavorites = useCallback(
    async (post: FeedPost) => {
      if (!user) {
        Alert.alert('Login required', 'Please sign in to save favorites.');
        return;
      }

      const favoriteDocRef = doc(firebaseDb, 'users', user.uid, 'favorites', post.id);

      try {
        await setDoc(
          favoriteDocRef,
          {
            postId: post.id,
            imageUrl: post.imageUrl,
            caption: post.caption,
            createdByUserId: post.createdByUserId,
            createdByLabel: post.createdByLabel,
            postCreatedAtTimestamp: post.createdAtTimestamp,
            favoritedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        Alert.alert('Favorite failed', 'Unable to save this post to favorites right now.');
      }
    },
    [user]
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedPost }) => <FeedItem item={item} onDoubleTapFavorite={addToFavorites} />,
    [addToFavorites]
  );

  const listFooter = useMemo(() => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoaderContainer}>
        <ActivityIndicator size="small" color={LumigramTheme.colors.accent} />
      </View>
    );
  }, [isLoadingMore]);

  if (isInitialLoading) {
    return (
      <View style={styles.centeredStateContainer}>
        <ActivityIndicator size="large" color={LumigramTheme.colors.accent} />
      </View>
    );
  }

  if (!posts.length) {
    return (
      <View style={styles.centeredStateContainer}>
        <Text style={styles.emptyStateText}>No posts yet. Be the first to add one.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={listFooter}
      />
    </View>
  );
}

function FeedItem({ item, onDoubleTapFavorite }: { item: FeedPost; onDoubleTapFavorite: (post: FeedPost) => void }) {
  const [showCaptionOverlay, setShowCaptionOverlay] = useState(false);

  const longPressGesture = Gesture.LongPress()
    .runOnJS(true)
    .onStart(() => {
      setShowCaptionOverlay((previous) => !previous);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onStart(() => {
      onDoubleTapFavorite(item);
    });

  const combinedGesture = Gesture.Exclusive(doubleTapGesture, longPressGesture);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{item.createdByLabel}</Text>
        <Text style={styles.headerSubText}>{item.createdAtText}</Text>
      </View>

      <GestureDetector gesture={combinedGesture}>
        <View>
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          {showCaptionOverlay ? (
            <View style={styles.captionOverlayContainer}>
              <Text style={styles.captionOverlayText}>{item.caption}</Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>

      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>{item.caption}</Text>
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
  listContainer: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  itemContainer: {
    marginBottom: 16,
    backgroundColor: LumigramTheme.colors.surface,
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerText: {
    fontWeight: '700',
    fontSize: 14,
    color: LumigramTheme.colors.textPrimary,
  },
  headerSubText: {
    marginTop: 2,
    fontSize: 12,
    color: LumigramTheme.colors.textSecondary,
  },
  image: {
    width: '100%',
    height: 380,
    backgroundColor: LumigramTheme.colors.border,
  },
  captionOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: LumigramTheme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  captionOverlayText: {
    color: LumigramTheme.colors.textPrimary,
    fontSize: 14,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  captionText: {
    color: LumigramTheme.colors.textPrimary,
    fontSize: 15,
  },
  footerLoaderContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});
