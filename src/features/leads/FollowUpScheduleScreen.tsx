/**
 * PHASE 3: Follow-Up Scheduling Screen
 * Allows users to schedule follow-ups for leads
 */

import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { scheduleFollowUp } from '@/src/lib/leadService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

export default function FollowUpScheduleScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { leadId, phone } = useLocalSearchParams<{ leadId: string; phone: string }>();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [loading, setLoading] = useState(false);


  if (!leadId) {
    return (
      <ScreenContainer>
        <Text style={[styles.error, { color: colors.danger }]}>Lead ID not found</Text>
      </ScreenContainer>
    );
  }

  const handleSchedule = async () => {
    if (!followUpNotes.trim()) {
      Alert.alert('Required', 'Please add a note for the follow-up');
      return;
    }

    try {
      setLoading(true);
      await scheduleFollowUp(leadId, selectedDate, followUpNotes);
      Alert.alert('Success', 'Follow-up scheduled successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule follow-up. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes);
    setSelectedDate(newDate);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Schedule Follow-up" subtitle={`Phone: ${phone}`} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date</Text>

          <View style={[styles.dateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dateDisplay, { color: colors.text }]}>
              📅 {selectedDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>

            <View style={styles.dateButtons}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => handleDateChange(-1)}
              >
                <Text style={styles.buttonText}>← Yesterday</Text>
              </Pressable>

              <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => {
                  const today = new Date();
                  setSelectedDate(today);
                }}
              >
                <Text style={styles.buttonText}>Today</Text>
              </Pressable>

              <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => handleDateChange(1)}
              >
                <Text style={styles.buttonText}>Tomorrow →</Text>
              </Pressable>
            </View>

            {/* Quick options */}
            <View style={styles.quickOptions}>
              {[1, 3, 7].map(days => (
                <Pressable
                  key={days}
                  style={[styles.quickButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    const newDate = new Date();
                    newDate.setDate(newDate.getDate() + days);
                    setSelectedDate(newDate);
                  }}
                >
                  <Text style={[styles.quickButtonText, { color: colors.primary }]}>
                    +{days}d
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Time Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Time</Text>

          <View style={[styles.timeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.timeDisplay, { color: colors.text }]}>
              🕐 {selectedDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>

            <View style={styles.timeButtons}>
              {['09:00', '11:00', '14:00', '16:00', '18:00'].map(time => (
                <Pressable
                  key={time}
                  style={[styles.timeButton, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    const [h, m] = time.split(':');
                    handleTimeChange(parseInt(h), parseInt(m));
                  }}
                >
                  <Text style={[styles.timeButtonText, { color: colors.primary }]}>{time}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Follow-up Note</Text>

          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Why are you following up? What do you want to discuss?"
            placeholderTextColor={colors.textMuted}
            value={followUpNotes}
            onChangeText={setFollowUpNotes}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            This note will help track the reason for follow-up
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.cancelButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[
              styles.scheduleButton,
              {
                backgroundColor: colors.success,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleSchedule}
            disabled={loading}
          >
            <Text style={styles.scheduleButtonText}>
              {loading ? 'Scheduling...' : 'Schedule Follow-up'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  dateCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  dateDisplay: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  quickOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  timeDisplay: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
