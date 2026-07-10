import type { NavigationProp, ParamListBase } from '@react-navigation/native';

/** Playbook lives on the root stack — tab navigators must reach up to open it. */
export function navigateToPlaybook(navigation: NavigationProp<ParamListBase>) {
  const parent = navigation.getParent();
  if (parent) {
    parent.navigate('Playbook');
    return;
  }
  navigation.navigate('Playbook');
}
