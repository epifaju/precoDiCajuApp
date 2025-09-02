# Geolocation Hooks

This directory contains custom React hooks for managing geolocation functionality in the Preço di Cajú application.

## Hooks Overview

### `useGeolocation`

The main geolocation hook that provides access to the browser's geolocation API.

**Features:**

- Get current position
- Watch position changes
- Error handling
- Permission management
- Configurable options

**Usage:**

```typescript
import { useGeolocation } from '../hooks/geolocation';

const { coordinates, isLoading, error, getCurrentPosition } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
});
```

### `useGeolocationPermission`

Manages geolocation permissions using the Permissions API.

**Features:**

- Check permission status
- Request permissions
- Listen for permission changes
- Handle permission states

**Usage:**

```typescript
import { useGeolocationPermission } from '../hooks/geolocation';

const { permission, requestPermission, checkPermission } = useGeolocationPermission();
```

### `useGeolocationAccuracy`

Validates and manages GPS accuracy and position quality.

**Features:**

- Validate position accuracy
- Check if coordinates are within Guinea-Bissau bounds
- Calculate distance between positions
- Quality scoring (excellent, good, fair, poor, invalid)

**Usage:**

```typescript
import { useGeolocationAccuracy } from '../hooks/geolocation';

const { validatePosition, isWithinGuineaBissau, getQualityScore } = useGeolocationAccuracy({
  minAccuracy: 100,
  maxAge: 300000,
  validateCoordinates: true,
});
```

### `useGeocoding`

Provides reverse geocoding functionality to convert coordinates to addresses.

**Features:**

- Reverse geocoding using OpenStreetMap Nominatim
- Caching of results
- Error handling
- Abortable requests

**Usage:**

```typescript
import { useGeocoding } from '../hooks/geolocation';

const { reverseGeocode, result, isLoading, error } = useGeocoding();

// Get address for coordinates
const address = await reverseGeocode({ latitude: 11.8637, longitude: -15.5983 });
```

### `useGeolocationManager`

A composite hook that combines all geolocation functionality.

**Features:**

- Unified interface for all geolocation operations
- Automatic permission handling
- Optional auto-geocoding
- Comprehensive state management

**Usage:**

```typescript
import { useGeolocationManager } from '../hooks/geolocation';

const {
  coordinates,
  address,
  isLoading,
  error,
  getCurrentPosition,
  getPositionWithAddress,
  validateCurrentPosition,
} = useGeolocationManager({
  geolocation: { enableHighAccuracy: true },
  accuracy: { minAccuracy: 50 },
  autoGeocode: true,
  requirePermission: true,
});
```

## Configuration Options

### GeolocationOptions

```typescript
interface GeolocationOptions {
  enableHighAccuracy?: boolean; // Default: true
  timeout?: number; // Default: 10000ms
  maximumAge?: number; // Default: 300000ms (5 minutes)
  watchPosition?: boolean; // Default: false
}
```

### AccuracyOptions

```typescript
interface AccuracyOptions {
  minAccuracy?: number; // Default: 100 meters
  maxAge?: number; // Default: 300000ms (5 minutes)
  validateCoordinates?: boolean; // Default: true
}
```

### GeolocationManagerOptions

```typescript
interface GeolocationManagerOptions {
  geolocation?: GeolocationOptions;
  accuracy?: AccuracyOptions;
  autoGeocode?: boolean; // Default: false
  requirePermission?: boolean; // Default: true
}
```

## Error Handling

All hooks provide comprehensive error handling:

- **Permission denied**: User denied location access
- **Position unavailable**: GPS signal not available
- **Timeout**: Location request timed out
- **Not supported**: Browser doesn't support geolocation
- **Network errors**: Geocoding API failures

## Best Practices

1. **Always check support**: Use `isSupported` before calling geolocation functions
2. **Handle permissions**: Request permissions before getting location
3. **Validate accuracy**: Check position quality before using coordinates
4. **Cache results**: Use geocoding cache to avoid repeated API calls
5. **Handle errors gracefully**: Provide fallbacks for failed requests
6. **Clean up**: Clear watchers and abort requests on component unmount

## Browser Compatibility

- **Geolocation API**: Supported in all modern browsers
- **Permissions API**: Supported in Chrome 46+, Firefox 46+, Safari 13.1+
- **AbortController**: Supported in all modern browsers

## Performance Considerations

- **Caching**: Geocoding results are cached to reduce API calls
- **Debouncing**: Position requests are debounced to prevent excessive calls
- **Cleanup**: Proper cleanup prevents memory leaks
- **Abortable requests**: Long-running requests can be cancelled

## Security Considerations

- **HTTPS required**: Geolocation API requires HTTPS in production
- **User consent**: Always request permission before accessing location
- **Data privacy**: Coordinates are only stored locally unless explicitly sent to server
- **API limits**: Geocoding API has rate limits and usage policies
