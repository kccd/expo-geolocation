import { NativeModule, requireNativeModule } from 'expo';
import type { LocationData } from "./ExpoGeolocation.types";

declare class ExpoGeolocationModule extends NativeModule {
  requestPermissions(): Promise<boolean>;
  checkSelfPermission(): Promise<boolean>;
  isGpsEnabled(): Promise<boolean>;
  isNetworkEnabled(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  openLocationSettings(): Promise<void>;
  getCurrentPosition(msTimeSpec: number): Promise<LocationData>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoGeolocationModule>('ExpoGeolocation');
