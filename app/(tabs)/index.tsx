import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import { homeFeed } from '@/placeholder';

export default function HomeScreen() {
  const renderItem = ({ item }: { item: (typeof homeFeed)[number] }) => {
    return <FeedItem item={item} />;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlashList
        data={homeFeed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </GestureHandlerRootView>
  );
}

function FeedItem({ item }: { item: (typeof homeFeed)[number] }) {
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
        <Text style={styles.username}>{item.createdBy}</Text>
      </View>
      <GestureDetector gesture={composedGesture}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      </GestureDetector>
      {showCaption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>Placeholder caption text</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingVertical: 10,
  },
  card: {
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  username: {
    fontWeight: '700',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 400,
  },
  captionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  captionText: {
    fontSize: 16,
  },
});
