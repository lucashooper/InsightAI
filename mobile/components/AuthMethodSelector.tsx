import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

interface AuthMethodSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmail: () => void;
  onSelectApple?: () => void;
  onSelectGoogle?: () => void;
}

export default function AuthMethodSelector({
  visible,
  onClose,
  onSelectEmail,
  onSelectApple,
  onSelectGoogle,
}: AuthMethodSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheet}>
              {/* Handle Bar */}
              <View style={styles.handleBar} />

              {/* Title */}
              <Text style={styles.title}>Sign In</Text>

              {/* Sign in with Apple */}
              {onSelectApple && (
                <TouchableOpacity
                  style={[styles.button, styles.appleButton]}
                  onPress={onSelectApple}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-apple" size={24} color="#fff" />
                  <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                </TouchableOpacity>
              )}

              {/* Sign in with Google */}
              {onSelectGoogle && (
                <TouchableOpacity
                  style={[styles.button, styles.googleButton]}
                  onPress={onSelectGoogle}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={24} color="#000" />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>
              )}

              {/* Continue with Email */}
              <TouchableOpacity
                style={[styles.button, styles.emailButton]}
                onPress={onSelectEmail}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={24} color="#000" />
                <Text style={styles.emailButtonText}>Continue with email</Text>
              </TouchableOpacity>

              {/* Terms */}
              <Text style={styles.terms}>
                By continuing you agree to our{'\n'}
                <Text 
                  style={styles.termsLink}
                  onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
                >
                  Terms of Service
                </Text> and{' '}
                <Text 
                  style={styles.termsLink}
                  onPress={() => Linking.openURL('https://insightjournal.ai/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 380,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: '#f5f5f5',
  },
  emailButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  termsLink: {
    color: '#8b5cf6',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
