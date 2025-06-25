import * as React from 'react';

import { ExpoGeolocationViewProps } from './ExpoGeolocation.types';

export default function ExpoGeolocationView(props: ExpoGeolocationViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
