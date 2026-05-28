import { screen, fireEvent, waitFor } from '@testing-library/react';

export const openAppointmentForm = async () => {
  await waitFor(() => screen.getByText('Book Appointment'));
  fireEvent.click(screen.getByText('Book Appointment'));
  await waitFor(() => screen.getByLabelText(/doctor/i));
};

export const getSubmitBtn = () => screen.getByTestId('submit-appointment');

export const fillValidAppointmentForm = () => {
  fireEvent.change(screen.getByLabelText(/doctor/i), {
    target: { name: 'doctor', value: '2' }
  });
  fireEvent.change(screen.getByLabelText(/date/i), {
    target: { name: 'appointmentDate', value: '2026-06-15' }
  });
  fireEvent.change(screen.getByLabelText(/time/i), {
    target: { name: 'appointmentTime', value: '10:00' }
  });
  fireEvent.change(screen.getByLabelText(/reason/i), {
    target: { name: 'reason', value: 'Regular checkup visit' }
  });
};