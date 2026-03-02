import { Image, StyleSheet, Text, View, FlatList } from 'react-native';

import { userSearch } from '@/placeholder';

export default function SearchScreen() {
  const renderItem = ({ item }: { item: (typeof userSearch)[number] }) => {
    return (
      <View style={styles.row}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{item.username}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={userSearch}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
  },
});
