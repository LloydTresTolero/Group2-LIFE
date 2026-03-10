import { useRouter, useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';

export default function RescueTracking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const estimatedTime = params.estimatedTime || '21';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Rescue team is on the way</Text>
        <Text style={styles.bannerSubtitle}>
          Estimated arrival: {estimatedTime} mins
        </Text>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Map View</Text>
          <Text style={styles.mapSubtext}>
            Real-time tracking of rescue team location
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          💡 Your emergency has been reported. Rescue teams are en route to your
          location.
        </Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={async () => {
            try {
              await Share.share({
                message: 'I need emergency help. Rescue is on the way. Shared via LIFE Emergency App.',
                title: 'Emergency Alert - Share with trusted contacts',
              });
            } catch (e) {
              if (e.message && !e.message.includes('User did not share')) {
                // ignore
              }
            }
          }}
        >
          <Text style={styles.shareButtonText}>Share with trusted contacts</Text>
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
  banner: {
    backgroundColor: '#DC143C',
    padding: 20,
    paddingTop: 24,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  mapText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
