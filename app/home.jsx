import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, deleteDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../firebase';
import BottomNav from './components/BottomNav';

const EMERGENCY_COLORS = {
  fire: '#FF6B35',
  accident: '#FFA500',
  medical: '#4CAF50',
  police: '#2196F3',
};

const EMERGENCY_ICONS = {
  fire: '🔥',
  accident: '🚗',
  medical: '🏥',
  police: '🚔',
};

export default function HomePage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [hasActiveEmergency, setHasActiveEmergency] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('medical');

  const loadIncidents = useCallback(async () => {
    try {
      const incidentsRef = collection(db, 'incidents');
      const user = auth.currentUser;
      const q = query(incidentsRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);

      const incidentsData = [];
      let hasActive = false;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (user && data.reportedBy === user.uid) {
          incidentsData.push({
            id: docSnap.id,
            ...data,
          });
          if (data.status === 'active') hasActive = true;
        }
      });

      setIncidents(incidentsData);
      setHasActiveEmergency(hasActive);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 30000);
    return () => clearInterval(interval);
  }, [loadIncidents]);

  const handleDelete = async (incidentId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'incidents', incidentId));
              await loadIncidents();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report.');
              console.error('Error deleting:', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (incident) => {
    setEditingIncident(incident);
    setEditDescription(incident.description || '');
    setEditType(incident.type || 'medical');
  };

  const handleUpdate = async () => {
    if (!editDescription.trim()) {
      Alert.alert('Error', 'Description cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'incidents', editingIncident.id), {
        description: editDescription.trim(),
        type: editType,
        updatedAt: serverTimestamp(),
      });
      setEditingIncident(null);
      setEditDescription('');
      await loadIncidents();
    } catch (error) {
      Alert.alert('Error', 'Failed to update report.');
      console.error('Error updating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDescription.trim()) {
      Alert.alert('Error', 'Description cannot be empty.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a report.');
      router.replace('/login');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'incidents'), {
        type: newType,
        typeLabel: newType.charAt(0).toUpperCase() + newType.slice(1),
        description: newDescription.trim(),
        address: 'Your location',
        reportedBy: user.uid,
        reportedByEmail: user.email,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewDescription('');
      setNewType('medical');
      await loadIncidents();
    } catch (error) {
      Alert.alert('Error', 'Failed to create report.');
      console.error('Error creating:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredIncidents = selectedFilter
    ? incidents.filter((inc) => inc.type === selectedFilter)
    : incidents;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {hasActiveEmergency && (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyBannerTitle}>Emergency</Text>
          <Text style={styles.emergencyBannerSubtitle}>On the way!</Text>
          <Text style={styles.emergencyBannerText}>
            Rescue is on the way!
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          {['fire', 'accident', 'medical', 'police'].map((type) => {
            const isSelected = selectedFilter === type;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  isSelected && styles.filterButtonActive,
                ]}
                onPress={() =>
                  setSelectedFilter(isSelected ? null : type)
                }
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    isSelected && styles.filterButtonTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredIncidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports to display</Text>
            <Text style={styles.emptySubtext}>Tap "+ Add" to create a new report</Text>
          </View>
        ) : (
          filteredIncidents.map((incident) => {
            const color = EMERGENCY_COLORS[incident.type] || '#DC143C';
            const icon = EMERGENCY_ICONS[incident.type] || '🚨';

            return (
              <View key={incident.id} style={[styles.incidentCard, { borderLeftColor: color }]}>
                <View style={styles.incidentHeader}>
                  <Text style={styles.incidentIcon}>{icon}</Text>
                  <View style={styles.incidentHeaderText}>
                    <Text style={styles.incidentType}>
                      {incident.typeLabel || incident.type} Alert
                    </Text>
                    <Text style={styles.incidentTime}>
                      Status: {incident.status === 'active' ? 'Active' : 'Resolved'}. {formatTimestamp(incident.createdAt)}
                    </Text>
                  </View>
                </View>
                {incident.description && (
                  <Text style={styles.incidentDescription} numberOfLines={3}>
                    {incident.description}
                  </Text>
                )}
                {incident.address && (
                  <Text style={styles.incidentLocation}>
                    📍 {incident.address}
                  </Text>
                )}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(incident)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(incident.id)}
                  >
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Report</Text>
            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {['fire', 'accident', 'medical', 'police'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newType === type && styles.typeOptionSelected,
                  ]}
                  onPress={() => setNewType(type)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      newType === type && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewDescription('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleAdd}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveModalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editingIncident !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingIncident(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Report</Text>
            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {['fire', 'accident', 'medical', 'police'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    editType === type && styles.typeOptionSelected,
                  ]}
                  onPress={() => setEditType(type)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      editType === type && styles.typeOptionTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={editDescription}
              onChangeText={setEditDescription}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setEditingIncident(null);
                  setEditDescription('');
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveModalButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emergencyBanner: {
    backgroundColor: '#DC143C',
    padding: 16,
    paddingTop: 20,
  },
  emergencyBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  emergencyBannerSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  emergencyBannerText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#DC143C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#ccc',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#DC143C',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: '#DC143C',
    borderColor: '#DC143C',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelModalButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveModalButton: {
    backgroundColor: '#DC143C',
  },
  saveModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  incidentCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC143C',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  incidentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  incidentHeaderText: {
    flex: 1,
  },
  incidentType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  incidentTime: {
    fontSize: 11,
    color: '#666',
  },
  incidentDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
  },
  incidentLocation: {
    fontSize: 11,
    color: '#888',
  },
});
