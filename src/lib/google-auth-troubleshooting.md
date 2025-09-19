# Google Authentication Troubleshooting

## Common Issues and Solutions

### 1. Popup Blocked
**Error**: `auth/popup-blocked`
**Solution**: 
- Allow popups for your domain in browser settings
- The app will automatically try redirect method as fallback

### 2. Google Sign-in Not Configured
**Error**: `auth/operation-not-supported-in-this-environment`
**Solution**:
- Check Firebase Console > Authentication > Sign-in method
- Enable Google provider
- Add your domain to authorized domains

### 3. OAuth Consent Screen Issues
**Error**: Various OAuth errors
**Solution**:
- Go to Google Cloud Console
- Navigate to OAuth consent screen
- Add your domain to authorized domains
- Ensure consent screen is configured

### 4. Domain Authorization
**Solution**:
- Add your domain to Firebase Console > Authentication > Settings > Authorized domains
- Add both localhost and production domains

### 5. Network Issues
**Error**: `auth/network-request-failed`
**Solution**:
- Check internet connection
- Verify Firebase configuration
- Check browser console for detailed errors

## Debug Steps

1. Open browser console
2. Try Google sign-in
3. Check console logs for detailed error messages
4. Verify Firebase configuration in console
5. Check network tab for failed requests

## Testing Checklist

- [ ] Firebase project is properly configured
- [ ] Google provider is enabled in Firebase Console
- [ ] OAuth consent screen is configured
- [ ] Domain is authorized in Firebase
- [ ] Browser allows popups
- [ ] Network connection is stable

