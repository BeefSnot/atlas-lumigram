import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { LumigramTheme } from '../../constants/LumigramTheme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Lumigram</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={LumigramTheme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={LumigramTheme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>Create a new account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: LumigramTheme.spacing.screen,
    backgroundColor: LumigramTheme.colors.background,
  },
  card: {
    borderWidth: 1,
    borderColor: LumigramTheme.colors.border,
    borderRadius: LumigramTheme.radius.lg,
    padding: LumigramTheme.spacing.xl,
    backgroundColor: LumigramTheme.colors.surface,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: LumigramTheme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: LumigramTheme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: LumigramTheme.colors.border,
    borderRadius: LumigramTheme.radius.md,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    color: LumigramTheme.colors.textPrimary,
    backgroundColor: LumigramTheme.colors.background,
  },
  button: {
    backgroundColor: LumigramTheme.colors.accent,
    height: 50,
    borderRadius: LumigramTheme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  buttonText: {
    color: LumigramTheme.colors.accentText,
    fontSize: 16,
    fontWeight: '700',
  },
  linkText: {
    color: LumigramTheme.colors.accent,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
});
