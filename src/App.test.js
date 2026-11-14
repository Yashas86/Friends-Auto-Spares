import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Friends Auto Spares initial screen without crashing', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Friends Auto Spares/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
