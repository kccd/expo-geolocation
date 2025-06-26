import React, { useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Platform, ScrollView } from 'react-native';
import ExpoGeolocation from '../src';

export default function App() {
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isGpsEnabled, setIsGpsEnabled] = useState<boolean | null>(null);
  const [isNetworkEnabled, setIsNetworkEnabled] = useState<boolean | null>(null);
  const [watching, setWatching] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = ExpoGeolocation.addListener('watchPositionChanged', (data) => {
      setLocation(data);
    });
    return () => unsubscribe.remove();
  }, []);

  const checkPermissions = async () => {
    try {
      const hasPerms = await ExpoGeolocation.checkSelfPermission();
      setHasPermission(hasPerms);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to check permissions');
    }
  };

  const requestPermissions = async () => {
    try {
      await ExpoGeolocation.requestPermissions();
      await checkPermissions();
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to request permissions');
    }
  };

  const getLocation = async () => {
    setError(null);
    try {
      const hasPerms = await ExpoGeolocation.checkSelfPermission();
      if (!hasPerms) {
        setError('Location permission not granted');
        return;
      }
      const loc = await ExpoGeolocation.getCurrentPosition();
      setLocation(loc);
    } catch (e: any) {
      setError(e?.message || 'Failed to get location');
    }
  };

  const checkGpsEnabled = async () => {
    try {
      const enabled = await ExpoGeolocation.isGpsEnabled();
      setIsGpsEnabled(enabled);
    } catch (e: any) {
      setError(e?.message || 'Failed to check GPS');
    }
  };

  const checkNetworkEnabled = async () => {
    try {
      const enabled = await ExpoGeolocation.isNetworkEnabled();
      setIsNetworkEnabled(enabled);
    } catch (e: any) {
      setError(e?.message || 'Failed to check Network');
    }
  };

  const startWatch = async () => {
    setError(null);
    try {
      await ExpoGeolocation.watchGPS();
      setWatching(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to start watch');
    }
  };

  const stopWatch = async () => {
    setError(null);
    try {
      await ExpoGeolocation.stopWatchGPS();
      setWatching(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to stop watch');
    }
  };

  const openGpsSettings = async () => {
    try {
      await ExpoGeolocation.openGpsSettings();
    } catch (e: any) {
      setError(e?.message || 'Failed to open GPS settings');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>GPS Demo</Text>

      {Platform.OS === 'android' && (
        <>
          <View style={styles.buttonContainer}>
            <Button title="Check Permissions" onPress={checkPermissions} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Request Permissions" onPress={requestPermissions} />
          </View>
          {hasPermission !== null && (
            <Text style={styles.permissionText}>
              {hasPermission ? '✅ Permission granted' : '❌ Permission denied'}
            </Text>
          )}
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Get Current Location" onPress={getLocation} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Check GPS Enabled" onPress={checkGpsEnabled} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Check Network Enabled" onPress={checkNetworkEnabled} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Open GPS Settings" onPress={openGpsSettings} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={watching ? "Stop Watch GPS" : "Start Watch GPS"}
          onPress={watching ? stopWatch : startWatch}
        />
      </View>

      {isGpsEnabled !== null && (
        <Text style={styles.infoText}>
          GPS: {isGpsEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
      )}
      {isNetworkEnabled !== null && (
        <Text style={styles.infoText}>
          Network: {isNetworkEnabled ? '✅ Enabled' : '❌ Disabled'}
        </Text>
      )}

      {location && (
        <View style={styles.info}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 22,
    marginBottom: 20
  },
  buttonContainer: {
    marginVertical: 5,
    width: '80%'
  },
  info: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  },
  error: {
    color: 'red',
    marginTop: 20
  },
  permissionText: {
    marginVertical: 10,
    fontWeight: 'bold'
  },
  infoText: {
    marginTop: 10,
    fontWeight: 'bold'
  }
});