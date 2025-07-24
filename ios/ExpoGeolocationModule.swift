import ExpoModulesCore
import CoreLocation

class GeolocationModule: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var currentPosition: CLLocation?
    @Published private(set) var permissionStatus: CLAuthorizationStatus = .notDetermined
    @Published private(set) var isRunning = false
    
    private let locationManager: CLLocationManager
    
    override init() {
        locationManager = CLLocationManager()
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        permissionStatus = locationManager.authorizationStatus
    }
    
    // MARK: - Public API
    
    func requestPermissions() {
      return locationManager.requestAlwaysAuthorization()
    }
    
    func checkSelfPermission() -> CLAuthorizationStatus {
        return locationManager.authorizationStatus
    }
    
    func isGpsEnabled() -> Bool {
        return CLLocationManager.locationServicesEnabled()
    }
    
    func isNetworkEnabled() -> Bool {
        return true
    }
    
    func openLocationSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }
    
    func getCurrentPosition() -> CLLocation? {
        return currentPosition
    }
    
    func start() {
        locationManager.startUpdatingLocation()
        isRunning = true
    }
    
    func stop() {
        locationManager.stopUpdatingLocation()
        isRunning = false
    }
    
    // MARK: - CLLocationManagerDelegate
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        currentPosition = locations.last
    }
    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        permissionStatus = manager.authorizationStatus
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location manager error: \(error.localizedDescription)")
    }
}

public class ExpoGeolocationModule: Module {
  var locationManager: CLLocationManager?
  var lastLocation: CLLocation?
  var locationPromise: Promise?

  private var geo = GeolocationModule()

  public func definition() -> ModuleDefinition {
    Name("ExpoGeolocation")

    // MARK: - Expo Modules Core Functions

    AsyncFunction("requestPermissions") { (promise: Promise) in
      promise.resolve(geo.requestPermissions())
    }

    AsyncFunction("checkSelfPermission") { () -> Bool in
      let status = geo.checkSelfPermission()
      return status == .authorizedWhenInUse || status == .authorizedAlways
    }

    AsyncFunction("isGPSEnabled") { () -> Bool in
      return geo.isGpsEnabled()
    }

    AsyncFunction("isNetworkEnabled") { () -> Bool in
      return geo.isNetworkEnabled()
    }

    AsyncFunction("openLocationSettings") { () in
     geo.openLocationSettings()
    }

    AsyncFunction("start") { () in
     geo.start()
    }

    AsyncFunction("stop") { () in
      geo.stop()
    }

    AsyncFunction("getCurrentPosition") { (msTimeSpec: Int, promise: Promise) in
      if let location = geo.getCurrentPosition() {
          promise.resolve([
              "latitude": location.coordinate.latitude,
              "longitude": location.coordinate.longitude,
              "provider": "ios"
          ])
      } else {
          promise.reject("NO_POSITION", "Location not available")
      }
    }
  }
}
