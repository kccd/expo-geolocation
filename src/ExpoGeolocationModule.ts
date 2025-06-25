import { NativeModule, requireNativeModule } from 'expo';

import { ExpoGeolocationModuleEvents } from './ExpoGeolocation.types';

declare class ExpoGeolocationModule extends NativeModule<ExpoGeolocationModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoGeolocationModule>('ExpoGeolocation');
