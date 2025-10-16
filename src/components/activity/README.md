# Activity Tracking Feature

This feature allows employees to track their current activity status throughout the workday. The system includes a dropdown in the header for changing status and a screen lock mechanism that activates for activities other than "On Desk".

## Components

1. **ActivityDropdown** - Displays in the header for quick status changes
2. **ActivityLockScreen** - Overlays the UI when a blocking activity is active
3. **ActivityContext** - Manages the state and API interactions

## Activity Types

- On Desk (default, no screen lock)
- Lunch Break (screen lock, 30 min limit)
- Team Meeting (screen lock, 30 min limit)
- Client Meeting (screen lock, 30 min limit)
- Office Celebration (screen lock, no time limit)
- Interview Session (screen lock, 15 min limit)

## Technical Details

- Activities other than "On Desk" lock the screen with a timer
- The current activity and timer are displayed in a circle
- Return to Desk button allows reverting to normal work mode
- APIs are integrated in EmployeeServices.js
- Time limits trigger warnings when exceeded
- Visual indicators (red color, blinking) alert users of time limit violations

## Time Limit Features

- Time limits are set per activity type on the backend
- Visual warnings appear when time limits are exceeded
- The timer turns red and blinks when over the limit
- The dropdown button in the header also shows a warning indicator
- Remaining time or overtime is displayed on the lock screen

## API Methods

- `startActivity(type)` - Begin a new activity
- `getCurrentActivity()` - Get current active activity
- `goOnDesk()` - Return to desk (end other activities)
- `getActivityHistory()` - Get history of activities
- `getActivityTimeLimits()` - Get time limits for different activities

## Implementation Notes

The system uses React Context for state management, making activity state accessible throughout the application. The screen lock is implemented as a modal overlay with z-index to ensure it covers all other UI elements. Time limit tracking is handled with useEffect hooks that periodically check elapsed time against defined limits.
