import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { updateDemoTranscriptViewed } from '@/src/services/userService';
import { useAppTheme } from '@/src/theme/use-app-theme';

type ConversationMessage = {
  type: 'bot' | 'user';
  text: string;
};

export default function DemoTranscriptScreen() {
  const { user } = useAuth();
  const { transcript, pass } = useLocalSearchParams<{ transcript: string; pass?: string }>();
  const { colors, spacing, radius } = useAppTheme();
  const [isClosing, setIsClosing] = useState(false);

  const parsedMessages = useMemo<ConversationMessage[]>(() => {
    if (!transcript) {
      return [];
    }

    const lines = transcript.split('\n').filter((line) => line.trim().length > 0);
    const messages: ConversationMessage[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (/^bot\s*:/i.test(trimmedLine)) {
        messages.push({
          type: 'bot',
          text: trimmedLine.replace(/^bot\s*:/i, '').trim(),
        });
      } else if (/^user\s*:/i.test(trimmedLine)) {
        messages.push({
          type: 'user',
          text: trimmedLine.replace(/^user\s*:/i, '').trim(),
        });
      }
    });

    return messages;
  }, [transcript]);

  const handleClose = async () => {
    if (isClosing) {
      return;
    }

    try {
      setIsClosing(true);
      if (user?.uid) {
        await updateDemoTranscriptViewed(user.uid);
      }
      
      // Navigate back to home with flag to hide demo card
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace({
        pathname: '/',
        params: {
          hideDemoCard: 'true',
          ...(pass ? { pass } : {}),
        },
      });
    } catch (error) {
      console.error('Failed to update transcript viewed status:', error);
      Alert.alert('Error', 'Failed to save status. Please try again.');
      setIsClosing(false);
    }
  };

  return (
    <ScreenContainer safeAreaEdges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <AppHeader 
          title="Demo Call Transcript" 
          subtitle="Review your AI conversation"
        />
        <TouchableOpacity 
          style={[styles.closeIcon, { backgroundColor: colors.border }]}
          onPress={handleClose}
          disabled={isClosing}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.chatContainer, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
          {parsedMessages.length > 0 ? (
            parsedMessages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubbleWrapper,
                  msg.type === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.type === 'user'
                      ? { backgroundColor: colors.info, borderRadius: radius.md }
                      : { backgroundColor: colors.primary, borderRadius: radius.md },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: '#fff',
                      },
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.noTranscriptText, { color: colors.textMuted }]}>No transcript available.</Text>
          )}
        </View>

        <View style={[styles.infoCard, { 
          backgroundColor: colors.primary + '10',
          borderRadius: radius.md,
          padding: spacing.md,
          marginHorizontal: spacing.lg,
          marginTop: spacing.lg,
        }]}>
          <Ionicons name="information-circle" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text, marginLeft: spacing.sm }]}>
            This is a simulated demo call. Upgrade to start making real calls to your leads.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { 
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }]}>
        <TouchableOpacity
          style={[styles.closeButton, { 
            backgroundColor: colors.primary,
            borderRadius: radius.md,
            height: 48,
          }]}
          onPress={handleClose}
          disabled={isClosing}
          activeOpacity={0.8}
        >
          {isClosing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.closeButtonText}>Close & Return Home</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 8,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  chatContainer: {
    marginTop: 8,
  },
  messageBubbleWrapper: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  noTranscriptText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginVertical: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#fff',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
