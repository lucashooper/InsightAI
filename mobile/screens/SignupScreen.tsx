import React from 'react';

export default function SignupScreen({ navigation }: any) {
  // Redirect to new multi-step signup flow
  React.useEffect(() => {
    navigation.replace('SignupUsername');
  }, []);

  // Show nothing while redirecting
  return null;
}
