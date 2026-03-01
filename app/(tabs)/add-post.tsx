import { StyleSheet, Text, View } from 'react-native';

export default function AddPostScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>
      <Text style={styles.subtitle}>Post creation screen coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
});
