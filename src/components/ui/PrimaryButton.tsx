import { StyleProp, ViewStyle } from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const PrimaryButton = ({
  title,
  onPress,
  disabled,
  loading,
  style,
}: PrimaryButtonProps) => {
  return (
    <AppButton
      title={title}
      onPress={onPress}
      variant="primary"
      disabled={disabled}
      loading={loading}
      style={style}
    />
  );
};