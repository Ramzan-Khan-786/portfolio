export const emptyContent = {
  profile: null,
  navigation: [],
  projects: [],
  skills: [],
  showroom: [],
  socials: [],
  settings: [],
};
export function settingValue(settings, key, fallback = '') {
  return settings?.find((setting) => setting.key === key)?.value ?? fallback;
}
export function safeUrl(value, { internal = false, email = false } = {}) {
  if (typeof value !== 'string') return '';
  if (
    internal &&
    (/^\/(?!\/)[a-zA-Z0-9/#?=&._~-]*$/.test(value) || /^#[a-zA-Z][\w-]*$/.test(value))
  )
    return value;
  if (email && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? value
      : '';
  } catch {
    return '';
  }
}
