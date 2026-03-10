import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/use-app-theme';

export default function ContactUsPage() {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Contact Us</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>For support, verification, or billing assistance, contact us using the details below.</Text>

        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>Business Name</Text>
          <Text style={[styles.value, { color: colors.text }]}>MAXSAS REALTY</Text>
        </View>

        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <Text style={[styles.value, { color: colors.text }]}>maxsasrealty@gmail.com</Text>
        </View>

        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
          <Text style={[styles.value, { color: colors.text }]}>+91 8588837040</Text>
        </View>

        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.text }]}>Operating Address</Text>
          <Text style={[styles.value, { color: colors.text }]}>Vasundhara Hospital, First Floor, Office No. C-37</Text>
          <Text style={[styles.value, { color: colors.text }]}>Metro Plaza, Sector 15, Vasundhara</Text>
          <Text style={[styles.value, { color: colors.text }]}>Ghaziabad, Uttar Pradesh, 201012, India</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.85,
  },
  block: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.72,
    fontWeight: '700',
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
});
