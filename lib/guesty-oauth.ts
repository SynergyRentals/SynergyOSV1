import { prisma } from './prisma';

interface GuestyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface GuestyAuthConfig {
  clientId: string;
  clientSecret: string;
}

class GuestyOAuthService {
  private static instance: GuestyOAuthService;
  private tokenCache: Map<string, { token: string; expiresAt: Date }> = new Map();

  static getInstance(): GuestyOAuthService {
    if (!GuestyOAuthService.instance) {
      GuestyOAuthService.instance = new GuestyOAuthService();
    }
    return GuestyOAuthService.instance;
  }

  async getAccessToken(userId: string): Promise<string> {
    // Check cache first
    const cached = this.tokenCache.get(userId);
    if (cached && cached.expiresAt > new Date(Date.now() + 10 * 60 * 1000)) { // 10 min buffer
      return cached.token;
    }

    // Get user's OAuth config
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        guestyClientId: true,
        guestyClientSecret: true,
        guestyAccessToken: true,
        guestyTokenExpiresAt: true,
      },
    });

    if (!user?.guestyClientId || !user?.guestyClientSecret) {
      throw new Error('Guesty OAuth credentials not configured');
    }

    // Check if stored token is still valid (with 5-10 min buffer for refresh)
    if (
      user.guestyAccessToken &&
      user.guestyTokenExpiresAt &&
      user.guestyTokenExpiresAt > new Date(Date.now() + 5 * 60 * 1000)
    ) {
      // Update cache
      this.tokenCache.set(userId, {
        token: user.guestyAccessToken,
        expiresAt: user.guestyTokenExpiresAt,
      });
      return user.guestyAccessToken;
    }

    // Fetch new token
    const token = await this.fetchNewToken({
      clientId: user.guestyClientId,
      clientSecret: user.guestyClientSecret,
    });

    // Store in database
    const expiresAt = new Date(Date.now() + token.expires_in * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: {
        guestyAccessToken: token.access_token,
        guestyTokenExpiresAt: expiresAt,
      },
    });

    // Update cache
    this.tokenCache.set(userId, {
      token: token.access_token,
      expiresAt,
    });

    return token.access_token;
  }

  private async fetchNewToken(config: GuestyAuthConfig): Promise<GuestyTokenResponse> {
    const response = await fetch('https://open-api.guesty.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: 'read:listings read:reservations read:calendar write:calendar',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch Guesty token: ${response.status} ${error}`);
    }

    return response.json();
  }

  async makeAuthenticatedRequest(
    userId: string,
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken(userId);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
      
      console.log(`Rate limited, waiting ${delay}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry once
      return this.makeAuthenticatedRequest(userId, url, options);
    }

    return response;
  }

  async testConnection(userId: string): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        userId,
        'https://open-api.guesty.com/v1/listings?limit=1'
      );
      return response.ok;
    } catch (error) {
      console.error('Guesty connection test failed:', error);
      return false;
    }
  }

  // Clear token cache (useful for testing)
  clearCache(userId?: string): void {
    if (userId) {
      this.tokenCache.delete(userId);
    } else {
      this.tokenCache.clear();
    }
  }
}

export const guestyOAuth = GuestyOAuthService.getInstance();
