/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home Component', () => {
  it('should redirect to /polls on mount', () => {
    render(<Home />);
    expect(redirect).toHaveBeenCalledWith('/polls');
  });
});
