import { fireEvent, render, screen } from '@testing-library/react';
import AgentDialog from '../components/AgentDialog';

describe('AgentDialog', () => {
  it('should render the dialog with a "Save" button', () => {
    const onClose = jest.fn();
    render(<AgentDialog open={true} onClose={onClose} />);
    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('should call onClose when "Save" button is clicked', () => {
    const onClose = jest.fn();
    render(<AgentDialog open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onClose).toHaveBeenCalled();
  });
});