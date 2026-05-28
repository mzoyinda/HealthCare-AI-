import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { userService } from '../services/userService';
import { appointmentService } from '../services/appointmentService';
import { aiService } from '../services/aiService';
import { createAppointment, createStats } from './helpers/factories';

vi.mock('../services/userService');
vi.mock('../services/appointmentService');
vi.mock('../services/aiService');
vi.mock('react-router-dom', () => ({ Link: ({ children }) => children }));
vi.mock('recharts');

let mockUser = { id: '3', name: 'Dr. Michael Johnson', role: 'doctor' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockDoctorMichael = { id: '3', name: 'Dr. Michael Johnson', role: 'doctor' };
const mockDoctorSarah = { id: '2', name: 'Dr. Sarah Smith', role: 'doctor' };

const allAppointments = [
  createAppointment({ _id: 'a1', doctor: { _id: '3', name: 'Dr. Michael Johnson' }, patient: { _id: '1', name: 'John Patient' } }),
  createAppointment({ _id: 'a2', doctor: { _id: '3', name: 'Dr. Michael Johnson' }, patient: { _id: '1', name: 'John Patient' }, status: 'confirmed' }),
  createAppointment({ _id: 'a3', doctor: { _id: '2', name: 'Dr. Sarah Smith' }, patient: { _id: '1', name: 'John Patient' } }),
];

const setupMocks = (doctor, statsOverrides = {}) => {
  mockUser = doctor;
  userService.getStats.mockResolvedValue({
    stats: createStats({ myAppointments: 2, pendingAppointments: 1, ...statsOverrides })
  });
  appointmentService.getAll.mockResolvedValue({ appointments: allAppointments });
  aiService.getAll.mockResolvedValue({ analyses: [] });
};

describe('DoctorDashboard - Appointment Filtering', () => {
  beforeEach(() => vi.clearAllMocks());

  test('Dr. Michael only sees his own appointments', async () => {
    setupMocks(mockDoctorMichael);
    render(<DoctorDashboard />);
    await waitFor(() => expect(screen.getAllByText('John Patient')).toHaveLength(2));
  });

  test('Dr. Michael does not see Dr. Sarah appointments', async () => {
    setupMocks(mockDoctorMichael);
    render(<DoctorDashboard />);
    await waitFor(() => expect(screen.getAllByText('John Patient')).toHaveLength(2));
  });

  test('Dr. Sarah only sees her own appointments', async () => {
    setupMocks(mockDoctorSarah, { myAppointments: 1, pendingAppointments: 1 });
    render(<DoctorDashboard />);
    await waitFor(() => expect(screen.getAllByText('John Patient')).toHaveLength(1));
  });

  test('shows correct stats for logged in doctor', async () => {
    setupMocks(mockDoctorMichael);
    render(<DoctorDashboard />);
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('1 pending')).toBeInTheDocument();
    });
  });

  test('shows empty state when doctor has no appointments', async () => {
    setupMocks(mockDoctorMichael);
    appointmentService.getAll.mockResolvedValue({ appointments: [] });
    render(<DoctorDashboard />);
    await waitFor(() => expect(screen.getByText('No upcoming appointments')).toBeInTheDocument());
  });

  test('limits recent appointments to 5 entries', async () => {
    setupMocks(mockDoctorMichael);
    const many = Array.from({ length: 7 }, (_, i) =>
      createAppointment({
        patient: { _id: '1', name: `Patient ${i}` },
        doctor: { _id: '3', name: 'Dr. Michael Johnson' },
      })
    );
    appointmentService.getAll.mockResolvedValue({ appointments: many });
    render(<DoctorDashboard />);
    await waitFor(() => expect(screen.getAllByText(/Patient \d/)).toHaveLength(5));
  });
});