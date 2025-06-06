import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import MathPage from '../page';

// Mock the window.innerWidth and window.innerHeight for the Confetti component
Object.defineProperty(window, 'innerWidth', { value: 1024 });
Object.defineProperty(window, 'innerHeight', { value: 768 });

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti">Confetti Effect</div>;
  };
});

// Helper function to render with SessionProvider
const renderWithSession = (component: React.ReactElement) => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com'
    },
    expires: '2099-01-01T00:00:00.000Z'
  };

  return render(
    <SessionProvider session={mockSession}>
      {component}
    </SessionProvider>
  );
};

describe('MathPage', () => {
  it('renders the game selection page correctly', () => {
    renderWithSession(<MathPage />);
    
    // Check that the main heading is rendered
    expect(screen.getByText('Math Games')).toBeInTheDocument();
    expect(screen.getByText('Select a game mode to start practicing!')).toBeInTheDocument();
    
    // Check that all game modes are rendered
    expect(screen.getByText('Multiplication')).toBeInTheDocument();
    expect(screen.getByText('Addition')).toBeInTheDocument();
    expect(screen.getByText('Subtraction')).toBeInTheDocument();
    
    // Check that play buttons are rendered
    const playButtons = screen.getAllByText('Play Now');
    expect(playButtons).toHaveLength(3);
  });

  it('renders high score buttons for each game mode', () => {
    renderWithSession(<MathPage />);
    
    // Check that high score buttons are rendered
    const highScoreButtons = screen.getAllByText('View High Scores');
    expect(highScoreButtons).toHaveLength(3);
  });

  it('displays correct descriptions for each game mode', () => {
    renderWithSession(<MathPage />);
    
    // Check descriptions
    expect(screen.getByText('Practice your multiplication skills!')).toBeInTheDocument();
    expect(screen.getByText('Practice your addition skills!')).toBeInTheDocument();
    expect(screen.getByText('Practice your subtraction skills!')).toBeInTheDocument();
  });
});