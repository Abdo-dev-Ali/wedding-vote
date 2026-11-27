export const REF_KEY = "wedding_ref";

const REF_RE = /^[a-z0-9]{6,32}$/i;

export function isValidRef(value: string) {
  return REF_RE.test(value);
}

export function getStoredRef(): string | null {
  try {
    const v = localStorage.getItem(REF_KEY);
    return v && isValidRef(v) ? v : null;
  } catch {
    return null;
  }
}

export function clearStoredRef() {
  try {
    localStorage.removeItem(REF_KEY);
  } catch {
    // التخزين مش متاح: مش مشكلة
  }
}