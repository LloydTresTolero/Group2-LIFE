import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebase';

const EMERGENCY_COLORS = {
  fire: '#FF6B35',
  accident: '#FFA500',
  medical: '#4CAF50',
  police: '#2196F3',
};

export default function EmergencyReport() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const emergencyType = params.type || 'medical';
  const typeLabel = params.typeLabel || 'Emergency';

  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to report an emergency.'
        );
        setGettingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);

      
      try {
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];
          const addrString = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
          setAddress(addrString || 'Address not available');
        }
      } catch (e) {
        setAddress('Address not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please try again.');
      console.error('Location error:', error);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Error', 'Location is required to submit an emergency report.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description of the emergency.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to report an emergency.');
        router.replace('/login');
        return;
      }

     
      const incidentData = {
        type: emergencyType,
        typeLabel: typeLabel,
        description: description.trim(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address,
        reportedBy: user.uid,
        reportedByEmail: user.email,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'incidents'), incidentData);

      router.replace({
        pathname: '/emergency/rescue',
        params: { estimatedTime: '21' },
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit emergency report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const emergencyColor = EMERGENCY_COLORS[emergencyType] || '#DC143C';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { borderColor: emergencyColor }]}>
          <Text style={styles.headerTitle}>{typeLabel} Emergency</Text>
          <Text style={styles.headerSubtitle}>Report your emergency</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          {gettingLocation ? (
            <View style={styles.locationLoading}>
              <ActivityIndicator size="small" color={emergencyColor} />
              <Text style={styles.locationText}>Getting your location...</Text>
            </View>
          ) : location ? (
            <View>
              <Text style={styles.locationText}>
                {address || 'Address not available'}
              </Text>
              <Text style={styles.coordinatesText}>
                {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.getLocationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.getLocationButtonText}>Get Location</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe the emergency situation..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: emergencyColor }]}
          onPress={handleSubmit}
          disabled={loading || !location || gettingLocation}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>🚨 Submit Emergency Report</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  getLocationButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  getLocationButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  refreshButtonText: {
    color: '#333',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
