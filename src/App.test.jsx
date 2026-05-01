import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the Gemini service so tests don't actually hit the external API
vi.mock('./services/geminiService', () => ({
  generateAIResponse: vi.fn().mockResolvedValue({
    text: 'This is a mocked AI response about voter registration.',
    error: null,
  })
}));

describe('Voting Assistant App - Rendering (Code Quality)', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Voting Assistant/i })).toBeInTheDocument();
  });

  it('renders the initial AI greeting message', () => {
    render(<App />);
    expect(screen.getByText(/Hello! I am your Voting Information Assistant/i)).toBeInTheDocument();
  });

  it('renders the voter profile dropdown', () => {
    render(<App />);
    const select = screen.getByLabelText(/Voter Profile/i);
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('General Voter');
  });
});

describe('Voting Assistant App - User Interaction (Testing)', () => {
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

  it('enables the submit button when input has text', () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    const button = screen.getByRole('button', { name: /Send message/i });
    expect(button).not.toBeDisabled();
  });

  it('clears the input field after submitting a message', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const form = screen.getByRole('form', { name: /Chat input form/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('displays the user message after submitting', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const form = screen.getByRole('form', { name: /Chat input form/i });
    
    fireEvent.change(input, { target: { value: 'How do I register to vote?' } });
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('How do I register to vote?')).toBeInTheDocument();
    });
  });

  it('displays the AI response after submitting', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Ask about voter registration/i);
    const form = screen.getByRole('form', { name: /Chat input form/i });
    
    fireEvent.change(input, { target: { value: 'How do I register?' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/mocked AI response about voter registration/i)).toBeInTheDocument();
    });
  });
});

describe('Voting Assistant App - Voter Profile Context (Google Services)', () => {
  it('allows changing the voter profile', () => {
    render(<App />);
    const select = screen.getByLabelText(/Voter Profile/i);
    
    fireEvent.change(select, { target: { value: 'NRI (Overseas) Voter' } });
    expect(select.value).toBe('NRI (Overseas) Voter');
  });

  it('contains all expected voter profile options', () => {
    render(<App />);
    const options = screen.getAllByRole('option');
    const optionValues = options.map(opt => opt.value);
    
    expect(optionValues).toContain('General Voter');
    expect(optionValues).toContain('First-Time Voter (18+)');
    expect(optionValues).toContain('NRI (Overseas) Voter');
    expect(optionValues).toContain('Senior Citizen or PwD');
  });
});

describe('Voting Assistant App - Accessibility (A11y)', () => {
  it('has an accessible chat log region', () => {
    render(<App />);
    const chatArea = screen.getByRole('log');
    expect(chatArea).toHaveAttribute('aria-live', 'polite');
  });

  it('has an accessible form with labeled input', () => {
    render(<App />);
    const input = screen.getByLabelText(/Type your message here/i);
    expect(input).toBeInTheDocument();
  });

  it('has an accessible send button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Send message/i });
    expect(button).toBeInTheDocument();
  });

  it('has a single h1 heading for SEO', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
  });
});
