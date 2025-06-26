export type LocationData = {
  latitude: number;
  longitude: number;
};

export type WatchPositionChangedCallback = (data: LocationData) => void;

export type ExpoGeolocationModuleEvents = {
  watchPositionChanged: WatchPositionChangedCallback
};
