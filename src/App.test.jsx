import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the Gemini service so tests don't actually hit the external API
vi.mock('./services/geminiService', () => ({
  generateAIResponse: vi.fn().mockResolvedValue({
    text: 'This is a mocked AI response.',
    error: null,
  })
}));

describe('Voting Assistant App', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Voting Assistant/i })).toBeInTheDocument();
  });

  it('renders the initial AI greeting', () => {
    render(<App />);
    expect(screen.getByText(/Hello! I am your Voting Information Assistant/i)).toBeInTheDocument();
  });

  it('allows user to type in the input field', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    fireEvent.change(input, { target: { value: 'How do I register?' } });
    expect(input.value).toBe('How do I register?');
  });

  it('disables the submit button when input is empty', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Send message/i });
    expect(button).toBeDisabled();
  });
});
