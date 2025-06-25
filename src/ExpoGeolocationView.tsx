import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoGeolocationViewProps } from './ExpoGeolocation.types';

const NativeView: React.ComponentType<ExpoGeolocationViewProps> =
  requireNativeView('ExpoGeolocation');

export default function ExpoGeolocationView(props: ExpoGeolocationViewProps) {
  return <NativeView {...props} />;
}
