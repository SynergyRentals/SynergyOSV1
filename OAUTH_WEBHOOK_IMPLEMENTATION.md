# Guesty OAuth2 & Webhook Security Implementation

## Overview
Successfully implemented comprehensive OAuth2 authentication and webhook security for Synergy OS, replacing the existing API key authentication with secure OAuth2 client credentials and enforcing HMAC-SHA256 signature verification for Guesty webhooks.

## Key Features Implemented

### 1. OAuth2 Client Credentials Flow
- **Service**: `lib/guesty-oauth.ts`
- **Features**:
  - Automatic token refresh with 5-10 minute buffer
  - In-memory token caching for performance
  - Rate limiting and retry logic
  - Connection testing functionality
  - Secure credential storage in database

### 2. Webhook Security & Verification
- **Service**: `lib/webhook-security.ts`
- **Features**:
  - HMAC-SHA256 signature verification
  - Replay attack protection (5-minute window)
  - Event deduplication
  - Comprehensive logging and audit trail
  - Webhook statistics and monitoring

### 3. Database Schema Updates
- **User Model**: Added OAuth2 fields
  - `guestyClientId`: OAuth2 client identifier
  - `guestyClientSecret`: OAuth2 client secret
  - `guestyAccessToken`: Current access token
  - `guestyTokenExpiresAt`: Token expiration timestamp
  - `guestyWebhookSecret`: HMAC signature secret

- **WebhookEvent Model**: Complete audit trail
  - `eventId`: Unique event identifier
  - `eventType`: Type of webhook event
  - `payload`: Full event payload
  - `signature`: HMAC signature
  - `verified`: Signature verification status
  - `processed`: Processing completion status
  - `receivedAt`: Event receipt timestamp
  - `processedAt`: Processing completion timestamp
  - `error`: Error details if any

### 4. Enhanced Webhook Handler
- **Endpoint**: `/api/webhooks/guesty`
- **Features**:
  - Queue-based processing (15 concurrent requests max)
  - Rate limiting with automatic retry
  - Idempotent event processing
  - Comprehensive error handling
  - Real-time statistics endpoint

### 5. Admin Interface
- **OAuth2 Configuration**:
  - Client credentials input with secure masking
  - Connection testing with real-time feedback
  - Token status monitoring
  - Scope display (read:listings, read:reservations, etc.)

- **Webhook Security**:
  - Secret generation and management
  - Webhook URL with copy functionality
  - Event subscription management
  - Real-time statistics dashboard

- **System Monitoring**:
  - Database connection status
  - OAuth token validity
  - Webhook queue depth
  - Processing statistics
  - Error rates and uptime

## Security Improvements

### 1. Authentication
- **Before**: Static API keys with no expiration
- **After**: OAuth2 tokens with automatic refresh and expiration

### 2. Webhook Verification
- **Before**: No signature verification
- **After**: HMAC-SHA256 signature verification with replay protection

### 3. Audit Trail
- **Before**: Limited logging
- **After**: Complete webhook event audit trail with verification status

## API Endpoints

### OAuth2 Management
- `POST /api/admin/guesty/test-connection` - Test OAuth2 connection
- `POST /api/admin/webhook/generate-secret` - Generate webhook secret

### Webhook Processing
- `POST /api/webhooks/guesty` - Secure webhook endpoint
- `GET /api/webhooks/guesty` - Webhook statistics

## Configuration

### Environment Variables
```bash
DATABASE_URL=postgresql://...
PGUSER=postgres
PGPASSWORD=...
```

### OAuth2 Scopes
- `read:listings` - Access listing information
- `read:reservations` - Access reservation data
- `read:calendar` - Access calendar availability
- `write:calendar` - Update calendar availability

## Monitoring & Observability

### Real-time Metrics
- Total webhook events processed
- Signature verification rate
- Queue depth and active requests
- Error rates and last event timestamp

### System Health
- Database connection status
- OAuth token validity
- Webhook processing status
- Rate limiting statistics

## Security Best Practices

1. **Token Management**:
   - Automatic refresh before expiration
   - Secure storage in database
   - In-memory caching with TTL

2. **Webhook Security**:
   - HMAC-SHA256 signature verification
   - Replay attack prevention
   - Event deduplication
   - Comprehensive audit logging

3. **Rate Limiting**:
   - Queue-based processing
   - Automatic retry with backoff
   - Concurrent request limiting

## Testing

The implementation includes comprehensive testing capabilities:
- OAuth2 connection testing
- Webhook secret generation
- Real-time system monitoring
- Error handling validation

## Next Steps

1. **Production Deployment**:
   - Configure real Guesty OAuth2 credentials
   - Set up webhook endpoints in Guesty dashboard
   - Monitor initial webhook processing

2. **Enhanced Monitoring**:
   - Set up alerts for failed verifications
   - Implement webhook retry mechanisms
   - Add performance metrics

3. **Security Hardening**:
   - Implement webhook IP allowlisting
   - Add rate limiting per source
   - Enhanced error reporting

## Files Modified/Created

### Core Services
- `lib/guesty-oauth.ts` - OAuth2 service
- `lib/webhook-security.ts` - Webhook security service

### API Endpoints
- `app/api/webhooks/guesty/route.ts` - Enhanced webhook handler
- `app/api/admin/guesty/test-connection/route.ts` - Connection testing
- `app/api/admin/webhook/generate-secret/route.ts` - Secret generation

### Database
- `prisma/schema.prisma` - Updated schema with OAuth2 and webhook fields

### UI Components
- `app/admin/page.tsx` - Enhanced admin interface

This implementation provides enterprise-grade security and monitoring for Guesty integrations while maintaining backward compatibility and ease of use.
