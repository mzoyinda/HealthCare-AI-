import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Appointments } from '../pages/patient/Appointments';
import { appointmentService } from '../services/appointmentService';
import { userService } from '../services/userService';
import { createDoctor } from './helpers/factories';
import { openAppointmentForm, getSubmitBtn, fillValidAppointmentForm } from './helpers/renderUtils';

vi.mock('../services/appointmentService');
vi.mock('../services/userService');
vi.mock('react-router-dom', () => ({ Link: ({ children }) => children }));

const mockDoctors = [
  createDoctor({ _id: '2', name: 'Dr. Sarah Smith', specialization: 'Cardiology' }),
  createDoctor({ _id: '3', name: 'Dr. Michael Johnson', specialization: 'General Medicine' }),
];

beforeEach(() => {
  appointmentService.getAll.mockResolvedValue({ appointments: [] });
  userService.getDoctors.mockResolvedValue({ users: mockDoctors });
  appointmentService.create.mockResolvedValue({ success: true });
});

const openForm = async () => {
  render(<Appointments />);
  await openAppointmentForm();
};

describe('Appointments Form - Problem 2', () => {
  test('submit button is disabled when form is empty', async () => {
    await openForm();
    expect(getSubmitBtn()).toBeDisabled();
  });

  test('shows error when no doctor is selected', async () => {
    await openForm();
    fireEvent.change(screen.getByLabelText(/doctor/i), { target: { name: 'doctor', value: '' } });
    fireEvent.blur(screen.getByLabelText(/doctor/i));
    await waitFor(() => expect(screen.getByText('Please select a doctor')).toBeInTheDocument());
  });

  test('shows error when date is today', async () => {
    await openForm();
    const today = new Date().toISOString().split('T')[0];
    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { name: 'appointmentDate', value: today }
    });
    await waitFor(() => expect(screen.getByText('Date must be in the future')).toBeInTheDocument());
  });

  test('shows error when date is in the past', async () => {
    await openForm();
    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { name: 'appointmentDate', value: '2024-01-01' } });
    fireEvent.blur(dateInput);
    await waitFor(() => expect(screen.getByText('Date must be in the future')).toBeInTheDocument());
  });

  test('shows error when time is before 9 AM', async () => {
    await openForm();
    const timeInput = screen.getByLabelText(/time/i);
    fireEvent.change(timeInput, { target: { name: 'appointmentTime', value: '08:30' } });
    fireEvent.blur(timeInput);
    await waitFor(() => expect(screen.getByText('Time must be during business hours (9 AM - 5 PM)')).toBeInTheDocument());
  });

  test('shows error when time is at or after 5 PM', async () => {
    await openForm();
    const timeInput = screen.getByLabelText(/time/i);
    fireEvent.change(timeInput, { target: { name: 'appointmentTime', value: '17:00' } });
    fireEvent.blur(timeInput);
    await waitFor(() => expect(screen.getByText('Time must be during business hours (9 AM - 5 PM)')).toBeInTheDocument());
  });

  test('shows error when reason is less than 10 characters', async () => {
    await openForm();
    const reasonInput = screen.getByLabelText(/reason/i);
    fireEvent.change(reasonInput, { target: { name: 'reason', value: 'headache' } });
    fireEvent.blur(reasonInput);
    await waitFor(() => expect(screen.getByText('Reason must be at least 10 characters')).toBeInTheDocument());
  });

  test('submit button enabled when all fields are valid', async () => {
    await openForm();
    fillValidAppointmentForm();
    await waitFor(() => expect(getSubmitBtn()).not.toBeDisabled());
  });

  test('shows success message after valid submission', async () => {
    await openForm();
    fillValidAppointmentForm();
    await waitFor(() => expect(getSubmitBtn()).not.toBeDisabled());
    fireEvent.click(getSubmitBtn());
    await waitFor(() => expect(screen.getByText('Appointment booked successfully!')).toBeInTheDocument());
  });

  test('errors clear when form is cancelled and reopened', async () => {
    await openForm();
    const reasonInput = screen.getByLabelText(/reason/i);
    fireEvent.change(reasonInput, { target: { name: 'reason', value: 'short' } });
    fireEvent.blur(reasonInput);
    await waitFor(() => expect(screen.getByText('Reason must be at least 10 characters')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    fireEvent.click(screen.getByText('Book Appointment'));
    await waitFor(() => expect(screen.queryByText('Reason must be at least 10 characters')).not.toBeInTheDocument());
  });
});