export const mainpageMedia = [
  { slot: 'hero-video-1', kind: 'video', section: 'Hero', en: 'Hero video 1', bm: 'Video utama 1', defaultUrl: '/hero-video/choir-1.mp4' },
  { slot: 'hero-poster-1', kind: 'image', section: 'Hero', en: 'Video 1 cover', bm: 'Gambar video 1', defaultUrl: '/hero-video/choir-1.jpg' },
  { slot: 'hero-video-2', kind: 'video', section: 'Hero', en: 'Hero video 2', bm: 'Video utama 2', defaultUrl: '/hero-video/choir-2.mp4' },
  { slot: 'hero-poster-2', kind: 'image', section: 'Hero', en: 'Video 2 cover', bm: 'Gambar video 2', defaultUrl: '/hero-video/choir-2.jpg' },
  { slot: 'hero-video-3', kind: 'video', section: 'Hero', en: 'Hero video 3', bm: 'Video utama 3', defaultUrl: '/hero-video/choir-3.mp4' },
  { slot: 'hero-poster-3', kind: 'image', section: 'Hero', en: 'Video 3 cover', bm: 'Gambar video 3', defaultUrl: '/hero-video/choir-3.jpg' },
  { slot: 'hero-background', kind: 'image', section: 'Hero', en: 'Hero background', bm: 'Latar utama', defaultUrl: '' },
  { slot: 'about-photo', kind: 'image', section: 'About SIBPR', en: 'About photo', bm: 'Gambar tentang SIBPR', defaultUrl: '/about-sibpr-people.png' },
  { slot: 'about-video', kind: 'video', section: 'About SIBPR', en: 'About video', bm: 'Video tentang SIBPR', defaultUrl: '' },
  { slot: 'events-photo', kind: 'image', section: 'Events & Activities', en: 'Events section photo', bm: 'Gambar acara', defaultUrl: '' },
  { slot: 'events-video', kind: 'video', section: 'Events & Activities', en: 'Events video', bm: 'Video acara', defaultUrl: '' },
  { slot: 'schedule-photo', kind: 'image', section: 'Activity Schedule', en: 'Schedule section photo', bm: 'Gambar jadual', defaultUrl: '' },
  { slot: 'schedule-video', kind: 'video', section: 'Activity Schedule', en: 'Schedule video', bm: 'Video jadual', defaultUrl: '' },
  { slot: 'women-photo', kind: 'image', section: 'Find Your Place', en: "Women's Ministry", bm: 'Pelayanan Wanita', defaultUrl: '/womens-ministry-group.png' },
  { slot: 'women-video', kind: 'video', section: 'Find Your Place', en: "Women's Ministry video", bm: 'Video Pelayanan Wanita', defaultUrl: '' },
  { slot: 'men-photo', kind: 'image', section: 'Find Your Place', en: "Men's Ministry", bm: 'Pelayanan Wira', defaultUrl: '/mens-ministry-group.png' },
  { slot: 'men-video', kind: 'video', section: 'Find Your Place', en: "Men's Ministry video", bm: 'Video Pelayanan Wira', defaultUrl: '' },
  { slot: 'youth-photo', kind: 'image', section: 'Find Your Place', en: 'Youth Ministry', bm: 'Pelayanan Muda Mudi', defaultUrl: '/youth-ministry-group.png' },
  { slot: 'youth-video', kind: 'video', section: 'Find Your Place', en: 'Youth Ministry video', bm: 'Video Pelayanan Muda Mudi', defaultUrl: '' },
  { slot: 'connect-photo', kind: 'image', section: 'Connect', en: 'Connect section photo', bm: 'Gambar hubungi kami', defaultUrl: '' },
  { slot: 'connect-video', kind: 'video', section: 'Connect', en: 'Connect video', bm: 'Video hubungi kami', defaultUrl: '' },
  { slot: 'site-logo', kind: 'image', section: 'Brand', en: 'Website logo', bm: 'Logo laman web', defaultUrl: '/sibpr-logo.jpeg' },
] as const

export type MediaSlot = typeof mainpageMedia[number]['slot']
export type MediaOverrides = Partial<Record<MediaSlot, string>>
export const mediaUrl = (overrides: MediaOverrides, slot: MediaSlot) => overrides[slot] || mainpageMedia.find(item => item.slot === slot)!.defaultUrl
