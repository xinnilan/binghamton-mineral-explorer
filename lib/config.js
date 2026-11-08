// Campus latitude and longitude 
export const CAMPUS_CENTER = [42.0894288,-75.9720688];
export const CAMPUS_ZOOM = 16;

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}
