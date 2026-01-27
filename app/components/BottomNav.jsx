import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const navItems = [
  { key: 'home', label: 'Home', icon: '🏠', route: '/home' },
  { key: 'facilities', label: 'Facilities', icon: '🏢', route: '/shelters' },
  { key: 'contacts', label: 'Contacts', icon: '📞', route: '/contacts' },
  { key: 'profile', label: 'Profile', icon: '👤', route: '/profile' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);
  const isHelpActive = pathname.startsWith('/emergency');

  return (
    <View style={styles.container}>
      {leftItems.map((item) => {
        const isActive =
          pathname === item.route ||
          (item.route === '/home' && pathname === '/home1');
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.helpSlot}>
        <TouchableOpacity
          style={[styles.helpButton, isHelpActive && styles.helpButtonActive]}
          onPress={() => router.push('/emergency/type')}
          accessibilityRole="button"
          accessibilityLabel="Help"
          activeOpacity={0.85}
        >
          <Text style={styles.helpButtonText}>HELP</Text>
        </TouchableOpacity>
      </View>

      {rightItems.map((item) => {
        const isActive =
          pathname === item.route ||
          (item.route === '/home' && pathname === '/home1');
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  helpSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#DC143C',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  helpButtonActive: {
    backgroundColor: '#B0102E',
  },
  helpButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconActive: {
    fontSize: 28,
  },
  label: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  labelActive: {
    color: '#DC143C',
    fontWeight: '700',
  },
});
