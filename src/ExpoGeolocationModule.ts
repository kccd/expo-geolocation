import { NativeModule, requireNativeModule } from 'expo';
import type { LocationData, ExpoGeolocationModuleEvents } from "./ExpoGeolocation.types";

declare class ExpoGeolocationModule extends NativeModule<ExpoGeolocationModuleEvents> {
  requestPermissions(): Promise<boolean>;
  checkSelfPermission(): Promise<boolean>;
  isGpsEnabled(): Promise<boolean>;
  isNetworkEnabled(): Promise<boolean>;
  watchGPS(): Promise<void>;
  stopWatchGPS(): Promise<void>;
  openGpsSettings(): Promise<void>;
  getCurrentPosition(): Promise<LocationData>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoGeolocationModule>('ExpoGeolocation');
