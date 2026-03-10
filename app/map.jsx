import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import BottomNav from './components/BottomNav';

const BALAMBAN_SHELTERS = [
  { id: 's1', name: 'LAMAC Multi-Purpose', address: 'Aliwanay, Balamban, Cebu', latitude: 10.4848, longitude: 123.7187 },
  { id: 's2', name: 'Balamban Municipal Hall', address: 'Poblacion, Balamban, Cebu', latitude: 10.5048, longitude: 123.7143 },
  { id: 's3', name: 'Balamban NHS Gym', address: 'Poblacion, Balamban, Cebu', latitude: 10.5062, longitude: 123.7128 },
  { id: 's4', name: 'Buanoy Evacuation Center', address: 'Buanoy, Balamban, Cebu', latitude: 10.5212, longitude: 123.7012 },
  { id: 's5', name: 'Sunog Integrated School', address: 'Sunog, Balamban, Cebu', latitude: 10.4622, longitude: 123.7522 },
];

const EMERGENCY_COLORS = {
  fire: '#FF6B35',
  accident: '#FFA500',
  medical: '#4CAF50',
  police: '#2196F3',
};

const openInMaps = (lat, lon, label) => {
  const url = `https://www.google.com/maps?q=${lat},${lon}`;
  Linking.openURL(url).catch(() => {});
};

export default function MapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.latitude != null && d.longitude != null) {
            list.push({ id: docSnap.id, ...d });
          }
        });
        setIncidents(list);
      } catch (e) {
        setIncidents([]);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC143C" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Incidents & shelters in Balamban, Cebu — tap to open in Google Maps</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Shelters</Text>
        {BALAMBAN_SHELTERS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.card}
            onPress={() => openInMaps(s.latitude, s.longitude, s.name)}
          >
            <Text style={styles.cardIcon}>🏠</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{s.name}</Text>
              <Text style={styles.cardAddress}>{s.address}</Text>
            </View>
            <Text style={styles.openText}>Open in Maps →</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Incidents</Text>
        {incidents.length === 0 ? (
          <Text style={styles.emptyText}>No incidents with location</Text>
        ) : (
          incidents.map((inc) => {
            const color = EMERGENCY_COLORS[inc.type] || '#DC143C';
            return (
              <TouchableOpacity
                key={inc.id}
                style={[styles.card, { borderLeftColor: color }]}
                onPress={() => openInMaps(inc.latitude, inc.longitude, inc.typeLabel)}
              >
                <Text style={styles.cardIcon}>
                  {inc.type === 'fire' ? '🔥' : inc.type === 'accident' ? '🚗' : inc.type === 'police' ? '🚔' : '🏥'}
                </Text>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{inc.typeLabel || inc.type}</Text>
                  <Text style={styles.cardAddress} numberOfLines={2}>{inc.address || inc.description || 'No address'}</Text>
                </View>
                <Text style={styles.openText}>Open in Maps →</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={() => {
          if (location) {
            openInMaps(location.coords.latitude, location.coords.longitude, 'My location');
          } else {
            openInMaps(10.5048, 123.7143, 'Balamban center');
          }
        }}
      >
        <Text style={styles.myLocationText}>📍 Open my location in Maps</Text>
      </TouchableOpacity>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingTop: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 28, fontWeight: '800', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardIcon: { fontSize: 28, marginRight: 16 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  cardAddress: { fontSize: 13, color: '#666' },
  openText: { fontSize: 12, color: '#DC143C', fontWeight: '600', marginLeft: 8 },
  emptyText: { fontSize: 14, color: '#999', marginBottom: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#666' },
  myLocationButton: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
    backgroundColor: '#DC143C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  myLocationText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
