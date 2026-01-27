import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import BottomNav from '../components/BottomNav';

const EMERGENCY_TYPES = [
  {
    id: 'fire',
    label: 'Fire',
    icon: '🔥',
    color: '#FF6B35',
  },
  {
    id: 'accident',
    label: 'Accident',
    icon: '🚗',
    color: '#FFA500',
  },
  {
    id: 'police',
    label: 'Police',
    icon: '🚔',
    color: '#2196F3',
  },
  {
    id: 'medical',
    label: 'Medical',
    icon: '🏥',
    color: '#4CAF50',
  },
];

export default function EmergencyType() {
  const router = useRouter();
  const [address, setAddress] = useState('');

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      try {
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          const addrString = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''} ${addr.postalCode || ''}, ${addr.country || ''}`.trim();
          setAddress(addrString || 'Getting address...');
        }
      } catch (e) {
        setAddress('Address not available');
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const handleSelectType = (type) => {
    router.push({
      pathname: '/emergency/report',
      params: { type: type.id, typeLabel: type.label },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Emergency</Text>
        <Text style={styles.subtitle}>Common Emergencies</Text>

        <View style={styles.gridContainer}>
          {EMERGENCY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeButton, { backgroundColor: type.color }]}
              onPress={() => handleSelectType(type)}
              activeOpacity={0.8}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={styles.typeLabel}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Your current address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>👤</Text>
            <Text style={styles.addressText}>
              {address || 'Getting location...'}
            </Text>
          </View>
        </View>
      </View>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  typeButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  typeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  addressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 'auto',
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
