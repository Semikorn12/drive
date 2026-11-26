import { Alert, Platform } from 'react-native';

/** Destructive yes/no question. Native alert on the phone, browser dialog on the web (Alert is a no-op there). */
export function confirmDestructive(opts: { title: string; text: string; confirm: string; cancel: string }): Promise<boolean> {
  if (Platform.OS === 'web') {
    const ok = typeof window !== 'undefined' && typeof window.confirm === 'function' ? window.confirm(`${opts.title}\n\n${opts.text}`) : false;
    return Promise.resolve(ok);
  }
  return new Promise((resolve) => {
    Alert.alert(
      opts.title,
      opts.text,
      [
        { text: opts.cancel, style: 'cancel', onPress: () => resolve(false) },
        { text: opts.confirm, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
