import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { getUserProfile, upsertUserProfile } from '@/src/services/userService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type FloatingInputFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  maxLength?: number;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  colors: {
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    card: string;
  };
};

function FloatingInputField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  editable = true,
  autoCapitalize = 'none',
  colors,
}: FloatingInputFieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <View style={[styles.fieldWrap, { borderColor: focused ? colors.primary : colors.border, backgroundColor: colors.card }]}>
      <Text
        style={[
          styles.floatingLabel,
          {
            color: focused ? colors.primary : colors.textMuted,
            top: active ? 8 : 15,
            fontSize: active ? 10 : 13,
          },
        ]}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.fieldInput, { color: colors.text }]}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, radius, spacing, typography } = useAppTheme();
  const { user, logout, requireAuth } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [initialName, setInitialName] = useState('');
  const [initialPhone, setInitialPhone] = useState('');
  const [initialEmail, setInitialEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (mounted) {
          const nextName = profile?.name || user.displayName || '';
          const nextPhone = profile?.phone || '';
          const nextEmail = profile?.email || user.email || '';

          setName(nextName);
          setPhone(nextPhone);
          setEmail(nextEmail);

          setInitialName(nextName);
          setInitialPhone(nextPhone);
          setInitialEmail(nextEmail);
        }
      } catch (profileError) {
        console.error('Failed to load profile:', profileError);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [user]);

  const initials = useMemo(() => {
    const source = name.trim() || user?.email || 'U';
    return source.slice(0, 1).toUpperCase();
  }, [name, user?.email]);

  const hasChanges = useMemo(() => {
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
    const cleanEmail = email.trim().toLowerCase();

    return (
      cleanName !== initialName.trim().replace(/\s+/g, ' ')
      || cleanPhone !== initialPhone.replace(/\D/g, '').slice(0, 10)
      || cleanEmail !== initialEmail.trim().toLowerCase()
    );
  }, [email, initialEmail, initialName, initialPhone, name, phone]);

  const showSuccessToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  };

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const normalized = digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits;
    if (!/^[987]\d{9}$/.test(normalized)) return null;
    return normalized;
  };

  const handleSave = async () => {
    requireAuth(async () => {
      if (!user || saving || !hasChanges) return;

      const normalizedName = name.trim().replace(/\s+/g, ' ');
      if (!normalizedName) {
        setError('Name is required.');
        return;
      }

      if (!/^[A-Za-z ]+$/.test(normalizedName)) {
        setError('Name can contain only alphabets and spaces.');
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
      if (!emailValid) {
        setError('Enter a valid email address.');
        return;
      }

      const normalizedPhone = normalizePhone(phone);
      if (!normalizedPhone) {
        setError('Enter a valid Indian mobile number (10 digits, starts with 9/8/7).');
        return;
      }

      setSaving(true);
      setError('');

      try {
        await upsertUserProfile(user.uid, {
          name: normalizedName,
          phone: normalizedPhone,
          email: normalizedEmail,
        });

        setName(normalizedName);
        setPhone(normalizedPhone);
        setEmail(normalizedEmail);

        setInitialName(normalizedName);
        setInitialPhone(normalizedPhone);
        setInitialEmail(normalizedEmail);

        setIsEditing(false);
        showSuccessToast();
      } catch (saveError) {
        console.error('Failed to update profile:', saveError);
        setError('Unable to save changes. Please try again.');
      } finally {
        setSaving(false);
      }
    });
  };

  const handleCancelEdit = () => {
    setName(initialName);
    setPhone(initialPhone);
    setEmail(initialEmail);
    setError('');
    setIsEditing(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
    } catch (logoutError) {
      console.error('Logout failed, forcing redirect to landing page:', logoutError);
    } finally {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.replace('/');
      } else {
        router.replace('/');
      }
      setLoggingOut(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Profile" subtitle="Account and contact details" />

      {toastVisible && (
        <View style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}> 
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={[styles.toastText, { color: colors.text }]}>Profile updated successfully</Text>
        </View>
      )}

      <AppCard style={[styles.profileCard, { borderRadius: radius.lg }]}> 
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20', borderRadius: radius.pill }]}> 
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <View style={styles.identityBlock}>
            <Text style={[styles.name, { color: colors.text, fontSize: typography.h3 }]}>{name || 'Complete your profile'}</Text>
            <Text style={[styles.email, { color: colors.textMuted, fontSize: typography.caption }]}>{email || '-'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.groupLabel, { color: colors.textMuted, fontSize: typography.caption }]}>Personal Information</Text>

              {!isEditing ? (
                <Pressable
                  onPress={() => {
                    setError('');
                    setIsEditing(true);
                  }}
                  style={({ pressed }: { pressed: boolean }) => [
                    styles.editButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}
                >
                  <Feather name="edit-2" size={12} color={colors.primary} />
                  <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
                </Pressable>
              ) : (
                <View style={styles.inlineActionsRow}>
                  <Pressable
                    onPress={handleCancelEdit}
                    disabled={saving}
                    style={({ pressed }: { pressed: boolean }) => [
                      styles.inlineActionButton,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                        opacity: pressed || saving ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.inlineActionText, { color: colors.textMuted }]}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSave}
                    disabled={saving || !hasChanges}
                    style={({ pressed }: { pressed: boolean }) => [
                      styles.inlineActionButton,
                      {
                        borderColor: colors.primary,
                        backgroundColor: colors.primary,
                        opacity: saving || !hasChanges ? 0.55 : pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={[styles.inlineActionText, { color: '#fff' }]}>Save Changes</Text>
                    )}
                  </Pressable>
                </View>
              )}
            </View>

            {!isEditing ? (
              <View style={styles.infoRowsWrap}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Full Name</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{name || '-'}</Text>
                </View>
                <View style={[styles.infoRow, { borderTopColor: colors.border }]}> 
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{email || '-'}</Text>
                </View>
                <View style={[styles.infoRow, { borderTopColor: colors.border }]}> 
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{phone || '-'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.editFieldsWrap}>
                <FloatingInputField
                  label="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  colors={colors}
                />
                <FloatingInputField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  colors={colors}
                />
                <FloatingInputField
                  label="Phone"
                  value={phone}
                  onChangeText={(value: string) => setPhone(value.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  colors={colors}
                />
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />

            <Text style={[styles.groupLabel, { color: colors.textMuted, fontSize: typography.caption, marginBottom: spacing.xs }]}>Billing</Text>
            <View style={[styles.billingCardsRow, { gap: spacing.sm }]}> 
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.billingCard,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    borderRadius: radius.md,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
                onPress={() => router.push('/transaction-history')}
              >
                <View style={[styles.billingIconWrap, { backgroundColor: colors.surface }]}> 
                  <Feather name="clock" size={14} color={colors.primary} />
                </View>
                <Text style={[styles.billingTitle, { color: colors.text, fontSize: typography.body }]}>Transaction History</Text>
                <Text style={[styles.billingSubtitle, { color: colors.textMuted, fontSize: typography.caption }]}>View all wallet activity</Text>
              </Pressable>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.billingCard,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    borderRadius: radius.md,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
                onPress={() => router.push('/batch-charges')}
              >
                <View style={[styles.billingIconWrap, { backgroundColor: colors.surface }]}> 
                  <Feather name="layers" size={14} color={colors.primary} />
                </View>
                <Text style={[styles.billingTitle, { color: colors.text, fontSize: typography.body }]}>Batch Charges</Text>
                <Text style={[styles.billingSubtitle, { color: colors.textMuted, fontSize: typography.caption }]}>Per batch billing details</Text>
              </Pressable>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing.md }]} />

            <Text style={[styles.groupLabel, { color: colors.textMuted, fontSize: typography.caption, marginBottom: spacing.xs }]}>
              Legal and Policies
            </Text>
            <Text style={[styles.billingSubtitle, { color: colors.textMuted, fontSize: typography.caption, marginBottom: spacing.sm }]}>
              PhonePe compliance and user transparency documents
            </Text>

            <View style={styles.policyLinksWrap}>
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.policyLinkRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => router.push('/terms-and-conditions')}
              >
                <Text style={[styles.policyLinkTitle, { color: colors.text }]}>Terms and Conditions</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.policyLinkRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => router.push('/refund-policy')}
              >
                <Text style={[styles.policyLinkTitle, { color: colors.text }]}>Refund Policy</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>

              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.policyLinkRow,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => router.push('/privacy-policy')}
              >
                <Text style={[styles.policyLinkTitle, { color: colors.text }]}>Privacy Policy</Text>
                <Feather name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            </View>

            {error ? <Text style={[styles.feedback, { color: colors.danger }]}>{error}</Text> : null}

            <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.xs }]}>
              <AppButton title="Logout" variant="destructive" onPress={handleLogout} loading={loggingOut} disabled={loggingOut} />
            </View>
          </>
        )}
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  toast: {
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileCard: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
  },
  identityBlock: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontWeight: '800',
  },
  email: {
    marginTop: 4,
  },
  divider: {
    height: 1,
  },
  groupLabel: {
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editButton: {
    minHeight: 30,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inlineActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineActionButton: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoRowsWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  infoRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '62%',
    textAlign: 'right',
  },
  editFieldsWrap: {
    gap: 10,
  },
  fieldWrap: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    fontWeight: '700',
  },
  fieldInput: {
    fontSize: 13,
    fontWeight: '600',
    paddingTop: 12,
    paddingBottom: 4,
  },
  loaderWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  feedback: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  billingCardsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  billingCard: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  billingIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  billingTitle: {
    fontWeight: '700',
    marginBottom: 3,
  },
  billingSubtitle: {
    lineHeight: 16,
  },
  policyLinksWrap: {
    gap: 8,
    marginBottom: 12,
  },
  policyLinkRow: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  policyLinkTitle: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    paddingRight: 8,
  },
  actions: {},
});
