package expo.modules.geolocation


import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.AppContext

import android.Manifest
import android.content.Context
import android.content.Intent
import android.location.LocationManager
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.widget.Toast
import androidx.annotation.RequiresPermission
import androidx.core.app.ActivityCompat

class ExpoGeolocationModule : Module() {
    
    companion object {
        const val TAG = "location"
        const val PERMISSION_REQUEST_CODE = 1234
    }

    private fun getCurrentActivity() = appContext.activityProvider?.currentActivity

    private val context: Context?
        get() = appContext.reactContext ?: getCurrentActivity()

    private val lm: LocationManager?
        get() = context?.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

    private val locationListener = android.location.LocationListener { location ->
        Log.d(TAG, "watch location change: ${location.latitude}, ${location.longitude}")
        sendEvent(
            "watchPositionChanged",
            mapOf(
                "latitude" to location.latitude,
                "longitude" to location.longitude
            )
        )
    }
    
    fun showToast(msg: String) {
        Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
    }

    fun isGpsEnabled(): Boolean {
        return lm?.isProviderEnabled(LocationManager.GPS_PROVIDER) ?: false
    }

    fun isNetworkEnabled(): Boolean {
        return lm?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ?: false
    }

    fun openGpsSettings() {
        val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context?.startActivity(intent)
    }

    @RequiresPermission(allOf = [Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION])
    fun watchGPS() {
        lm?.removeUpdates(locationListener)
        try {
            lm?.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 0f, locationListener)
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permissions not granted", e)
            showToast("Location permissions not granted")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting GPS", e)
            showToast("Error starting GPS: ${e.message}")
        }
    }

    private fun stopWatchGPS() {
        lm?.removeUpdates(locationListener)
    }

    fun requestPermissions() {
        val activity = getCurrentActivity()
        if (activity != null) {
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ),
                PERMISSION_REQUEST_CODE
            )
        } else {
            Log.e(TAG, "No current activity to request permissions")
        }
    }

    fun checkSelfPermission(): Boolean {
        val fineLocation = ActivityCompat.checkSelfPermission(
            context ?: return false,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        val coarseLocation = ActivityCompat.checkSelfPermission(
            context ?: return false,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED

        return fineLocation && coarseLocation
    }

    fun getCurrentPosition(): Map<String, Double> {
        if (!checkSelfPermission()) {
            Log.e(TAG, "Location Permissions not granted")
            return emptyMap()
        }

        val providers = lm?.allProviders ?: emptyList()

        Log.d(TAG, "All Provider: $providers")

        if (providers.contains(LocationManager.GPS_PROVIDER)) {
            Log.d(TAG, "GPS Provider Loader")

            val l = lm?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            Log.d(TAG, "GPS Location: $l")

            if (l != null) {
                return mapOf(
                    "latitude" to l.latitude,
                    "longitude" to l.longitude
                )
            }
        }

        if (providers.contains(LocationManager.PASSIVE_PROVIDER)) {
            Log.d(TAG, "Passive Provider Loader")

            val l = lm?.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)
            Log.d(TAG, "Passive Location: $l")

            if (l != null) {
                return mapOf(
                    "latitude" to l.latitude,
                    "longitude" to l.longitude
                )
            }
        }

        if (providers.contains(LocationManager.NETWORK_PROVIDER)) {
            Log.d(TAG, "Network Provider Loader")

            val l = lm?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            Log.d(TAG, "Network Location: $l")

            if (l != null) {
                return mapOf(
                    "latitude" to l.latitude,
                    "longitude" to l.longitude
                )
            }
        }

        Log.e(TAG, "Load All Providers Data is null")
        return emptyMap()
    }

    
    

    override fun definition() = ModuleDefinition {
        Name("ExpoGeolocation")

        Events("watchPositionChanged")

        AsyncFunction("requestPermissions") { promise: Promise ->
            requestPermissions()
            promise.resolve(checkSelfPermission())
        }

         AsyncFunction("checkSelfPermission") { promise: Promise ->
            promise.resolve(checkSelfPermission())
        }

        AsyncFunction("isGpsEnabled") { promise: Promise ->
            promise.resolve(isGpsEnabled())
        }

        AsyncFunction("isNetworkEnabled") { promise: Promise ->
            promise.resolve(isNetworkEnabled())
        }

        AsyncFunction("watchGPS") { promise: Promise ->
            promise.resolve(watchGPS())
        }

        AsyncFunction("stopWatchGPS") { promise: Promise ->
            promise.resolve(stopWatchGPS())
        }

        AsyncFunction("openGpsSettings") { promise: Promise ->
            promise.resolve(openGpsSettings())
        }

        AsyncFunction("getCurrentPosition") { promise: Promise ->
            val position = getCurrentPosition()
            if (position.isEmpty()) {
                promise.reject("NO_POSITION", "Could not retrieve current position", null)
            } else {
                promise.resolve(position)
            }
        }
        
    }
}