# expo-geolocation

Expo geolocation is used to obtain recent latitude and longitude data information.

# Installation

Install the package:

```
npx expo install expo-geolocation
```

# Usage Example

> **Note:** You should call `start()` once (typically at app startup). Do not call it repeatedly.

```js
import ExpoGeolocation from 'expo-geolocation';

async function getLocation() {
  // Ensure start() has been called ONCE somewhere in your app lifecycle
  // await ExpoGeolocation.start(); // Only call once, e.g. on app launch

  // Optionally, check/request permissions
  // await ExpoGeolocation.requestPermissions();

  // Get the current position (timeout: 10 seconds for GPS)
  // If a fresh GPS location is available within 10s, it will be returned.
  // Otherwise, it will fallback to the most recent available location from other providers.
  const location = await ExpoGeolocation.getCurrentPosition(10 * 1000);
  console.log('Latitude:', location.latitude);
  console.log('Longitude:', location.longitude);
  console.log('Provider:', location.provider);
}
```

## API

- `start()`: Start the location service.
- `stop()`: Stop the location service.
- `getCurrentPosition(timeoutMs)`: Get the current location. If a GPS fix is available within the timeout (e.g. 10s), it is returned; otherwise, the most recent available location from other providers is returned.
- `requestPermissions()`: Request location permissions from the user.
- `checkSelfPermission()`: Check if location permissions are granted.
- `isGPSEnabled()`: Check if GPS is enabled.
- `isNetworkEnabled()`: Check if network location is enabled.
- `openLocationSettings()`: Open the device's location settings.

## LocationData

The returned location object has the following structure:

```ts
{
  latitude: number;
  longitude: number;
  provider: string;
}
```