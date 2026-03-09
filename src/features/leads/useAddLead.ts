import { useAuth } from '@/src/context/AuthContext';
import { useBatch } from '@/src/context/BatchContext';
import { formatPhoneForDisplay, validatePhoneWithMessage } from '@/src/lib/phoneExtractor';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

type Lead = {
  id: string;
  phone: string;
  phoneRaw: string;
  name?: string;
};

const validatePhone = validatePhoneWithMessage;

export function useAddLead() {
  const { createLocalBatch } = useBatch();
  const { requireAuth } = useAuth();
  const [phone, setPhone] = useState('+91');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+]/g, '');
    if (!cleaned.startsWith('+91')) {
      setPhone('+91');
      return;
    }
    if (cleaned.length <= 13) {
      setPhone(cleaned);
    }
  };

  const handleAddLead = () => {
    if (!phone.trim() || phone === '+91') {
      Alert.alert('Validation', 'Please enter a phone number.');
      return;
    }

    const validation = validatePhone(phone.trim());
    if (!validation.valid) {
      Alert.alert('Invalid Phone Number', validation.error);
      return;
    }

    const newLead: Lead = {
      id: `lead_${Date.now()}_${Math.random()}`,
      phone: formatPhoneForDisplay(validation.normalized!),
      phoneRaw: validation.normalized!,
    };

    setLeads([...leads, newLead]);
    setPhone('+91');
    Alert.alert('Lead Added', 'Lead added to list. Review before submitting.');
  };

  const handleRemoveLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const handleReview = () => {
    if (leads.length === 0) {
      Alert.alert('No leads', 'Please add at least one lead.');
      return;
    }
    setReviewMode(true);
  };

  const handleConfirm = async () => {
    requireAuth(async () => {
      if (leads.length === 0) {
        Alert.alert('No leads', 'Please add at least one lead.');
        return;
      }

      try {
        // Convert leads to contacts format
        const contacts = leads.map((lead) => ({
          phone: lead.phoneRaw,
          name: lead.name,
        }));

        // Create batch in local state (NO Firebase write)
        const batch = createLocalBatch(contacts, 'manual', {
          fileName: 'Manual Entry',
          uploadedFrom: 'AddLeadScreen',
          extractionType: 'manual',
        });

        console.log('✅ Batch created locally:', batch.batchId);

        // Reset state
        setReviewMode(false);
        setLeads([]);

        // Redirect to batch dashboard with success message
        router.replace({
          pathname: '/batch-dashboard',
          params: { successMessage: 'Batch created successfully' },
        });
      } catch (error) {
        console.error('Error creating batch:', error);
        Alert.alert('Error', 'Could not create batch. Please try again.');
      }
    });
  };

  return {
    phone,
    leads,
    reviewMode,
    handlePhoneChange,
    handleAddLead,
    handleRemoveLead,
    handleReview,
    handleConfirm,
    setReviewMode,
  };
}
