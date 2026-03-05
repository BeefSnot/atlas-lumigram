import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Stack } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
    </Stack>
  );
}
