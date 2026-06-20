// 縮圖路徑：把本地原圖映射到 /images/thumbs/<同層>/<名稱>.jpg（800px、輕量）
// 非本地圖（Vercel Blob 等 https）或無法對應者，回傳原圖。
export function thumbUrl(url) {
  if (!url || typeof url !== 'string') return url
  const m = url.match(/^\/images\/(paintings|packaging)\/(.+)\.[^.]+$/)
  if (!m) return url
  return `/images/thumbs/${m[1]}/${m[2]}.jpg`
}
