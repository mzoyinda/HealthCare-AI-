import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { userService } from '../services/userService';
import { appointmentService } from '../services/appointmentService';
import { aiService } from '../services/aiService';
import { createAppointment, createStats } from './helpers/factories';

vi.mock('../services/userService');
vi.mock('../services/appointmentService');
vi.mock('../services/aiService');
vi.mock('react-router-dom', () => ({ Link: ({ children }) => children }));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: '1', name: 'John Patient', role: 'patient' } }),
}));

const mockAppointments = [
  createAppointment({ _id: 'a1', patient: { _id: '1' }, doctor: { name: 'Dr. Sarah Smith' } }),
  createAppointment({ _id: 'a2', patient: { _id: '1' }, doctor: { name: 'Dr. Michael Johnson' } }),
  createAppointment({ _id: 'a3', patient: { _id: '2' }, doctor: { name: 'Dr. Sarah Smith' } }),
];

beforeEach(() => {
  userService.getStats.mockResolvedValue({
    stats: createStats({ myAppointments: 2, upcomingAppointments: 2 })
  });
  appointmentService.getAll.mockResolvedValue({ appointments: mockAppointments });
  aiService.getAll.mockResolvedValue({ analyses: [] });
  userService.getTrends.mockResolvedValue({ trends: [] });
});

describe('PatientDashboard - Problem 1', () => {
  test('shows only appointments belonging to logged-in patient', async () => {
    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Dr. Sarah Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Michael Johnson')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Dr\./)).toHaveLength(2);
  });

  test('stats card shows correct appointment count', async () => {
    render(<PatientDashboard />);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  test('shows upcoming count from stats', async () => {
    render(<PatientDashboard />);
    await waitFor(() => expect(screen.getByText('2 upcoming')).toBeInTheDocument());
  });

  test('shows empty state when patient has no appointments', async () => {
    appointmentService.getAll.mockResolvedValue({ appointments: [] });
    render(<PatientDashboard />);
    await waitFor(() => expect(screen.getByText('No recent appointments')).toBeInTheDocument());
  });

  test('limits recent appointments list to 3 entries', async () => {
    const many = Array.from({ length: 5 }, (_, i) =>
      createAppointment({ patient: { _id: '1' }, doctor: { name: `Dr. Doctor ${i}` } })
    );
    appointmentService.getAll.mockResolvedValue({ appointments: many });
    render(<PatientDashboard />);
    await waitFor(() => expect(screen.getAllByText(/Dr\. Doctor/)).toHaveLength(3));
  });

  test('does not show appointments from other patients', async () => {
    render(<PatientDashboard />);
    await waitFor(() => {
      expect(screen.getAllByText(/Dr\./)).toHaveLength(2);
    });
  });
});