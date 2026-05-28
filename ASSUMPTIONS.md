# Assumptions & Notes

## Environment
- Tested without a database using the in-memory storage mode
- Server runs on port 5001 instead of 5000 due to a local port conflict
- All fixes tested against the in-memory store

---

## Client

### Patient Dashboard (Problem 1)
- The API was returning all appointments instead of just the logged-in patient's
  so a filter was added on the frontend as a backup
- The logged-in user is stored with `id` not `_id` in the auth context
  so the filter uses `user?.id` to match correctly

### Doctor Dashboard (Extra fix)
- Same filtering issue as the patient dashboard, same fix applied
- Doctor's own appointments are filtered using `user?.id`

### Appointment Booking (Problem 2)
- Added `data-testid="submit-appointment"` to the submit button because the page
  has two buttons with the same label, the toggle button and the form submit button
- Removed the hardcoded "Dr." prefix from the appointment card in JSX because
  the doctor names in the database already include "Dr.", which caused it to
  show up twice

### Register Page (Extra fix)
- Found a bug where `password` was being excluded from the registration payload
  along with `confirmPassword`, meaning users could be created without a password
- Fixed by only destructuring `confirmPassword` out of the form data, leaving
  `password` intact so it gets sent to the API correctly
- `confirmPassword` is not sent to the API at all, it only exists to validate the form
- Empty `phone` field is stripped before sending, it is optional so the backend
  should not receive a blank value

---

## Server

### Auth Middleware
- The in-memory store saves users with `_id` but the login token stores `id`
- This mismatch caused `req.user.id` to be `undefined` in every controller,
  breaking all user-specific queries
- Fixed in one place in `auth.js` by adding `id: user._id` to the user object
  so every controller gets the right value without needing individual fixes

### Appointment Controller
- New appointments were missing a default status, causing them to save as
  `undefined` which broke the upcoming appointments count
- Added `status: 'pending'` as the default when creating an appointment
- Added null checks when comparing patient and doctor IDs to prevent crashes
  when an appointment is missing one of these fields

### In-Memory Store
- The store did not support filtering by multiple statuses at once so upcoming
  appointment counts were always returning zero, added support for it
- Date comparisons were failing for non-UTC timezones, fixed by normalizing
  date strings before comparing
- The MongoDB ID format validator was disabled because the in-memory store uses
  simple numeric IDs instead of MongoDB ObjectIds, left as a comment so it can
  be re-enabled when switching to MongoDB

### getDoctors Endpoint
- Added a dedicated endpoint for fetching doctors at `/users/doctors`
- It reuses the existing `getUsers` logic but locks the role to `doctor`
  on the server so the filter cannot be changed from the client
- Placed before the `/:id` route so Express does not treat "doctors" as a user ID

---

## Security

### Patient Access to User Data
- The original code fetched the doctor list by calling `/users?role=doctor`
- This is a risk because a patient could change the role filter in the browser
  and see all users including other patients' data
- Fixed by creating a separate `/users/doctors` endpoint that always filters
  by doctor on the server, regardless of what the client sends
- Patients can only ever get back a list of doctors, nothing else

### Auth Fix Scope
- The auth middleware fix was applied in one central place rather than in each
  individual controller
- This ensures no route is accidentally left with a broken user ID lookup
  which could allow one user to access another user's data

---

## Testing
- Test data is generated using factory functions instead of hardcoded objects
  so tests are easier to read and maintain
- Recharts is mocked globally so chart components do not break tests
- CSS processing is turned off in the test config to avoid a known compatibility
  issue between jsdom and certain CSS packages
- The README says local testing by developers is not allowed, this was treated
  as a placeholder since the assessment asks to test the solution. Tests have
  been added for both Problem 1 and Problem 2