import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Responsive sizing
const { width, height } = Dimensions.get('window');
const maxScaleWidth = Math.min(width, 390);
const maxScaleHeight = Math.min(height, 760);
const scale = (size: number) => (maxScaleWidth / 375) * size;
const verticalScale = (size: number) => (maxScaleHeight / 667) * size;

interface ScheduleConfirmationModalProps {
  visible: boolean;
  totalContacts: number;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (date: Date, time: { hours: number; minutes: number }) => Promise<void> | void;
}

const timeSlots = [
  { hours: 9, minutes: 0, label: '9:00 AM' },
  { hours: 11, minutes: 0, label: '11:00 AM' },
  { hours: 14, minutes: 0, label: '2:00 PM' },
  { hours: 16, minutes: 0, label: '4:00 PM' },
  { hours: 18, minutes: 0, label: '6:00 PM' },
];

const quickDateButtons = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: '+2 Days', days: 2 },
  { label: '+7 Days', days: 7 },
];

/**
 * Schedule confirmation modal with date/time picker
 * Replaces Alert.alert confirmation flow for better web platform support
 */
export const ScheduleConfirmationModal: React.FC<ScheduleConfirmationModalProps> = ({
  visible,
  totalContacts,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState({ hours: 9, minutes: 0 });

  const handleConfirm = async () => {
    // Validate date/time
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const scheduleDateTime = new Date(selectedDate);
    scheduleDateTime.setHours(selectedTime.hours, selectedTime.minutes, 0);

    if (scheduleDateTime <= new Date()) {
      alert('Schedule time must be in the future');
      return;
    }

    try {
      await onConfirm(scheduleDateTime, selectedTime);
    } catch (error) {
      console.error('Error in schedule confirmation handler:', error);
      throw error;
    }
  };

  const scheduleDateTime = new Date(selectedDate);
  scheduleDateTime.setHours(selectedTime.hours, selectedTime.minutes, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Schedule Batch</Text>
            <TouchableOpacity onPress={onCancel} disabled={loading}>
              <Ionicons name="close" size={24} color="#11181C" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Date</Text>
              <View style={styles.dateButtonsContainer}>
                {quickDateButtons.map((btn, idx) => {
                  const date = new Date();
                  date.setDate(date.getDate() + btn.days);
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.dateButton,
                        isSelected && styles.dateButtonActive,
                      ]}
                      onPress={() => setSelectedDate(date)}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.dateButtonText,
                          isSelected && styles.dateButtonTextActive,
                        ]}
                      >
                        {btn.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Time</Text>
              <View style={styles.timeButtonsContainer}>
                {timeSlots.map((slot, idx) => {
                  const isSelected =
                    selectedTime.hours === slot.hours &&
                    selectedTime.minutes === slot.minutes;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.timeButton,
                        isSelected && styles.timeButtonActive,
                      ]}
                      onPress={() =>
                        setSelectedTime({ hours: slot.hours, minutes: slot.minutes })
                      }
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.timeButtonText,
                          isSelected && styles.timeButtonTextActive,
                        ]}
                      >
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Ionicons name="calendar" size={20} color="#0a7ea4" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Schedule Date & Time</Text>
                    <Text style={styles.summaryValue}>
                      {scheduleDateTime.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Ionicons name="people" size={20} color="#0a7ea4" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Contacts to Call</Text>
                    <Text style={styles.summaryValue}>{totalContacts} contact(s)</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Schedule Now</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  container: {
    backgroundColor: '#fff',
    width: '88%',
    maxWidth: 420,
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#e6e6e6',
    paddingTop: verticalScale(6),
    maxHeight: '68%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#11181C',
  },
  content: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
  },
  section: {
    marginBottom: verticalScale(10),
  },
  sectionLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#11181C',
    marginBottom: verticalScale(6),
  },
  dateButtonsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: scale(8),
  },
  dateButton: {
    flex: 0.5,
    marginHorizontal: scale(2),
    paddingVertical: verticalScale(7),
    paddingHorizontal: scale(8),
    borderRadius: scale(6),
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center' as const,
  },
  dateButtonActive: {
    backgroundColor: '#d4edda',
    borderColor: '#4caf50',
  },
  dateButtonText: {
    fontSize: scale(10.5),
    fontWeight: '600' as const,
    color: '#687076',
  },
  dateButtonTextActive: {
    color: '#2d6a3e',
  },
  timeButtonsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: scale(8),
  },
  timeButton: {
    flex: 0.5,
    marginHorizontal: scale(2),
    paddingVertical: verticalScale(7),
    paddingHorizontal: scale(8),
    borderRadius: scale(6),
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center' as const,
  },
  timeButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  timeButtonText: {
    fontSize: scale(10.5),
    fontWeight: '600' as const,
    color: '#687076',
  },
  timeButtonTextActive: {
    color: '#1565c0',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: scale(6),
    padding: scale(7),
    borderLeftWidth: scale(3),
    borderLeftColor: '#2196f3',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(10),
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: verticalScale(6),
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: scale(10.5),
    color: '#687076',
    marginBottom: verticalScale(2),
  },
  summaryValue: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#11181C',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(10),
    paddingHorizontal: scale(12),
    paddingBottom: verticalScale(10),
    paddingTop: verticalScale(6),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: verticalScale(7),
    paddingHorizontal: scale(8),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: verticalScale(36),
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#687076',
  },
  confirmButton: {
    backgroundColor: '#2196f3',
  },
  confirmButtonText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#fff',
  },
});
