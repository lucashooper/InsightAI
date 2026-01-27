import React from 'react';

export default function SignupScreen({ navigation }: any) {
  // Redirect to email entry first (not username)
  React.useEffect(() => {
    navigation.replace('SignupEmail');
  }, []);

  // Show nothing while redirecting
  return null;
}
