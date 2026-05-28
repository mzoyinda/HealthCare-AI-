import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

expect.extend(matchers);


configure({
  getElementError: (message) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = '';
    return error;
  }
});

afterEach(() => {
  cleanup();
});