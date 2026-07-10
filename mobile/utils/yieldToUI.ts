import { InteractionManager } from 'react-native';

export function yieldToUI(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(resolve, 0);
    });
  });
}
