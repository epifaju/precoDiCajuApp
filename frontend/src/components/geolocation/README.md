# Geolocation Components

This directory contains React components for managing geolocation functionality in the Preço di Cajú application.

## Components Overview

### `GeolocationPermission`

A component for requesting and managing geolocation permissions with user-friendly interface.

**Features:**

- Permission request with benefits explanation
- Instructions for denied permissions
- Multiple display variants (card, inline, modal)
- Privacy information
- Error handling

**Usage:**

```typescript
import { GeolocationPermission } from '../components/geolocation';

<GeolocationPermission
  onPermissionGranted={() => console.log('Permission granted')}
  onPermissionDenied={() => console.log('Permission denied')}
  variant="card"
  showBenefits={true}
  showInstructions={true}
/>;
```

**Props:**

- `onPermissionGranted?: () => void` - Callback when permission is granted
- `onPermissionDenied?: () => void` - Callback when permission is denied
- `onPermissionRequested?: () => void` - Callback when permission is requested
- `variant?: 'card' | 'inline' | 'modal'` - Display variant
- `showBenefits?: boolean` - Show benefits explanation
- `showInstructions?: boolean` - Show instructions for denied permissions

### `GeolocationStatus`

A component for displaying current geolocation status and information.

**Features:**

- Real-time status display
- Accuracy and quality indicators
- Address information
- Validation status
- Action buttons (refresh, request permission)
- Multiple display variants

**Usage:**

```typescript
import { GeolocationStatus } from '../components/geolocation';

<GeolocationStatus
  onRefresh={() => console.log('Refreshing location')}
  onRequestPermission={() => console.log('Requesting permission')}
  variant="card"
  showActions={true}
  showAccuracy={true}
  showAddress={true}
/>;
```

**Props:**

- `onRefresh?: () => void` - Callback for refresh action
- `onRequestPermission?: () => void` - Callback for permission request
- `variant?: 'card' | 'inline' | 'compact'` - Display variant
- `showActions?: boolean` - Show action buttons
- `showAccuracy?: boolean` - Show accuracy information
- `showAddress?: boolean` - Show address information

### `GeolocationInput`

A unified interface for geolocation input with manual and automatic options.

**Features:**

- GPS location detection
- Manual coordinate input
- Address geocoding
- Validation and accuracy display
- Multiple input variants
- Error handling

**Usage:**

```typescript
import { GeolocationInput } from '../components/geolocation';

<GeolocationInput
  value={coordinates}
  onChange={setCoordinates}
  onAddressChange={setAddress}
  variant="inline"
  showAddress={true}
  showAccuracy={true}
  showValidation={true}
  autoGetLocation={false}
  requirePermission={true}
/>;
```

**Props:**

- `value?: GpsCoordinates | null` - Current coordinates
- `onChange?: (coordinates: GpsCoordinates | null) => void` - Coordinate change callback
- `onAddressChange?: (address: string | null) => void` - Address change callback
- `variant?: 'card' | 'inline' | 'minimal'` - Display variant
- `showAddress?: boolean` - Show address input
- `showAccuracy?: boolean` - Show accuracy information
- `showValidation?: boolean` - Show validation status
- `autoGetLocation?: boolean` - Auto-get location on mount
- `requirePermission?: boolean` - Require permission before getting location
- `disabled?: boolean` - Disable all inputs
- `label?: string` - Input label
- `helpText?: string` - Help text
- `error?: string` - Error message

### `LocationPicker`

An interactive map component for selecting locations.

**Features:**

- Interactive map with click selection
- GPS current location
- Address geocoding
- Validation and accuracy display
- Multiple markers (selected, current)
- Instructions overlay

**Usage:**

```typescript
import { LocationPicker } from '../components/geolocation';

<LocationPicker
  value={selectedLocation}
  onChange={setSelectedLocation}
  onAddressChange={setAddress}
  height="400px"
  center={[11.8037, -15.1804]}
  zoom={8}
  showCurrentLocation={true}
  showAddress={true}
  showValidation={true}
/>;
```

**Props:**

- `value?: GpsCoordinates | null` - Selected coordinates
- `onChange?: (coordinates: GpsCoordinates | null) => void` - Selection change callback
- `onAddressChange?: (address: string | null) => void` - Address change callback
- `height?: string` - Map height (default: "400px")
- `center?: [number, number]` - Map center coordinates
- `zoom?: number` - Map zoom level
- `showCurrentLocation?: boolean` - Show current location button
- `showAddress?: boolean` - Show address information
- `showValidation?: boolean` - Show validation status
- `disabled?: boolean` - Disable map interactions
- `label?: string` - Component label
- `helpText?: string` - Help text
- `error?: string` - Error message

## Component Variants

### Display Variants

**Card Variant:**

- Full card layout with header and content
- Best for standalone components
- Includes title and description

**Inline Variant:**

- Compact layout without card wrapper
- Best for embedding in forms
- Minimal styling

**Modal Variant (GeolocationPermission only):**

- Full-screen overlay
- Best for permission requests
- Includes close button

**Compact Variant (GeolocationStatus only):**

- Single line display
- Best for status indicators
- Minimal information

**Minimal Variant (GeolocationInput only):**

- Single input with GPS button
- Best for simple forms
- No additional information

### Configuration Options

**Show/Hide Options:**

- `showBenefits` - Show permission benefits
- `showInstructions` - Show denied permission instructions
- `showActions` - Show action buttons
- `showAccuracy` - Show accuracy information
- `showAddress` - Show address information
- `showValidation` - Show validation status
- `showCurrentLocation` - Show current location button

**Behavior Options:**

- `autoGetLocation` - Auto-get location on mount
- `requirePermission` - Require permission before getting location
- `disabled` - Disable all interactions

## Integration Examples

### Basic Permission Request

```typescript
import { GeolocationPermission } from '../components/geolocation';

function MyComponent() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  return (
    <div>
      {!permissionGranted && (
        <GeolocationPermission
          onPermissionGranted={() => setPermissionGranted(true)}
          variant="card"
        />
      )}
    </div>
  );
}
```

### Location Input in Form

```typescript
import { GeolocationInput } from '../components/geolocation';

function PriceForm() {
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState(null);

  return (
    <form>
      <GeolocationInput
        value={coordinates}
        onChange={setCoordinates}
        onAddressChange={setAddress}
        variant="inline"
        showAddress={true}
        showValidation={true}
        label="Location"
        helpText="Select your location for accurate price data"
      />
    </form>
  );
}
```

### Interactive Map Selection

```typescript
import { LocationPicker } from '../components/geolocation';

function MapSelection() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <LocationPicker
      value={selectedLocation}
      onChange={setSelectedLocation}
      height="500px"
      showCurrentLocation={true}
      showAddress={true}
      showValidation={true}
    />
  );
}
```

### Status Display

```typescript
import { GeolocationStatus } from '../components/geolocation';

function LocationStatus() {
  return <GeolocationStatus variant="compact" showActions={true} showAccuracy={true} />;
}
```

## Styling and Theming

All components use TailwindCSS classes and support dark mode through the `dark:` prefix. They automatically adapt to the current theme.

**Color Schemes:**

- Status indicators use semantic colors (green, yellow, red)
- Quality badges use appropriate colors for each level
- Error states use destructive styling
- Success states use default styling

**Responsive Design:**

- Components adapt to different screen sizes
- Mobile-friendly touch targets
- Responsive grid layouts
- Adaptive text sizes

## Accessibility

**Keyboard Navigation:**

- All interactive elements are keyboard accessible
- Proper tab order
- Focus indicators

**Screen Readers:**

- Proper ARIA labels
- Descriptive text for status changes
- Error announcements

**Visual Indicators:**

- Color is not the only indicator
- Icons accompany text
- Clear visual hierarchy

## Error Handling

**Permission Errors:**

- Clear error messages
- Instructions for resolution
- Fallback options

**GPS Errors:**

- Timeout handling
- Accuracy warnings
- Network error recovery

**Validation Errors:**

- Coordinate validation
- Bounds checking
- Accuracy requirements

## Performance Considerations

**Lazy Loading:**

- Map components load only when needed
- Geocoding requests are cached
- Debounced user interactions

**Memory Management:**

- Proper cleanup of event listeners
- Abortable requests
- Component unmounting

**Caching:**

- Geocoding results are cached
- Permission status is cached
- Location data is cached

## Browser Compatibility

**Geolocation API:**

- Supported in all modern browsers
- Graceful degradation for unsupported browsers

**Permissions API:**

- Supported in Chrome 46+, Firefox 46+, Safari 13.1+
- Fallback for unsupported browsers

**Map Integration:**

- Leaflet.js for cross-browser compatibility
- Responsive map tiles
- Touch support for mobile devices
