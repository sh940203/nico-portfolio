// Cloudflare R2（S3 相容）：取代 Vercel Blob。免費 10GB、流量不收費。
// serverless 與本地 Express 共用。
const { AwsClient } = require('aws4fetch')

// 從 Cloudflare 複製貼上的環境變數常夾帶看不見的字元（空白、U+2028 等），一律清掉
const clean = (v) => (v ?? '').replace(/\s+/g, '')

function config() {
  const accountId = clean(process.env.R2_ACCOUNT_ID)
  const accessKeyId = clean(process.env.R2_ACCESS_KEY_ID)
  const secretAccessKey = clean(process.env.R2_SECRET_ACCESS_KEY)
  const bucket = clean(process.env.R2_BUCKET)
  const publicUrl = clean(process.env.R2_PUBLIC_URL).replace(/\/+$/, '')
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error('尚未設定 Cloudflare R2（缺 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_URL）')
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl }
}

function client(c) {
  return new AwsClient({
    accessKeyId: c.accessKeyId,
    secretAccessKey: c.secretAccessKey,
    service: 's3',
    region: 'auto',
  })
}

const objectUrl = (c, key) =>
  `https://${c.accountId}.r2.cloudflarestorage.com/${c.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`

// 上傳 Buffer，回傳公開網址
async function putObject(key, buffer, contentType) {
  const c = config()
  const res = await client(c).fetch(objectUrl(c, key), {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: buffer,
  })
  if (!res.ok) throw new Error(`R2 上傳失敗（${res.status}）`)
  return `${c.publicUrl}/${key}`
}

// 依公開網址刪除；不是這個 R2 bucket 的網址（舊的 Vercel Blob / Cloudinary / 本地路徑）一律略過
async function deleteByUrl(url) {
  if (!url || !/^https?:\/\//.test(url)) return false
  const c = config()
  if (!url.startsWith(c.publicUrl + '/')) return false
  const key = decodeURIComponent(url.slice(c.publicUrl.length + 1))
  const res = await client(c).fetch(objectUrl(c, key), { method: 'DELETE' })
  return res.ok
}

module.exports = { putObject, deleteByUrl }
