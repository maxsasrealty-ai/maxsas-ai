import React from 'react';

import { useAuth } from '@/src/context/AuthContext';

type PressableChildProps = {
  onPress?: (...args: any[]) => void;
  disabled?: boolean;
};

type RequireAuthProps = {
  children: React.ReactElement<PressableChildProps>;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, openLoginModal } = useAuth();

  if (user) {
    return children;
  }

  const onPress = (...args: any[]) => {
    void args;
    openLoginModal();
  };

  return React.cloneElement(children, {
    ...children.props,
    onPress,
  });
}
