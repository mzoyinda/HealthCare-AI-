import { vi } from 'vitest';

export const mockRouterDom = () =>
  vi.mock('react-router-dom', () => ({
    Link: ({ children }) => children,
  }));

export const mockServices = () => {
  vi.mock('../services/userService');
  vi.mock('../services/appointmentService');
  vi.mock('../services/aiService');
};