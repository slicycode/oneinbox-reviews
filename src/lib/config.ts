import { AppConfigPublic } from './types'

export const appConfig: AppConfigPublic = {
  projectName: 'OneInbox Review',
  projectSlug: 'oneinbox-review',
  keywords: [
    'OneInbox Review',
    'OneInbox Review Platform',
    'OneInbox Review System',
    'OneInbox Review Software',
  ],
  description: 'OneInbox Review is a platform for reviewing OneInbox.',
  auth: {
    enablePasswordAuth: true, // Enable password-based authentication
  },
  legal: {
    address: {
      street: 'Plot No 337, Workyard, Phase 2, Industrial Business &amp; Park',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160002',
      country: 'India',
    },
    email: 'no-reply@oneinbox.dev',
    phone: '+91 9876543210',
  },
  social: {
    twitter: 'https://twitter.com/cjsingg',
    instagram: 'https://instagram.com/-',
    linkedin: 'https://linkedin.com/-',
    facebook: 'https://facebook.com/-',
    youtube: 'https://youtube.com/-',
  },
  email: {
    senderName: 'OneInbox',
    senderEmail: 'no-reply@oneinbox.dev',
  },
  sync: {
    staleHours: 24,
  },
}
