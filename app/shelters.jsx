import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import BottomNav from './components/BottomNav';

// Evacuation centers in Balamban, Cebu, Philippines
const SAMPLE_SHELTERS = [
  {
    id: '1',
    name: 'LAMAC Multi-Purpose Center',
    address: 'Aliwanay, Balamban, Cebu',
    capacity: 400,
    distance: null,
    latitude: 10.4848,
    longitude: 123.7187,
  },
  {
    id: '2',
    name: 'Balamban Municipal Hall (CPAC)',
    address: 'Poblacion, Balamban, Cebu',
    capacity: 300,
    distance: null,
    latitude: 10.5048,
    longitude: 123.7143,
  },
  {
    id: '3',
    name: 'Balamban National High School Gym',
    address: 'Poblacion, Balamban, Cebu',
    capacity: 500,
    distance: null,
    latitude: 10.5062,
    longitude: 123.7128,
  },
  {
    id: '4',
    name: 'Buanoy Barangay Evacuation Center',
    address: 'Buanoy, Balamban, Cebu',
    capacity: 200,
    distance: null,
    latitude: 10.5212,
    longitude: 123.7012,
  },
  {
    id: '5',
    name: 'Sunog Integrated School',
    address: 'Sunog, Balamban, Cebu',
    capacity: 250,
    distance: null,
    latitude: 10.4622,
    longitude: 123.7522,
  },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Shelters() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [shelters, setShelters] = useState(SAMPLE_SHELTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocationAndCalculateDistances();
  }, []);

  const getLocationAndCalculateDistances = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const userLat = location.coords.latitude;
      const userLon = location.coords.longitude;

      const sheltersWithDistance = shelters.map((shelter) => {
        const lat = shelter.latitude ?? userLat + 0.01;
        const lon = shelter.longitude ?? userLon + 0.01;
        const distance = calculateDistance(userLat, userLon, lat, lon);
        return {
          ...shelter,
          distance,
          latitude: lat,
          longitude: lon,
        };
      });

      sheltersWithDistance.sort((a, b) => a.distance - b.distance);
      setShelters(sheltersWithDistance);
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Facilities</Text>
            <Text style={styles.subtitle}>Evacuation shelters in Balamban, Cebu</Text>
          </View>
          <TouchableOpacity
            style={styles.mapLinkButton}
            onPress={() => router.push('/map')}
          >
            <Text style={styles.mapLinkText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC143C" />
          <Text style={styles.loadingText}>Finding nearby facilities...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!location && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Location permission required to show distances
              </Text>
            </View>
          )}

          {shelters.map((shelter) => (
            <View key={shelter.id} style={styles.shelterCard}>
              <View style={styles.shelterHeader}>
                <Text style={styles.shelterIcon}>🏠</Text>
                <View style={styles.shelterInfo}>
                  <Text style={styles.shelterName}>{shelter.name}</Text>
                  <Text style={styles.shelterAddress}>{shelter.address}</Text>
                </View>
              </View>
              <View style={styles.shelterDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Capacity:</Text>
                  <Text style={styles.detailValue}>{shelter.capacity} people</Text>
                </View>
                {shelter.distance !== null && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Distance:</Text>
                    <Text style={styles.detailValue}>
                      {shelter.distance < 1
                        ? `${(shelter.distance * 1000).toFixed(0)} m`
                        : `${shelter.distance.toFixed(2)} km`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 In an emergency, proceed to the nearest facility. These
              locations are equipped to handle evacuations and provide safety.
            </Text>
          </View>
        </ScrollView>
      )}

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#DC143C',
    borderRadius: 12,
  },
  mapLinkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  shelterCard: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC143C',
  },
  shelterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shelterIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  shelterInfo: {
    flex: 1,
  },
  shelterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  shelterAddress: {
    fontSize: 14,
    color: '#666',
  },
  shelterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    color: '#2e7d32',
    fontSize: 13,
    lineHeight: 20,
  },
});
