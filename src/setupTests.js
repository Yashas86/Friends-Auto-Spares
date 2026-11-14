// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock matchMedia for responsive UI components
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {},
    };
  };
}

// Mock Leaflet and React-Leaflet for Jest CommonJS environment
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    flyTo: jest.fn(),
    invalidateSize: jest.fn(),
  }),
}));

jest.mock('leaflet', () => ({
  Icon: {
    Default: Object.assign(
      function() {},
      {
        prototype: { _getIconUrl: jest.fn() },
        mergeOptions: jest.fn(),
      }
    ),
  },
}));
