import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginScreen({ navigation }: any) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auxiliary.loginSimple.title')}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('auxiliary.common.email')}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder={t('auxiliary.common.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{t('auxiliary.common.signIn')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#8b5cf6',
    fontWeight: '600',
    textAlign: 'center',
  },
});
