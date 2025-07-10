# Changelog

## Added

- Basic error handling for 404 (Not Found) and 500 (Internal Server Error) responses in the Flask backend routes.

## Details

- Added `@application.errorhandler(404)` and `@application.errorhandler(500)` handlers in `backend/application.py`.
- These handlers return JSON error messages and corresponding HTTP status codes.
- No other functional changes were made to keep the modifications simple and focused on error handling.
