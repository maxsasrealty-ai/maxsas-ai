import { useAppTheme } from '@/src/theme/use-app-theme';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

type AppInputProps = {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  maxLength?: number;
  editable?: boolean;
  autoComplete?: string;
  autoCorrect?: boolean;
  spellCheck?: boolean;
};

export const AppInput = (props: AppInputProps) => {
  const {
    label,
    placeholder,
    secureTextEntry,
    value,
    onChangeText,
    keyboardType = 'default',
    autoCapitalize = 'none',
    rightIcon,
    onRightIconPress,
    containerStyle,
    maxLength,
    editable = true,
    autoComplete,
    autoCorrect,
    spellCheck,
  } = props;
  const { colors, spacing, radius, typography } = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              marginBottom: spacing.xs,
              fontSize: typography.body,
            },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            minHeight: 52,
          },
        ]}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            {
              color: colors.text,
              paddingHorizontal: spacing.md,
              fontSize: typography.title,
            },
          ]}
          maxLength={maxLength}
          editable={editable}
          autoComplete={autoComplete as any}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.icon}>
            <Text style={[styles.iconText, { color: colors.textMuted }]}>{rightIcon.includes('off') ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
  },
  icon: {
    paddingHorizontal: 12,
  },
  iconText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
