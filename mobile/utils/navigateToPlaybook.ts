import { CommonActions, type NavigationProp, type ParamListBase } from '@react-navigation/native';

/** Opens Protocols inside the Home tab stack so the bottom navbar stays visible. */
export function navigateToPlaybook(navigation: NavigationProp<ParamListBase>) {
  const action = CommonActions.navigate({
    name: 'MainTabs',
    params: {
      screen: 'Home',
      params: { screen: 'Playbook' },
    },
  });

  let nav: NavigationProp<ParamListBase> | undefined = navigation;
  while (nav) {
    const state = nav.getState?.();
    if (state?.routeNames?.includes('MainTabs')) {
      nav.dispatch(action);
      return;
    }
    nav = nav.getParent?.() as NavigationProp<ParamListBase> | undefined;
  }

  navigation.navigate('Playbook');
}
