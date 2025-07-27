import * as z from 'zod';

const FunnelStageSchema = z.enum(['top', 'bottom']);

const FacebookTopEventTypeSchema = z.enum(['ad.view', 'page.like', 'comment', 'video.view']);
const FacebookBottomEventTypeSchema = z.enum(['ad.click', 'form.submission', 'checkout.complete']);
const FacebookEventTypeSchema = z.union([FacebookTopEventTypeSchema, FacebookBottomEventTypeSchema]);

const FacebookUserLocationSchema = z.object({
  country: z.string(),
  city: z.string(),
});

const FacebookUserSchema = z.object({
  userId: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.enum(['male', 'female', 'non-binary']),
  location: FacebookUserLocationSchema,
});

const FacebookEngagementTopSchema = z.object({
  actionTime: z.string(),
  referrer: z.enum(['newsfeed', 'marketplace', 'groups']),
  videoId: z.string().nullable(),
});

const FacebookEngagementBottomSchema = z.object({
  adId: z.string(),
  campaignId: z.string(),
  clickPosition: z.enum(['top_left', 'bottom_right', 'center']),
  device: z.enum(['mobile', 'desktop']),
  browser: z.enum(['Chrome', 'Firefox', 'Safari']),
  purchaseAmount: z.string().nullable(),
});

const FacebookEngagementSchema = z.union([
  FacebookEngagementTopSchema,
  FacebookEngagementBottomSchema,
]);

export const FacebookEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.string(),
  source: z.literal('facebook'),
  funnelStage: FunnelStageSchema,
  eventType: FacebookEventTypeSchema,
  data: z.object({
    user: FacebookUserSchema,
    engagement: FacebookEngagementSchema,
  }),
});

export type FacebookEvent = z.infer<typeof FacebookEventSchema>;
