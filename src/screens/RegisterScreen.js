import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, PASSWORD_RULES, isPasswordValid } from '../context/AuthContext';
import { Colors, Typography } from '../theme';

// ─── Indicateur de force du mot de passe ─────────────────────────────────────

function PasswordStrength({ password }) {
  if (!password) return null;

  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const total  = PASSWORD_RULES.length;

  const levels = [
    { threshold: 1, label: 'Très faible', color: Colors.red },
    { threshold: 2, label: 'Faible',      color: '#FF9F0A' },
    { threshold: 3, label: 'Moyen',       color: '#FFD60A' },
    { threshold: 4, label: 'Fort',        color: '#30D158' },
    { threshold: 5, label: 'Très fort',   color: '#30D158' },
  ];
  const level = levels[Math.min(passed - 1, levels.length - 1)];

  return (
    <View style={ps.wrap}>
      {/* Barres de force */}
      <View style={ps.bars}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              ps.bar,
              { backgroundColor: i < passed ? level.color : Colors.surface },
            ]}
          />
        ))}
      </View>
      <Text style={[ps.label, { color: level.color }]}>{level.label}</Text>

      {/* Critères détaillés */}
      <View style={ps.rules}>
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <View key={rule.id} style={ps.ruleRow}>
              <Ionicons
                name={ok ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={ok ? '#30D158' : Colors.textTertiary}
              />
              <Text style={[ps.ruleText, ok && ps.ruleTextOk]}>
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const ps = StyleSheet.create({
  wrap:      { marginTop: 10, gap: 8 },
  bars:      { flexDirection: 'row', gap: 5 },
  bar:       { flex: 1, height: 4, borderRadius: 2 },
  label:     { ...Typography.caption, fontWeight: '600', alignSelf: 'flex-end', marginTop: -4 },
  rules:     { gap: 5, marginTop: 2 },
  ruleRow:   { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ruleText:  { ...Typography.caption, color: Colors.textTertiary },
  ruleTextOk:{ color: '#30D158' },
});

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();

  const [username,        setUsername]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState('');
  const [showStrength,    setShowStrength]    = useState(false);

  const emailRef   = useRef(null);
  const passRef    = useRef(null);
  const confirmRef = useRef(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleRegister = async () => {
    setError('');
    const result = await register(username, email, password, confirmPassword);
    if (!result.success) {
      setError(result.error);
      triggerShake();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── En-tête ── */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Ionicons name="person-add" size={36} color={Colors.background} />
          </View>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez GestionNotes</Text>
        </View>

        {/* ── Formulaire ── */}
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>

          {/* Nom d'utilisateur */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="min. 3 caractères"
                placeholderTextColor={Colors.textTertiary}
                value={username}
                onChangeText={(t) => { setUsername(t); setError(''); }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
              {username.trim().length >= 3 && (
                <Ionicons name="checkmark-circle" size={18} color="#30D158" />
              )}
            </View>
          </View>

          {/* E-mail */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="exemple@mail.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
              />
            </View>
          </View>

          {/* Mot de passe */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={passRef}
                style={[styles.input, styles.inputFlex]}
                placeholder="Créez un mot de passe fort"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError('');
                  setShowStrength(t.length > 0);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {/* Indicateur de force */}
            {showStrength && <PasswordStrength password={password} />}
          </View>

          {/* Confirmation mot de passe */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <View style={[
              styles.inputRow,
              passwordsMismatch && styles.inputRowError,
              passwordsMatch    && styles.inputRowSuccess,
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={confirmRef}
                style={[styles.input, styles.inputFlex]}
                placeholder="Répétez le mot de passe"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
              {passwordsMatch    && <Ionicons name="checkmark-circle" size={18} color="#30D158" style={{ marginLeft: 4 }} />}
              {passwordsMismatch && <Ionicons name="close-circle"     size={18} color={Colors.red}   style={{ marginLeft: 4 }} />}
            </View>
            {passwordsMismatch && (
              <Text style={styles.mismatchText}>Les mots de passe ne correspondent pas</Text>
            )}
          </View>

          {/* Message d'erreur global */}
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Bouton inscription */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <Text style={styles.btnText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Lien retour connexion ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}> Se connecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // En-tête
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: Colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  title: {
    ...Typography.title2,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },

  // Formulaire
  form: {
    gap: 14,
  },
  fieldWrap: {
    gap: 6,
  },
  label: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    paddingLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputRowError: {
    borderColor: Colors.red,
    borderWidth: 1,
  },
  inputRowSuccess: {
    borderColor: '#30D158',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    height: 52,
  },
  inputFlex: {
    flex: 1,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  mismatchText: {
    ...Typography.caption,
    color: Colors.red,
    paddingLeft: 4,
    marginTop: 2,
  },

  // Erreur
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redDim,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  errorText: {
    ...Typography.footnote,
    color: Colors.red,
    flex: 1,
  },

  // Bouton
  btn: {
    backgroundColor: Colors.yellow,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    ...Typography.headline,
    color: Colors.background,
    fontWeight: '700',
  },

  // Pied de page
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    ...Typography.subhead,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.subhead,
    color: Colors.yellow,
    fontWeight: '600',
  },
});