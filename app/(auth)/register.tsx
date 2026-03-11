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

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (e: any) {
      setError(e.message ?? 'No se pudo crear la cuenta');
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
              Crear cuenta
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.textSecondary,
                textAlign: 'center',
                marginTop: theme.spacing.sm,
              }}>
              Empeza a organizar tu dia con Cachi
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
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
            />

            <View style={{ height: theme.spacing.lg }} />

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
              placeholder="Minimo 8 caracteres"
              secureTextEntry
            />

            <View style={{ height: theme.spacing.xl }} />

            <Button
              title="Crear cuenta"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
            />

            <View style={{ height: theme.spacing.md }} />

            <Button
              title="Ya tengo cuenta"
              onPress={() => router.back()}
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
