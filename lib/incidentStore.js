// Prop/demo incident store - no backend required
let incidents = [];
let listeners = new Set();

export function getIncidents() {
  return [...incidents];
}

export function addIncident(data) {
  const id = 'local_' + Date.now();
  const item = {
    id,
    ...data,
    source: 'local',
    status: data.status || 'active',
    createdAt: data.createdAt || { toDate: () => new Date() },
  };
  incidents.unshift(item);
  listeners.forEach((fn) => fn());
  return id;
}

export function removeIncident(id) {
  incidents = incidents.filter((i) => i.id !== id);
  listeners.forEach((fn) => fn());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
