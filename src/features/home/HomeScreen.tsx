import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { ActivityIndicator, Alert, Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AIAvatar } from '@/src/components/ui/AIAvatar';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { AppSection } from '@/src/components/ui/AppSection';
import { RechargeButton } from '@/src/components/ui/RechargeButton';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { useWallet } from '@/src/context/WalletContext';
import { useDashboardStats } from '@/src/hooks/useDashboardStats';
import { db } from '@/src/lib/firebase';
import { DemoCallDocument, executeDemoCallFlow, getDemoCallById, subscribeToDemoCall } from '@/src/services/demoCallService';
import {
    getUserCurrentDemoCallId,
    getUserDemoStatus,
    getUserProfile,
    markDemoCallCompleted,
    markUserHasSeenDemo,
} from '@/src/services/userService';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';

const hiddenDemoCardSessionUsers = new Set<string>();
const hiddenDemoCardSessionPasses = new Set<string>();

const isExpiredValue = (value: unknown): boolean => {
  if (!value) {
    return false;
  }

  if (typeof value === 'number') {
    return value <= Date.now();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? false : parsed <= Date.now();
  }

  if (typeof value === 'object' && value !== null) {
    const maybeDate = value as { toDate?: () => Date };
    if (typeof maybeDate.toDate === 'function') {
      return maybeDate.toDate().getTime() <= Date.now();
    }
  }

  return false;
};

export default function HomeScreen() {
  const { colors, typography, radius } = useAppTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ hideDemoCard?: string | string[]; pass?: string | string[] }>();
  const passParam = Array.isArray(params?.pass) ? params.pass[0] : params?.pass;
  const secretPass = typeof passParam === 'string' ? passParam.trim() : '';
  
  // Demo CTA visibility (derived from Firestore, NOT persisted locally)
  // Firestore user.demoEligible and user.demoUsed are the source of truth
  // This ensures demo cannot reappear after app reinstall
  const [showDemoCallCta, setShowDemoCallCta] = useState(false);
  const [isDemoHighlighted, setIsDemoHighlighted] = useState(false);
  const [demoCallLoading, setDemoCallLoading] = useState(false);
  const [demoCallState, setDemoCallState] = useState<'idle' | 'calling' | 'failed'>('idle');
  const [demoSuccessToastVisible, setDemoSuccessToastVisible] = useState(false);
  const [showDemoConfirmModal, setShowDemoConfirmModal] = useState(false);
  const [demoTargetName, setDemoTargetName] = useState('');
  const [demoTargetPhone, setDemoTargetPhone] = useState('');
  const [demoFormError, setDemoFormError] = useState('');
  const [showTrafficMessage, setShowTrafficMessage] = useState(false);
  const [demoScriptReady, setDemoScriptReady] = useState(false);
  const [isDemoFinished, setIsDemoFinished] = useState(false);
  const [demoReadyScript, setDemoReadyScript] = useState('');
  const [hideDemoCardForSession, setHideDemoCardForSession] = useState(false);
  const [currentDemoCallId, setCurrentDemoCallId] = useState<string | null>(null);
  const [secretPassChecked, setSecretPassChecked] = useState(false);
  const [isSecretPassValid, setIsSecretPassValid] = useState(false);
  const [secretPassError, setSecretPassError] = useState('');
  const guestUserId = isSecretPassValid && secretPass ? `GUEST_${secretPass}` : null;
  const effectiveUserId = user?.uid ?? guestUserId;
  const isGuestSession = !user?.uid && !!guestUserId;
  
  // Refs for cleanup
  const demoListenerUnsubscribe = useRef<(() => void) | null>(null);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trafficShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trafficHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoLatestStatusRef = useRef<'initiated' | 'in_progress' | 'completed' | 'failed' | null>(null);
  const demoLatestScriptRef = useRef('');
  
  // Smooth fade animation for CTA appearance/disappearance
  const demoCtaOpacity = useRef(new Animated.Value(0)).current;
  const demoEntranceScale = useRef(new Animated.Value(0.96)).current;
  const demoPulseScale = useRef(new Animated.Value(1)).current;
  const demoGlowOpacity = useRef(new Animated.Value(0)).current;
  const demoPulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Real-time dashboard statistics from Firestore
  const dashboardStats = useDashboardStats();
  
  // Real-time wallet data from Firestore
  const { wallet, availableBalance, loading: walletLoading } = useWallet();

  const showDemoSuccessToast = () => {
    setDemoSuccessToastVisible(true);
    setTimeout(() => setDemoSuccessToastVisible(false), 2200);
  };

  useEffect(() => {
    let mounted = true;

    const validateSecretPass = async () => {
      if (!secretPass) {
        if (mounted) {
          setSecretPassChecked(true);
          setIsSecretPassValid(false);
          setSecretPassError('');
        }
        return;
      }

      try {
        const passRef = doc(db, 'betaAccess', secretPass);
        const passSnap = await getDoc(passRef);

        if (!mounted) {
          return;
        }

        if (!passSnap.exists()) {
          setIsSecretPassValid(false);
          setSecretPassError('Private preview link is invalid or expired.');
          setSecretPassChecked(true);
          return;
        }

        const data = passSnap.data() as Record<string, unknown>;
        const inactive = data.active === false || data.enabled === false || data.revoked === true;
        const expired = [data.expiresAt, data.expiryAt, data.expiredAt, data.validUntil]
          .some((value) => isExpiredValue(value));

        if (inactive || expired) {
          setIsSecretPassValid(false);
          setSecretPassError('Private preview link is invalid or expired.');
          setSecretPassChecked(true);
          return;
        }

        setIsSecretPassValid(true);
        setSecretPassError('');
        setSecretPassChecked(true);
      } catch (error) {
        console.error('Failed to validate secret pass:', error);
        if (mounted) {
          setIsSecretPassValid(false);
          setSecretPassError('Private preview link is invalid or expired.');
          setSecretPassChecked(true);
        }
      }
    };

    validateSecretPass();

    return () => {
      mounted = false;
    };
  }, [secretPass]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const loadDemoStatus = async () => {
        if (isSecretPassValid && secretPass) {
          if (mounted) {
            setShowDemoCallCta(true);
            setIsDemoHighlighted(false);
            setHideDemoCardForSession(hiddenDemoCardSessionPasses.has(secretPass));

            Animated.parallel([
              Animated.timing(demoCtaOpacity, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
              }),
              Animated.spring(demoEntranceScale, {
                toValue: 1,
                damping: 12,
                stiffness: 140,
                useNativeDriver: true,
              }),
            ]).start();
          }
          return;
        }

        if (!user?.uid) {
          if (mounted) {
            setShowDemoCallCta(false);
          }
          return;
        }

        try {
          const demoStatus = await getUserDemoStatus(user.uid);
          const shouldShow = demoStatus.demoEligible === true && demoStatus.demoUsed === false;
          const shouldHighlight = shouldShow && demoStatus.hasSeenDemo === false;
          if (mounted) {
            setShowDemoCallCta(shouldShow);
            setIsDemoHighlighted(shouldHighlight);
            setHideDemoCardForSession(Boolean(user?.uid && hiddenDemoCardSessionUsers.has(user.uid)));
            // Smooth fade-in animation
            if (shouldShow) {
              Animated.parallel([
                Animated.timing(demoCtaOpacity, {
                  toValue: 1,
                  duration: 350,
                  useNativeDriver: true,
                }),
                Animated.spring(demoEntranceScale, {
                  toValue: 1,
                  damping: 12,
                  stiffness: 140,
                  useNativeDriver: true,
                }),
              ]).start();
            }
          }
        } catch (error) {
          console.error('Failed to load demo status:', error);
          if (mounted) {
            setShowDemoCallCta(false);
          }
        }
      };

      loadDemoStatus();

      return () => {
        mounted = false;
      };
    }, [isSecretPassValid, secretPass, user?.uid, demoCtaOpacity, demoEntranceScale])
  );

  useEffect(() => {
    if (!showDemoCallCta || !isDemoHighlighted) {
      demoPulseLoopRef.current?.stop();
      demoPulseScale.setValue(1);
      demoGlowOpacity.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(demoPulseScale, {
            toValue: 1.022,
            duration: 1700,
            useNativeDriver: true,
          }),
          Animated.timing(demoGlowOpacity, {
            toValue: 0.38,
            duration: 1700,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(demoPulseScale, {
            toValue: 1,
            duration: 1700,
            useNativeDriver: true,
          }),
          Animated.timing(demoGlowOpacity, {
            toValue: 0.14,
            duration: 1700,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    demoPulseLoopRef.current = loop;
    loop.start();

    return () => {
      demoPulseLoopRef.current?.stop();
    };
  }, [demoGlowOpacity, demoPulseScale, isDemoHighlighted, showDemoCallCta]);

  // Cleanup demo call listener and timeout on unmount
  useEffect(() => {
    return () => {
      if (demoListenerUnsubscribe.current) {
        demoListenerUnsubscribe.current();
        demoListenerUnsubscribe.current = null;
      }
      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
        demoTimeoutRef.current = null;
      }
      if (trafficShowTimerRef.current) {
        clearTimeout(trafficShowTimerRef.current);
        trafficShowTimerRef.current = null;
      }
      if (trafficHideTimerRef.current) {
        clearTimeout(trafficHideTimerRef.current);
        trafficHideTimerRef.current = null;
      }
      demoLatestStatusRef.current = null;
      demoLatestScriptRef.current = '';
    };
  }, []);

  const clearTrafficTimer = useCallback(() => {
    if (trafficShowTimerRef.current) {
      clearTimeout(trafficShowTimerRef.current);
      trafficShowTimerRef.current = null;
    }
    if (trafficHideTimerRef.current) {
      clearTimeout(trafficHideTimerRef.current);
      trafficHideTimerRef.current = null;
    }
    setShowTrafficMessage(false);
  }, []);

  const startTrafficTimerInfiniteLoop = useCallback(() => {
    clearTrafficTimer();

    const scheduleNextCycle = () => {
      trafficShowTimerRef.current = setTimeout(() => {
        setShowTrafficMessage(true);

        trafficHideTimerRef.current = setTimeout(() => {
          setShowTrafficMessage(false);
          trafficHideTimerRef.current = null;

          if (demoLatestStatusRef.current !== 'completed' && demoLatestStatusRef.current !== 'failed') {
            scheduleNextCycle();
          }
        }, 7000);

        trafficShowTimerRef.current = null;
      }, 10000);
    };

    scheduleNextCycle();
  }, [clearTrafficTimer]);

  useEffect(() => {
    if (demoCallLoading && (demoCallState === 'calling' || demoCallState === 'idle')) {
      startTrafficTimerInfiniteLoop();
      return;
    }

    clearTrafficTimer();
  }, [clearTrafficTimer, demoCallLoading, demoCallState, startTrafficTimerInfiniteLoop]);

  const applyDemoCallSyncState = useCallback((demoCallData: DemoCallDocument | null) => {
    if (!demoCallData) {
      return;
    }

    const rawScript = typeof demoCallData.script === 'string' ? demoCallData.script : '';
    const hasScript = rawScript.trim() !== '';
    const isCompleted = demoCallData.status === 'completed';
    demoLatestStatusRef.current = demoCallData.status;
    demoLatestScriptRef.current = rawScript;

    if (hasScript || isCompleted) {
      setDemoReadyScript(hasScript ? rawScript : '');
      setDemoScriptReady(true);
      setIsDemoFinished(true);
      setDemoCallLoading(false);
      setDemoCallState('idle');

      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
        demoTimeoutRef.current = null;
      }
      return;
    }

    if (!hasScript && demoCallData.status === 'failed') {
      setDemoScriptReady(false);
      setIsDemoFinished(false);
      setDemoReadyScript('');
      setDemoCallLoading(false);
      setDemoCallState('failed');

      if (demoTimeoutRef.current) {
        clearTimeout(demoTimeoutRef.current);
        demoTimeoutRef.current = null;
      }
      return;
    }

    if (demoCallData.status === 'in_progress') {
      setDemoScriptReady(false);
      setIsDemoFinished(false);
      setDemoReadyScript('');
      setDemoCallLoading(true);
      setDemoCallState('calling');
    }
  }, []);

  const attachDemoCallListener = useCallback((demoCallId: string) => {
    if (demoListenerUnsubscribe.current) {
      demoListenerUnsubscribe.current();
      demoListenerUnsubscribe.current = null;
    }

    demoListenerUnsubscribe.current = subscribeToDemoCall(
      demoCallId,
      (demoCallData) => {
        applyDemoCallSyncState(demoCallData);

        if (
          user?.uid &&
          demoCallData?.status === 'completed' &&
          typeof demoCallData.script === 'string' &&
          demoCallData.script.trim() !== ''
        ) {
          markDemoCallCompleted(user.uid, demoCallId).catch((error) => {
            console.error('Failed to mark demo call as completed for user:', error);
          });
        }
      },
      (error) => {
        console.error('Demo call listener error:', error);
      }
    );
  }, [applyDemoCallSyncState, user?.uid]);

  useEffect(() => {
    let mounted = true;

    const syncCurrentSessionDemo = async () => {
      if (!user?.uid) {
        if (mounted) {
          setCurrentDemoCallId(null);
        }
        return;
      }

      try {
        const demoCallId = await getUserCurrentDemoCallId(user.uid);
        if (!mounted) {
          return;
        }

        setCurrentDemoCallId(demoCallId);
        if (!demoCallId) {
          return;
        }

        const demoCallData = await getDemoCallById(demoCallId);
        if (!mounted) {
          return;
        }

        applyDemoCallSyncState(demoCallData);
        attachDemoCallListener(demoCallId);
      } catch (error) {
        console.error('Failed initial demo call sync:', error);
      }
    };

    syncCurrentSessionDemo();

    return () => {
      mounted = false;
      if (demoListenerUnsubscribe.current) {
        demoListenerUnsubscribe.current();
        demoListenerUnsubscribe.current = null;
      }
    };
  }, [applyDemoCallSyncState, attachDemoCallListener, user?.uid]);

  const resetDemoCallFlowState = useCallback(() => {
    clearTrafficTimer();
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }
    if (demoListenerUnsubscribe.current) {
      demoListenerUnsubscribe.current();
      demoListenerUnsubscribe.current = null;
    }
    demoLatestStatusRef.current = null;
    demoLatestScriptRef.current = '';
    setDemoCallLoading(false);
    setDemoCallState('idle');
    setDemoScriptReady(false);
    setIsDemoFinished(false);
    setDemoReadyScript('');
  }, [clearTrafficTimer]);

  const showDemoRetryError = useCallback(() => {
    resetDemoCallFlowState();
    Alert.alert('Demo Call Failed', 'Call not picked or failed', [{ text: 'OK' }]);
  }, [resetDemoCallFlowState]);

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    const normalized = digits.length === 12 && digits.startsWith('91')
      ? digits.slice(2)
      : digits;

    if (!/^[987]\d{9}$/.test(normalized)) {
      return null;
    }

    return normalized;
  };

  const openDemoCallConfirmation = async () => {
    if (!effectiveUserId || demoCallLoading) {
      return;
    }

    if (isDemoHighlighted) {
      setIsDemoHighlighted(false);
      demoPulseLoopRef.current?.stop();
      demoPulseScale.setValue(1);
      demoGlowOpacity.setValue(0);
      if (user?.uid) {
        markUserHasSeenDemo(user.uid).catch((error) => {
          console.warn('Unable to persist hasSeenDemo flag:', error);
        });
      }
    }

    try {
      if (isGuestSession) {
        setDemoTargetName('');
        setDemoTargetPhone('');
        setDemoFormError('');
        setShowDemoConfirmModal(true);
        return;
      }

      const authenticatedUserId = user?.uid;
      if (!authenticatedUserId) {
        return;
      }

      const profile = await getUserProfile(authenticatedUserId);
      setDemoTargetName(profile?.name?.trim() || '');
      setDemoTargetPhone(profile?.phone?.trim() || '');
      setDemoFormError('');
      setShowDemoConfirmModal(true);
    } catch (error) {
      console.error('Failed to load profile for demo confirmation:', error);
      setDemoTargetName('');
      setDemoTargetPhone('');
      setDemoFormError('Could not load saved profile. Please enter details manually.');
      setShowDemoConfirmModal(true);
    }
  };

  const handleStartDemoCall = async () => {
    if (!effectiveUserId || demoCallLoading || isDemoFinished) {
      return;
    }

    const name = demoTargetName.trim().replace(/\s+/g, ' ');
    const normalizedPhone = normalizePhone(demoTargetPhone);

    if (!name) {
      setDemoFormError('Name is required before starting demo call.');
      return;
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
      setDemoFormError('Name can contain only alphabets and spaces.');
      return;
    }

    if (!normalizedPhone) {
      setDemoFormError('Enter a valid Indian mobile number (10 digits, starts with 9/8/7).');
      return;
    }

    setDemoFormError('');

    try {
      setDemoScriptReady(false);
      setIsDemoFinished(false);
      setDemoReadyScript('');
      setDemoCallLoading(true);
      setDemoCallState('calling');
      demoLatestStatusRef.current = 'initiated';
      demoLatestScriptRef.current = '';

      const result = await executeDemoCallFlow(effectiveUserId, {
        targetName: name,
        targetPhone: `+91${normalizedPhone}`,
      });

      setCurrentDemoCallId(result.demoCallId);

      // Close the modal immediately after initiating the call
      setShowDemoConfirmModal(false);

      if (result.status === 'in_progress' || result.status === 'initiated') {
        showDemoSuccessToast();
        demoLatestStatusRef.current = result.status;

        // Set up 2-minute timeout - show error if no script received
        demoTimeoutRef.current = setTimeout(() => {
          const hasScript = demoLatestScriptRef.current.trim().length > 0;

          // If no script after 2 minutes, show retry error (status doesn't matter)
          if (!hasScript) {
            showDemoRetryError();
          }
        }, 2 * 60 * 1000); // 2 minutes

        attachDemoCallListener(result.demoCallId);

        getDemoCallById(result.demoCallId)
          .then((demoCallData) => {
            applyDemoCallSyncState(demoCallData);
            if (
              demoCallData?.status === 'completed' &&
              typeof demoCallData.script === 'string' &&
              demoCallData.script.trim() !== ''
            ) {
              if (user?.uid) {
                markDemoCallCompleted(user.uid, result.demoCallId).catch((error) => {
                  console.error('Failed to mark demo call as completed for user:', error);
                });
              }
            }
          })
          .catch((error) => {
            console.error('Failed immediate demo call sync:', error);
          });
      }
    } catch (error) {
      console.error('Failed to execute demo call:', error);
      resetDemoCallFlowState();
      setShowDemoConfirmModal(false);
      Alert.alert('Demo Call Failed', 'Unable to complete demo call. Please try again.');
    }
  };

  const handleViewTranscript = () => {
    if (!demoReadyScript) return;
    
    router.push({
      pathname: '/demo-transcript',
      params: {
        transcript: demoReadyScript,
        ...(secretPass ? { pass: secretPass } : {}),
      },
    });
  };

  // Listen for return from transcript screen to hide demo card
  useFocusEffect(
    useCallback(() => {
      const hideParam = Array.isArray(params?.hideDemoCard) ? params.hideDemoCard[0] : params?.hideDemoCard;

      if (hideParam === 'true') {
        if (user?.uid) {
          hiddenDemoCardSessionUsers.add(user.uid);
          setHideDemoCardForSession(true);
        }

        if (secretPass) {
          hiddenDemoCardSessionPasses.add(secretPass);
          setHideDemoCardForSession(true);
        }
      }
    }, [params, secretPass, user?.uid])
  );

  const isStartDemoDisabled = demoCallState === 'calling' || demoCallLoading || isDemoFinished;
  const shouldShowViewTranscript = demoScriptReady || isDemoFinished;

  return (
    <ScreenContainer>
      {/* Hero: primary AI presence for trust and focus */}
      <View style={styles.hero}>
        <AIAvatar />
        <Text style={[styles.heroTitle, { color: colors.text }]}>MAXSAS AI</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>Your AI lead strategist is ready.</Text>
      </View>

      <AppHeader title="Command Center" subtitle="Today’s lead performance snapshot" />

      {demoSuccessToastVisible && (
        <View style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={[styles.toastText, { color: colors.text }]}>Demo call started successfully</Text>
        </View>
      )}

      {secretPassChecked && secretPass && !isSecretPassValid && secretPassError ? (
        <View style={[styles.invalidPassWrap, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
          <Text style={[styles.invalidPassText, { color: colors.textMuted }]}>{secretPassError}</Text>
        </View>
      ) : null}

      {showDemoCallCta && !hideDemoCardForSession ? (
        <Animated.View
          style={{
            opacity: demoCtaOpacity,
            transform: [{ scale: Animated.multiply(demoEntranceScale, demoPulseScale) }],
          }}
        >
          <View style={styles.demoCtaWrap}>
            {isDemoHighlighted ? (
              <Animated.View
                pointerEvents="none"
                style={[styles.demoOuterGlow, { opacity: demoGlowOpacity }]}
              />
            ) : null}

            <TouchableOpacity
              style={[
                styles.demoCtaCard,
                {
                  backgroundColor: '#f5f8ff',
                  borderColor: '#a5b4fc',
                  opacity: isStartDemoDisabled ? 0.7 : 1,
                },
                styles.demoCtaCardPremium,
                isDemoHighlighted ? styles.demoCtaCardHighlighted : null,
              ]}
              activeOpacity={0.85}
              onPress={openDemoCallConfirmation}
              disabled={isStartDemoDisabled}
            >
            <>
              <View style={styles.demoGradientLayerA} />
              <View style={styles.demoGradientLayerB} />
              <Animated.View style={[styles.demoGlowLayer, { opacity: demoGlowOpacity }]} />
            </>

            {isDemoHighlighted ? (
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>Start Here</Text>
              </View>
            ) : null}

            <View style={styles.demoCtaLeft}>
              <View style={[styles.demoIconWrap, { backgroundColor: colors.primary + '14' }]}>
                <Ionicons name="rocket" size={16} color={colors.primary} />
              </View>
              <View style={styles.demoTextWrap}>
                <Text style={[styles.demoCtaTitle, { color: colors.text }]}>Try AI Demo Call</Text>
                <Text style={[styles.demoCtaSubtitle, { color: colors.textMuted }]}>
                  {shouldShowViewTranscript
                    ? 'Your demo call is ready!'
                    : demoCallLoading
                    ? 'Waiting for call system response...'
                    : demoCallState === 'calling'
                    ? 'Calling is now in progress'
                    : demoCallState === 'failed'
                    ? 'Call did not connect. Please try demo again.'
                    : 'Experience how it works in seconds'}
                </Text>
                {showTrafficMessage && (
                  <Text style={[styles.demoQueueNotice, { color: colors.textMuted }]}>
                    High traffic detected. Connecting shortly...
                  </Text>
                )}
              </View>
            </View>
            <View
              style={[
                styles.demoCtaAction,
                {
                  backgroundColor: shouldShowViewTranscript
                    ? colors.primary
                    : isStartDemoDisabled
                    ? colors.textMuted
                    : colors.primary,
                  borderRadius: radius.pill,
                },
              ]}
            >
              {shouldShowViewTranscript ? (
                <TouchableOpacity 
                  onPress={handleViewTranscript}
                  style={{ paddingHorizontal: 12 }}
                  activeOpacity={0.7}
                  disabled={!demoReadyScript}
                >
                  <Text style={styles.demoCtaActionText}>View Transcript</Text>
                </TouchableOpacity>
              ) : demoCallLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.demoCtaActionText}>
                  {demoCallState === 'failed' || (Boolean(currentDemoCallId) && !demoScriptReady)
                    ? 'Try Demo Again'
                    : 'Start Demo'}
                </Text>
              )}
            </View>
            </TouchableOpacity>
          </View>
          {isDemoHighlighted ? (
            <Text style={[styles.demoTooltip, { color: colors.textMuted }]}>Start with a demo to see how calling works</Text>
          ) : null}
        </Animated.View>
      ) : null}

      {/* Loading State */}
      {dashboardStats.loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading live stats...</Text>
        </View>
      )}

      {/* Error State */}
      {dashboardStats.error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.danger + '20', borderColor: colors.danger }]}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            ⚠️ {dashboardStats.error}
          </Text>
        </View>
      )}

      {/* Live Indicator */}
      {!dashboardStats.loading && !dashboardStats.error && (
        <View style={[styles.liveIndicator, { backgroundColor: colors.success + '20', borderRadius: radius.sm }]}> 
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.liveText, { color: colors.success }]}>Live Updates</Text>
        </View>
      )}

      {/* Today Activity - Calls in Progress */}
      <AppSection title="Today Activity" />
      <View style={styles.statsGrid}>
        {[
          { 
            label: 'In Progress', 
            value: dashboardStats.totalRunningCalls, 
            color: colors.primary,
            icon: '📞'
          },
          { 
            label: 'Pending', 
            value: dashboardStats.pendingLeads, 
            color: colors.info,
            icon: '⏳'
          },
          { 
            label: 'Completed', 
            value: dashboardStats.completedLeads, 
            color: colors.success,
            icon: '✅'
          },
          { 
            label: 'Failed', 
            value: dashboardStats.failedLeads, 
            color: colors.danger,
            icon: '❌'
          },
        ].map((item) => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={[styles.statValue, { color: item.color, fontSize: typography.h2 }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: typography.overline }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Batch Statistics */}
      <AppSection title="Batch Overview" />
      <View style={styles.statsGrid}>
        {[
          { 
            label: 'Total Batches', 
            value: dashboardStats.totalBatches, 
            color: colors.text,
            icon: '📊'
          },
          { 
            label: 'Running', 
            value: dashboardStats.runningBatches, 
            color: colors.primary,
            icon: '🏃'
          },
          { 
            label: 'Scheduled', 
            value: dashboardStats.scheduledBatches, 
            color: colors.warning,
            icon: '📅'
          },
          { 
            label: 'Completed', 
            value: dashboardStats.completedBatches, 
            color: colors.success,
            icon: '🎯'
          },
        ].map((item) => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={[styles.statValue, { color: item.color, fontSize: typography.h2 }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted, fontSize: typography.overline }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Wallet summary: reinforces system trust and transparency */}
      <TouchableOpacity 
        style={[styles.walletCard, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/wallet')}
        activeOpacity={0.8}
      >
        <View style={styles.walletHeader}>
          <View style={styles.walletLeft}>
            <Ionicons name="wallet" size={24} color="white" />
            <Text style={styles.walletLabel}>AI Wallet Balance</Text>
          </View>
          <View style={styles.liveIndicatorSmall}>
            <View style={styles.liveDotSmall} />
            <Text style={styles.liveTextSmall}>Live</Text>
          </View>
        </View>
        
        {walletLoading ? (
          <ActivityIndicator size="small" color="white" style={styles.walletLoader} />
        ) : (
          <>
            <Text style={styles.walletValue}>₹{availableBalance.toLocaleString()}</Text>
            <View style={styles.walletMeta}>
              <View style={styles.walletMetaItem}>
                <Text style={styles.walletMetaLabel}>Total: ₹{wallet?.balance.toLocaleString() || 0}</Text>
              </View>
              <View style={styles.walletMetaItem}>
                <Text style={styles.walletMetaLabel}>Locked: ₹{wallet?.lockedAmount.toLocaleString() || 0}</Text>
              </View>
            </View>
          </>
        )}
        
        <View style={styles.walletActions}>
          <RechargeButton variant="secondary" size="small" />
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => router.push('/wallet')}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <AppSection title="Live AI Insights" />
      <AppCard>
        <View style={styles.insightRow}>
          <View style={[styles.insightDot, { backgroundColor: colors.success }]} />
          <View style={styles.insightText}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Real-Time Monitoring</Text>
            <Text style={[styles.insightBody, { color: colors.textMuted }]}>
              {dashboardStats.totalLeads} total leads tracked • {dashboardStats.totalRunningCalls} calls in progress
            </Text>
          </View>
        </View>
        <View style={styles.insightRow}>
          <View style={[styles.insightDot, { backgroundColor: colors.info }]} />
          <View style={styles.insightText}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Batch Performance</Text>
            <Text style={[styles.insightBody, { color: colors.textMuted }]}>
              {dashboardStats.runningBatches} batches running • {dashboardStats.totalCompletedCalls} calls completed today
            </Text>
          </View>
        </View>
      </AppCard>

      <Modal
        visible={showDemoConfirmModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!demoCallLoading) {
            setShowDemoConfirmModal(false);
            setDemoFormError('');
          }
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Confirm Demo Recipient</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Review or edit details before placing demo call.</Text>

            <AppInput
              label="Name"
              placeholder="Lead name"
              value={demoTargetName}
              onChangeText={setDemoTargetName}
              autoCapitalize="words"
            />
            <AppInput
              label="Phone number"
              placeholder="9876543210"
              value={demoTargetPhone}
              onChangeText={(value) => setDemoTargetPhone(value.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />

            {demoFormError ? (
              <Text style={[styles.modalError, { color: colors.danger }]}>{demoFormError}</Text>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => {
                  if (!demoCallLoading) {
                    setShowDemoConfirmModal(false);
                    setDemoFormError('');
                  }
                }}
                disabled={demoCallLoading}
              >
                <Text style={[styles.modalCancelText, { color: colors.textMuted }]}>Cancel</Text>
              </Pressable>
              <AppButton
                title="Call Now"
                onPress={handleStartDemoCall}
                loading={demoCallLoading}
                style={styles.modalConfirmButton}
              />
            </View>
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 12,
  },
  toast: {
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invalidPassWrap: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  invalidPassText: {
    fontSize: 12,
    fontWeight: '600',
  },
  demoCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  demoCtaWrap: {
    position: 'relative',
  },
  demoOuterGlow: {
    position: 'absolute',
    top: -6,
    right: -6,
    bottom: -6,
    left: -6,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.28)',
    zIndex: 0,
  },
  demoCtaCardPremium: {
    shadowColor: '#6366f1',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  demoCtaCardHighlighted: {
    shadowColor: '#818cf8',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  demoCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 3,
  },
  demoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  demoCtaTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  demoCtaSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  demoQueueNotice: {
    fontSize: 10,
    marginTop: 5,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  demoCtaAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
    zIndex: 3,
  },
  demoCtaActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  demoGradientLayerA: {
    position: 'absolute',
    left: -70,
    top: -50,
    width: 240,
    height: 170,
    borderRadius: 120,
    backgroundColor: 'rgba(129,140,248,0.14)',
    zIndex: 1,
  },
  demoGradientLayerB: {
    position: 'absolute',
    right: -90,
    bottom: -65,
    width: 260,
    height: 190,
    borderRadius: 130,
    backgroundColor: 'rgba(59,130,246,0.12)',
    zIndex: 1,
  },
  demoGlowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(129,140,248,0.10)',
    zIndex: 2,
  },
  demoBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(79,70,229,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.25)',
    zIndex: 4,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338ca',
  },
  demoTooltip: {
    marginTop: -4,
    marginBottom: 10,
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 12,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
  },
  walletCard: {
    marginBottom: 18,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletLabel: {
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
  },
  liveIndicatorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  liveDotSmall: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4caf50',
  },
  liveTextSmall: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
  },
  walletLoader: {
    marginVertical: 16,
  },
  walletValue: {
    marginTop: 4,
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
  },
  walletMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  walletMetaItem: {
    flex: 1,
  },
  walletMetaLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  walletActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  viewDetailsText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  insightBody: {
    marginTop: 2,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '92%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  modalError: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmButton: {
    flex: 1,
  },
});
