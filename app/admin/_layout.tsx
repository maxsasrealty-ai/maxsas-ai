import { useAuth } from '@/src/context/AuthContext';
import { db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Slot, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function AdminLayout() {
  const { user, authLoaded } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoaded) {
      if (!user) {
        router.replace('/login');
        return;
      }

      const checkAdminRole = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          router.replace('/(tabs)');
        }
        setLoading(false);
      };

      checkAdminRole();
    }
  }, [user, authLoaded, router]);

  if (loading || !authLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Checking admin status...</Text>
      </View>
    );
  }

  if (isAdmin) {
    return <Slot />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting...</Text>
    </View>
  );
}
