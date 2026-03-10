import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from './components/BottomNav';

const FAMILY_CONTACTS = [
  { name: 'Mama', number: '+639171234567', icon: '👤' },
  { name: 'Papa', number: '+639181234567', icon: '👤' },
  { name: 'Ate', number: '+639191234567', icon: '👤' },
  { name: 'Kuya', number: '+639201234567', icon: '👤' },
  { name: 'Uncle', number: '+639211234567', icon: '👤' },
  { name: 'Aunty', number: '+639221234567', icon: '👤' },
];

export default function Contacts() {
  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Contacts</Text>
        <Text style={styles.subtitle}>Trusted family members</Text>
      </View>

      <View style={styles.contactsList}>
        {FAMILY_CONTACTS.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactCard}
            onPress={() => handleCall(contact.number)}
          >
            <Text style={styles.contactIcon}>{contact.icon}</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactNumber}>{contact.number}</Text>
            </View>
            <Text style={styles.callButton}>📞</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Tap any contact to call immediately. In a real emergency, always
          call your local emergency services first.
        </Text>
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
  header: {
    padding: 24,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  contactsList: {
    flex: 1,
    padding: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC143C',
  },
  contactIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 14,
    color: '#666',
  },
  callButton: {
    fontSize: 24,
  },
  infoBox: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    margin: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});
