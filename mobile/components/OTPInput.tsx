import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { ONBOARDING_SURFACE } from '../constants/onboardingTheme';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: boolean;
}

export default function OTPInput({ length = 6, onComplete, error = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    const newOtp = [...otp];

    if (text.length > 1) {
      const digits = text.slice(0, length).split('');
      digits.forEach((digit, i) => {
        if (i < length) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);

      const lastIndex = Math.min(digits.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();

      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => { inputRefs.current[index] = ref; }}
          style={[
            styles.input,
            error && styles.inputError,
            digit && styles.inputFilled,
          ]}
          value={digit}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoFocus={index === 0}
          caretHidden
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  input: {
    width: 48,
    height: 56,
    backgroundColor: ONBOARDING_SURFACE.fillElevated,
    borderWidth: 1,
    borderColor: ONBOARDING_SURFACE.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  inputFilled: {
    borderColor: ONBOARDING_SURFACE.borderSelected,
    backgroundColor: ONBOARDING_SURFACE.fillSelected,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
});
