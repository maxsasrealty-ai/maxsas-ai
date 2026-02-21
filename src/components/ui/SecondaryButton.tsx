import { StyleProp, ViewStyle } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';

type SecondaryButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const SecondaryButton = ({
  title,
  onPress,
  disabled,
  loading,
  style,
}: SecondaryButtonProps) => {
  return (
    <AppButton
      title={title}
      onPress={onPress}
      variant="secondary"
      disabled={disabled}
      loading={loading}
      style={style}
    />
  );
};