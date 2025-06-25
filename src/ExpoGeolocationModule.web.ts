import { registerWebModule, NativeModule } from 'expo';

import { ExpoGeolocationModuleEvents } from './ExpoGeolocation.types';

class ExpoGeolocationModule extends NativeModule<ExpoGeolocationModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoGeolocationModule, 'ExpoGeolocationModule');
