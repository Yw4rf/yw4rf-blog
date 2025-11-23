export function loadImage(path) {
  try {
    return import.meta.glob('/public/**/*.{jpg,jpeg,png,gif,webp,avif}', { eager: true })[path];
  } catch {
    return null;
  }
}
