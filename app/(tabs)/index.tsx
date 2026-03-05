import { StyleSheet, Image, View, Text, Alert } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { FlashList } from '@shopify/flash-list';
import { runOnJS } from 'react-native-reanimated';
import { useState } from 'react';

import { homeFeed } from '@/placeholder';

export default function HomeScreen() {
  const renderItem = ({ item }: { item: typeof homeFeed[0] }) => {
    return <FeedItem item={item} />;
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlashList
        data={homeFeed}
        renderItem={renderItem}
        estimatedItemSize={400}
        contentContainerStyle={styles.listContainer}
      />
    </GestureHandlerRootView>
  );
}

function FeedItem({ item }: { item: typeof homeFeed[0] }) {
  const [showCaption, setShowCaption] = useState(false);

  const toggleCaption = () => {
  };

  const showFavoriteAlert = () => {
    Alert.alert('Favorite', 'Double tap recognized.');
  };

  const longPressGesture = Gesture.LongPress()
    .onStart(() => {
      runOnJS(toggleCaption)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(showFavoriteAlert)();
    });

  const composedGesture = Gesture.Exclusive(doubleTapGesture, longPressGesture);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{item.createdBy}</Text>
      </View>
      <GestureDetector gesture={composedGesture}>
        <View>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </GestureDetector>
      {showCaption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: { paddingVertical: 10 },
  itemContainer: { marginBottom: 20 },
  header: { padding: 15, flexDirection: 'row', alignItems: 'center' },
  headerText: { fontWeight: 'bold', fontSize: 16 },
  image: { width: '100%', height: 400 },
  captionContainer: { padding: 15 },
  captionText: { fontSize: 16 }
});
