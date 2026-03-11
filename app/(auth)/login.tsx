import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setError(e.message ?? 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { padding: theme.spacing.xl }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text
              style={{
                fontSize: theme.fontSize.hero,
                fontWeight: '700',
                color: theme.text,
                textAlign: 'center',
              }}>
              Cachi
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                color: theme.textSecondary,
                textAlign: 'center',
                marginTop: theme.spacing.sm,
              }}>
              Tu dia, paso a paso
            </Text>
          </View>

          <View style={{ marginTop: theme.spacing.xxl }}>
            {error ? (
              <View
                style={{
                  backgroundColor: theme.danger + '15',
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg,
                }}>
                <Text style={{ color: theme.danger, fontSize: theme.fontSize.sm, textAlign: 'center' }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={{ height: theme.spacing.lg }} />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              secureTextEntry
            />

            <View style={{ height: theme.spacing.xl }} />

            <Button
              title="Iniciar sesion"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="lg"
            />

            <View style={{ height: theme.spacing.md }} />

            <Button
              title="Crear cuenta"
              onPress={() => router.push('/(auth)/register')}
              variant="ghost"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center' },
});
