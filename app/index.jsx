import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#DC143C', '#FF1744', '#FF6B6B']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <Text style={styles.logoText}>LIFE</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  innerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
});
