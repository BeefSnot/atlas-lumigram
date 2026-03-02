import { Image, StyleSheet, Text, View, FlatList } from 'react-native';

import { LumigramTheme } from '../../constants/LumigramTheme';
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
    backgroundColor: LumigramTheme.colors.background,
  },
  listContent: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: LumigramTheme.radius.md,
    borderColor: LumigramTheme.colors.border,
    backgroundColor: LumigramTheme.colors.surface,
    marginBottom: 10,
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
    color: LumigramTheme.colors.textPrimary,
  },
});
