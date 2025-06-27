import React, { useState } from 'react';
import { Button, Text, View, StyleSheet, ScrollView } from 'react-native';
import ExpoGeolocation from 'expo-geolocation';

export default function App() {
  const [location, setLocation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isGPSEnabled, setIsGPSEnabled] = useState<boolean | null>(null);
  const [isNetworkEnabled, setIsNetworkEnabled] = useState<boolean | null>(null);
  const [watching, setWatching] = useState<boolean>(false);

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
      const loc = await ExpoGeolocation.getCurrentPosition(10 * 1000); // 
      setLocation(loc);
    } catch (e: any) {
      setError(e?.message || 'Failed to get location');
    }
  };

  const checkGPSEnabled = async () => {
    try {
      const enabled = await ExpoGeolocation.isGPSEnabled();
      setIsGPSEnabled(enabled);
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

  const start = async () => {
    setError(null);
    try {
      await ExpoGeolocation.start();
      setWatching(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to start watch');
    }
  };

  const stop = async () => {
    setError(null);
    try {
      await ExpoGeolocation.stop();
      setWatching(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to stop watch');
    }
  };

  const openLocationSettings = async () => {
    try {
      await ExpoGeolocation.openLocationSettings();
    } catch (e: any) {
      setError(e?.message || 'Failed to open GPS settings');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>expo-geolocation</Text>
      </View>

      <View style={styles.statusRow}>
        {hasPermission !== null && (
          <View style={[styles.statusTag, hasPermission ? styles.statusGranted : styles.statusDenied]}>
            <Text style={styles.statusText}>
              {hasPermission ? 'Permission Granted' : 'Permission Denied'}
            </Text>
          </View>
        )}
        {isGPSEnabled !== null && (
          <View style={[styles.statusTag, isGPSEnabled ? styles.statusGranted : styles.statusDenied]}>
            <Text style={styles.statusText}>
              GPS: {isGPSEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        )}
        {isNetworkEnabled !== null && (
          <View style={[styles.statusTag, isNetworkEnabled ? styles.statusGranted : styles.statusDenied]}>
            <Text style={styles.statusText}>
              Network: {isNetworkEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        )}
      </View>

      {location && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Info</Text>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Text>Provider: {location.provider}</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <View style={styles.buttonContainer}>
          <Button title="Check Permission" color="#1976D2" onPress={checkPermissions} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Request Permission" color="#388E3C" onPress={requestPermissions} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Get Current Location" color="#0288D1" onPress={getLocation} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Check GPS" color="#FBC02D" onPress={checkGPSEnabled} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Check Network" color="#7B1FA2" onPress={checkNetworkEnabled} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Open Location Settings" color="#455A64" onPress={openLocationSettings} />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title={watching ? "Stop Listener" : "Start Listener"}
            color={watching ? "#D32F2F" : "#009688"}
            onPress={watching ? stop : start}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  headerBox: {
    width: '100%',
    backgroundColor: '#1976D2',
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 24,
    marginTop:24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusTag: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  statusGranted: {
    backgroundColor: '#C8E6C9',
  },
  statusDenied: {
    backgroundColor: '#FFCDD2',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#1976D2',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 8,
  },
  buttonContainer: {
    marginVertical: 7,
    borderRadius: 10,
    overflow: 'hidden',
  },
});