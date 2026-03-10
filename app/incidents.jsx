import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { collection, doc, getDocs, limit, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUserRole } from '../lib/useUserRole';

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

export default function Incidents() {
  const router = useRouter();
  const { isResponder, isAdmin } = useUserRole();
  const canUpdateStatus = isResponder || isAdmin;
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (incident) => {
    const next = incident.status === 'active' ? 'resolved' : 'active';
    setUpdatingId(incident.id);
    try {
      await updateDoc(doc(db, 'incidents', incident.id), {
        status: next,
        updatedAt: serverTimestamp(),
      });
      await loadIncidents();
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const incidentsRef = collection(db, 'incidents');
      const q = query(incidentsRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);

      const incidentsData = [];
      querySnapshot.forEach((doc) => {
        incidentsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setIncidents(incidentsData);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadIncidents();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recent Incidents</Text>
        <Text style={styles.subtitle}>Active emergency reports in your area</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC143C" />
          <Text style={styles.loadingText}>Loading incidents...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#DC143C"
            />
          }
        >
          {incidents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No incidents reported yet</Text>
              <Text style={styles.emptySubtext}>
                Emergency reports will appear here
              </Text>
            </View>
          ) : (
            incidents.map((incident) => {
              const color = EMERGENCY_COLORS[incident.type] || '#DC143C';
              const icon = EMERGENCY_ICONS[incident.type] || '🚨';

              return (
                <View
                  key={incident.id}
                  style={[styles.incidentCard, { borderLeftColor: color }]}
                >
                  <View style={styles.incidentHeader}>
                    <Text style={styles.incidentIcon}>{icon}</Text>
                    <View style={styles.incidentHeaderText}>
                      <Text style={styles.incidentType}>{incident.typeLabel || incident.type}</Text>
                      <Text style={styles.incidentTime}>
                        {formatTimestamp(incident.createdAt)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            incident.status === 'active' ? '#DC143C' : '#4CAF50',
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {incident.status === 'active' ? 'Active' : 'Resolved'}
                      </Text>
                    </View>
                  </View>

                  {incident.description && (
                    <Text style={styles.incidentDescription} numberOfLines={3}>
                      {incident.description}
                    </Text>
                  )}

                  {incident.address && (
                    <View style={styles.incidentLocation}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>{incident.address}</Text>
                    </View>
                  )}

                  {incident.reportedByEmail && (
                    <Text style={styles.reportedBy}>
                      Reported by: {incident.reportedByEmail}
                    </Text>
                  )}

                  <View style={styles.incidentActions}>
                    <TouchableOpacity
                      style={styles.shareIncidentButton}
                      onPress={async () => {
                        try {
                          await Share.share({
                            message: `Incident: ${incident.typeLabel || incident.type}\n${incident.description || ''}\n📍 ${incident.address || ''}${incident.latitude && incident.longitude ? `\n\nMap: https://www.google.com/maps?q=${incident.latitude},${incident.longitude}` : ''}\n\nShared via LIFE Emergency App`,
                            title: 'Emergency Incident',
                          });
                        } catch (e) {}
                      }}
                    >
                      <Text style={styles.shareIncidentText}>Share</Text>
                    </TouchableOpacity>
                    {canUpdateStatus && (
                    <TouchableOpacity
                      style={styles.updateStatusButton}
                      onPress={() => handleUpdateStatus(incident)}
                      disabled={updatingId === incident.id}
                    >
                      <Text style={styles.updateStatusText}>
                        {updatingId === incident.id
                          ? 'Updating...'
                          : incident.status === 'active'
                          ? 'Mark Resolved'
                          : 'Mark Active'}
                      </Text>
                    </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 These are recent emergency reports. Stay alert and avoid these
              areas if possible.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#DC143C',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#DC143C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#aaa',
    fontSize: 14,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#aaa',
  },
  incidentCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incidentIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  incidentHeaderText: {
    flex: 1,
  },
  incidentType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  incidentTime: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  incidentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#aaa',
    flex: 1,
  },
  reportedBy: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  incidentActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  shareIncidentButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  shareIncidentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  updateStatusButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  updateStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
  },
});
