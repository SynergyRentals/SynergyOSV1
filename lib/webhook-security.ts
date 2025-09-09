import crypto from 'crypto';
import { prisma } from './prisma';

interface WebhookVerificationResult {
  verified: boolean;
  error?: string;
  isDuplicate?: boolean;
}

class WebhookSecurityService {
  private static instance: WebhookSecurityService;
  private readonly REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  static getInstance(): WebhookSecurityService {
    if (!WebhookSecurityService.instance) {
      WebhookSecurityService.instance = new WebhookSecurityService();
    }
    return WebhookSecurityService.instance;
  }

  async verifyWebhookSignature(
    payload: string,
    signature: string,
    userId: string,
    signatureHeader: string = 'X-Guesty-Signature'
  ): Promise<WebhookVerificationResult> {
    try {
      // Get webhook secret from user config
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { guestyWebhookSecret: true },
      });

      if (!user?.guestyWebhookSecret) {
        return {
          verified: false,
          error: 'Webhook secret not configured',
        };
      }

      // Compute HMAC-SHA256
      const expectedSignature = crypto
        .createHmac('sha256', user.guestyWebhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      // Extract signature from header (remove 'sha256=' prefix if present)
      const receivedSignature = signature.replace(/^sha256=/, '');

      // Constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex')
      );

      if (!isValid) {
        return {
          verified: false,
          error: 'Invalid signature',
        };
      }

      return { verified: true };
    } catch (error) {
      return {
        verified: false,
        error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async checkReplayProtection(eventId: string): Promise<WebhookVerificationResult> {
    try {
      // Check if event already exists
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { eventId },
      });

      if (existingEvent) {
        // Check if it's within replay window
        const timeDiff = Date.now() - existingEvent.receivedAt.getTime();
        if (timeDiff < this.REPLAY_WINDOW_MS) {
          return {
            verified: false,
            isDuplicate: true,
            error: 'Duplicate event within replay window',
          };
        }
      }

      return { verified: true };
    } catch (error) {
      return {
        verified: false,
        error: `Replay protection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async storeWebhookEvent(
    eventId: string,
    eventType: string,
    payload: any,
    signature: string,
    verified: boolean,
    error?: string
  ): Promise<string> {
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        payload,
        signature,
        verified,
        error,
      },
    });

    return webhookEvent.id;
  }

  async processWebhook(
    eventId: string,
    eventType: string,
    payload: any,
    signature: string,
    userId: string
  ): Promise<{ success: boolean; webhookEventId: string; error?: string }> {
    // Verify signature
    const signatureResult = await this.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
      userId
    );

    if (!signatureResult.verified) {
      const webhookEventId = await this.storeWebhookEvent(
        eventId,
        eventType,
        payload,
        signature,
        false,
        signatureResult.error
      );

      return {
        success: false,
        webhookEventId,
        error: signatureResult.error,
      };
    }

    // Check replay protection
    const replayResult = await this.checkReplayProtection(eventId);
    if (!replayResult.verified) {
      const webhookEventId = await this.storeWebhookEvent(
        eventId,
        eventType,
        payload,
        signature,
        true,
        replayResult.error
      );

      return {
        success: false,
        webhookEventId,
        error: replayResult.error,
      };
    }

    // Store verified event
    const webhookEventId = await this.storeWebhookEvent(
      eventId,
      eventType,
      payload,
      signature,
      true
    );

    return {
      success: true,
      webhookEventId,
    };
  }

  async generateWebhookSecret(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  async cleanupOldEvents(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    
    const result = await prisma.webhookEvent.deleteMany({
      where: {
        receivedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  async getWebhookStats(userId: string) {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [totalEvents, verifiedEvents, recentEvents, lastEvent] = await Promise.all([
      prisma.webhookEvent.count(),
      prisma.webhookEvent.count({ where: { verified: true } }),
      prisma.webhookEvent.count({
        where: { receivedAt: { gte: last24Hours } },
      }),
      prisma.webhookEvent.findFirst({
        orderBy: { receivedAt: 'desc' },
        select: { receivedAt: true, eventType: true, verified: true },
      }),
    ]);

    return {
      totalEvents,
      verifiedEvents,
      recentEvents,
      lastEvent,
      verificationRate: totalEvents > 0 ? (verifiedEvents / totalEvents) * 100 : 0,
    };
  }
}

export const webhookSecurity = WebhookSecurityService.getInstance();
