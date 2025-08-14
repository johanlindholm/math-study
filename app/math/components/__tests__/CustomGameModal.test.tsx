import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import CustomGameModal from '../CustomGameModal';
import { GameType } from '../../game/types';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockRouterPush,
});

describe('CustomGameModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders multiplication custom game modal', () => {
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.MULTIPLICATION}
      />
    );

    expect(screen.getByText('Custom Multiplication Game')).toBeInTheDocument();
    expect(screen.getByText(/Multiplication Tables/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('1,2,3,4,5')).toBeInTheDocument();
  });

  it('renders addition custom game modal', () => {
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.ADDITION}
      />
    );

    expect(screen.getByText('Custom Addition Game')).toBeInTheDocument();
    expect(screen.getByText('Number Range Min:')).toBeInTheDocument();
    expect(screen.getByText('Number Range Max:')).toBeInTheDocument();
  });

  it('renders subtraction custom game modal', () => {
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.SUBTRACTION}
      />
    );

    expect(screen.getByText('Custom Subtraction Game')).toBeInTheDocument();
    expect(screen.getByText('Allow negative results')).toBeInTheDocument();
  });

  it('renders division custom game modal', () => {
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.DIVISION}
      />
    );

    expect(screen.getByText('Custom Division Game')).toBeInTheDocument();
    expect(screen.getByText('Dividend Min:')).toBeInTheDocument();
    expect(screen.getByText('Dividend Max:')).toBeInTheDocument();
    expect(screen.getByText('Divisor Min:')).toBeInTheDocument();
    expect(screen.getByText('Divisor Max:')).toBeInTheDocument();
  });

  it('starts custom multiplication game with correct URL parameters', () => {
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.MULTIPLICATION}
      />
    );

    const tablesInput = screen.getByDisplayValue('1,2,3,4,5');
    fireEvent.change(tablesInput, { target: { value: '2,4,6' } });

    const startButton = screen.getByText('Start Custom Game');
    fireEvent.click(startButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining('/math/game?type=multiplication&custom=')
    );

    // Check that the URL contains encoded custom config
    const callArg = mockRouterPush.mock.calls[0][0];
    expect(callArg).toContain('multiplication');
    expect(callArg).toContain('custom=');
  });

  it('parses table range input correctly', () => {
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.MULTIPLICATION}
      />
    );

    const tablesInput = screen.getByDisplayValue('1,2,3,4,5');
    
    // Test range input like "2-5"
    fireEvent.change(tablesInput, { target: { value: '2-5' } });
    
    const startButton = screen.getByText('Start Custom Game');
    fireEvent.click(startButton);

    expect(mockRouterPush).toHaveBeenCalled();
  });

  it('validates addition range inputs', () => {
    // Mock alert to capture validation message
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(
      <CustomGameModal
        isOpen={true}
        onClose={() => {}}
        gameType={GameType.ADDITION}
      />
    );

    const minInput = screen.getByDisplayValue('0');
    const maxInput = screen.getByDisplayValue('20');
    
    // Set min greater than max to trigger validation
    fireEvent.change(minInput, { target: { value: '25' } });
    fireEvent.change(maxInput, { target: { value: '20' } });

    const startButton = screen.getByText('Start Custom Game');
    fireEvent.click(startButton);

    expect(alertSpy).toHaveBeenCalledWith('Minimum value must be less than maximum value');
    expect(mockRouterPush).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('does not render when isOpen is false', () => {
    render(
      <CustomGameModal
        isOpen={false}
        onClose={() => {}}
        gameType={GameType.MULTIPLICATION}
      />
    );

    expect(screen.queryByText('Custom Multiplication Game')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onCloseMock = jest.fn();
    
    render(
      <CustomGameModal
        isOpen={true}
        onClose={onCloseMock}
        gameType={GameType.MULTIPLICATION}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button is clicked', () => {
    const onCloseMock = jest.fn();
    
    render(
      <CustomGameModal
        isOpen={true}
        onClose={onCloseMock}
        gameType={GameType.MULTIPLICATION}
      />
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});