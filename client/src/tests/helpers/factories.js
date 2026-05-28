let counter = 0;
const uid = () => `${++counter}`;

export const createAppointment = (overrides = {}) => ({
  _id: uid(),
  patient: { _id: '1', name: 'John Patient' },
  doctor: { _id: '3', name: 'Dr. Michael Johnson' },
  appointmentDate: '2026-06-01',
  appointmentTime: '10:00',
  status: 'pending',
  reason: 'Checkup',
  ...overrides,
});

export const createDoctor = (overrides = {}) => ({
  _id: uid(),
  name: 'Dr. Test Doctor',
  role: 'doctor',
  specialization: 'General Medicine',
  ...overrides,
});

export const createStats = (overrides = {}) => ({
  myAppointments: 0,
  upcomingAppointments: 0,
  myReports: 0,
  myAnalyses: 0,
  pendingAppointments: 0,
  completedAppointments: 0,
  totalPatients: 0,
  ...overrides,
});