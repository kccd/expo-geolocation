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
import android.location.Location

class ExpoGeolocationModule : Module() {
    
    companion object {
        const val TAG = "expo-geolocation"
        const val PERMISSION_REQUEST_CODE = 1234
    }

    private fun getCurrentActivity() = appContext.activityProvider?.currentActivity

    private val context: Context?
        get() = appContext.reactContext ?: getCurrentActivity()

    private val lm: LocationManager?
        get() = context?.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

    private val locationListener = android.location.LocationListener { location ->
        Log.d(TAG, "[${location.provider}] location listener change: ${location.latitude}, ${location.longitude}")
    }

    fun isGPSEnabled(): Boolean {
        return lm?.isProviderEnabled(LocationManager.GPS_PROVIDER) ?: false
    }

    fun isNetworkEnabled(): Boolean {
        return lm?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) ?: false
    }

    fun openLocationSettings() {
        val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context?.startActivity(intent)
    }

    @RequiresPermission(allOf = [Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION])
    fun startListener() {
        lm?.removeUpdates(locationListener)
        try {
            lm?.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 0f, locationListener)
            lm?.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000, 0f, locationListener)
        } catch (e: SecurityException) {
            Log.e(TAG, "Location permissions not granted", e)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting GPS", e)
        }
    }

    private fun stopListener() {
        lm?.removeUpdates(locationListener)
    }

    fun requestPermissions() {
        val activity = getCurrentActivity()
        if (activity == null) {
            Log.e(TAG, "No current activity to request permissions")
            return
        }

        ActivityCompat.requestPermissions(
            activity,
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            PERMISSION_REQUEST_CODE
        )

        // Background location permission is not required for Android versions below Q
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(Manifest.permission.ACCESS_BACKGROUND_LOCATION),
                PERMISSION_REQUEST_CODE
            )
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

    fun getCurrentPosition(msTimeSpec: Int): Map<String, Any> {
        if (!checkSelfPermission()) {
            Log.e(TAG, "Location Permissions not granted")
            return emptyMap()
        }
        val providers = lm?.allProviders ?: emptyList()
        val historyLocations = mutableMapOf<Long, Location>()
        val responseMap = mutableMapOf<String, Any>()
        val nTime = System.currentTimeMillis()

        Log.d(TAG, "All Provider: $providers")

        if (providers.contains(LocationManager.GPS_PROVIDER)) {
            val l1 = lm?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            if (l1 != null) {
                Log.d(
                    TAG,
                    "GPS Check: now($nTime) - gps.time(${l1.time})= ${nTime - l1.time}, msTimeSpec: $msTimeSpec"
                )
                if (nTime - l1.time < msTimeSpec) {
                    responseMap["latitude"] = l1.latitude
                    responseMap["longitude"] = l1.longitude
                    responseMap["provider"] = l1.provider.toString()
                    return responseMap
                }
                historyLocations[l1.time] = l1
            }
        }

        if (providers.contains(LocationManager.NETWORK_PROVIDER)) {
            val l3 = lm?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            if (l3 != null) {
                historyLocations[l3.time] = l3
            }
        }

        if (providers.contains(LocationManager.PASSIVE_PROVIDER)) {
            val l2 = lm?.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER)
            if (l2 != null) {
                historyLocations[l2.time] = l2
            }
        }

        val latestLocation = historyLocations.maxByOrNull { it.key }?.value
        if (latestLocation != null) {
            Log.d(
                TAG,
                "Latest Location: [${latestLocation.provider}] lTime: ${latestLocation.time} lat: ${latestLocation.latitude}, lng: ${latestLocation.longitude}"
            )

            responseMap["latitude"] = latestLocation.latitude
            responseMap["longitude"] = latestLocation.longitude
            responseMap["provider"] = latestLocation.provider.toString()
            return responseMap
        }

        Log.e(TAG, "Load All Providers Data is null")
        return emptyMap()
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoGeolocation")

        AsyncFunction("requestPermissions") { promise: Promise ->
            requestPermissions()
            promise.resolve(checkSelfPermission())
        }

         AsyncFunction("checkSelfPermission") { promise: Promise ->
            promise.resolve(checkSelfPermission())
        }

        AsyncFunction("isGPSEnabled") { promise: Promise ->
            promise.resolve(isGPSEnabled())
        }

        AsyncFunction("isNetworkEnabled") { promise: Promise ->
            promise.resolve(isNetworkEnabled())
        }

        AsyncFunction("start") { promise: Promise ->
            promise.resolve(startListener())
        }

        AsyncFunction("stop") { promise: Promise ->
            promise.resolve(stopListener())
        }

        AsyncFunction("openLocationSettings") { promise: Promise ->
            promise.resolve(openLocationSettings())
        }

        AsyncFunction("getCurrentPosition") { msTimeSpec: Int, promise: Promise ->
            val position = getCurrentPosition(msTimeSpec)
            if (position.isEmpty()) {
                promise.reject("NO_POSITION", "Could not retrieve current position", null)
            } else {
                promise.resolve(position)
            }
        }
        
    }
}