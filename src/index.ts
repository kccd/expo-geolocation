// Reexport the native module. On web, it will be resolved to ExpoGeolocationModule.web.ts
// and on native platforms to ExpoGeolocationModule.ts
export { default } from './ExpoGeolocationModule';
export * from  './ExpoGeolocation.types';
