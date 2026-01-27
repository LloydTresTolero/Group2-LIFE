import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import * as Location from 'expo-location';
import BottomNav from './components/BottomNav';

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
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
      setLocation(location);

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

  const handleEmergencyAlert = () => {
    router.push('/emergency/type');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#DC143C', '#FF1744', '#FF6B6B']}
        style={styles.gradientTop}
      >
        <View style={styles.topContent}>
          <Text style={styles.questionText}>Are you in an Emergency?</Text>
        </View>
      </LinearGradient>

      <View style={styles.mainContent}>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleEmergencyAlert}
          activeOpacity={0.8}
        >
          <Text style={styles.helpButtonText}>HELP</Text>
        </TouchableOpacity>

        <Text style={styles.emergencyText}>Emergency EM</Text>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Your current address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>👤</Text>
            <Text style={styles.addressText}>
              {address || 'Getting location...'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewActivitiesButton}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.viewActivitiesText}>View Recent Activities →</Text>
        </TouchableOpacity>
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
  gradientTop: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  topContent: {
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  helpButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#DC143C',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: '#fff',
  },
  helpButtonText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  addressContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
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
  viewActivitiesButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  viewActivitiesText: {
    fontSize: 14,
    color: '#DC143C',
    fontWeight: '600',
    textAlign: 'center',
  },
});
