import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { LumigramTheme } from '../../constants/LumigramTheme';
import { favoritesFeed } from '@/placeholder';

export default function FavoritesScreen() {
  const renderItem = ({ item }: { item: (typeof favoritesFeed)[number] }) => {
    return <FavoriteFeedItem item={item} />;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlashList
        data={favoritesFeed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </GestureHandlerRootView>
  );
}

function FavoriteFeedItem({ item }: { item: (typeof favoritesFeed)[number] }) {
  const [showCaption, setShowCaption] = useState(false);

  const longPressGesture = Gesture.LongPress()
    .runOnJS(true)
    .onStart(() => {
      setShowCaption((previousValue) => !previousValue);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .runOnJS(true)
    .onStart(() => {
      Alert.alert('Favorite', 'Double tap recognized.');
    });

  const composedGesture = Gesture.Exclusive(doubleTapGesture, longPressGesture);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.createdBy}>{item.createdBy}</Text>
      </View>
      <GestureDetector gesture={composedGesture}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      </GestureDetector>
      {showCaption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>Placeholder caption text</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LumigramTheme.colors.background,
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
