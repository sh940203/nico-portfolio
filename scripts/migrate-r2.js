#!/usr/bin/env node
/**
 * 搬移腳本：把 nico 圖片從舊 URL 複製到 nico-portfolio R2 bucket
 * 並輸出 Turso DB 更新 SQL
 *
 * 在本機執行前先設好環境變數：
 *   SITE_URL             https://nico-portfolio-seven.vercel.app
 *   R2_ACCOUNT_ID        Cloudflare Account ID
 *   R2_ACCESS_KEY_ID     nico-portfolio bucket 的 API Token Access Key
 *   R2_SECRET_ACCESS_KEY nico-portfolio bucket 的 API Token Secret
 *   R2_BUCKET            nico-portfolio
 *   R2_PUBLIC_URL        https://pub-62df61e9b1134e1f89f87eaf776710ae.r2.dev
 *
 * 執行方式：
 *   SITE_URL=https://... R2_ACCOUNT_ID=... ... node scripts/migrate-r2.js
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const {
  SITE_URL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET = 'nico-portfolio',
  R2_PUBLIC_URL = 'https://pub-62df61e9b1134e1f89f87eaf776710ae.r2.dev',
} = process.env

const missing = ['SITE_URL', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY']
  .filter(k => !process.env[k])
if (missing.length) {
  console.error('缺少環境變數：', missing.join(', '))
  process.exit(1)
}

const PUBLIC_URL = R2_PUBLIC_URL.replace(/\/$/, '')

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

function get(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout: 30000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject)
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: res.headers['content-type'] || 'image/jpeg',
        status: res.statusCode,
      }))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function fetchWorks() {
  const works = []
  const seen = new Set()

  for (const cat of ['painting', 'packaging', 'illustration', 'design', 'exhibition', 'other']) {
    try {
      const { buffer } = await get(`${SITE_URL}/api/v1/works?category=${cat}&limit=100`)
      const r = JSON.parse(buffer.toString())
      const list = r?.data?.data ?? r?.data ?? []
      for (const w of list) {
        if (!seen.has(w.id)) { seen.add(w.id); works.push(w) }
      }
    } catch {}
  }

  if (works.length === 0) {
    // fallback: no category filter
    const { buffer } = await get(`${SITE_URL}/api/v1/works?limit=200`)
    const r = JSON.parse(buffer.toString())
    const list = r?.data?.data ?? r?.data ?? []
    for (const w of list) works.push(w)
  }

  return works
}

async function main() {
  console.log('載入作品列表...')
  const works = await fetchWorks()
  console.log(`共 ${works.length} 筆作品`)

  const sqlLines = []
  let skipped = 0
  let migrated = 0
  let failed = 0

  for (const work of works) {
    const oldUrl = work.coverImage?.url
    if (!oldUrl) { skipped++; continue }

    if (oldUrl.startsWith(PUBLIC_URL + '/')) {
      console.log(`SKIP ${work.id} 已在新 bucket`)
      skipped++
      continue
    }

    process.stdout.write(`搬移 [${work.id}] ${work.title || ''}... `)

    try {
      const { buffer, contentType, status } = await get(oldUrl)
      if (status >= 400) throw new Error(`HTTP ${status}`)

      // 嘗試保留原始路徑；確保以 nico/ 開頭
      let key
      try {
        const p = new URL(oldUrl).pathname.replace(/^\//, '')
        key = p.startsWith('nico/') ? p : `nico/${path.basename(p)}`
      } catch {
        const ext = (contentType.split('/')[1] || 'jpg').replace(/;.*/, '')
        key = `nico/${work.id}-${Date.now()}.${ext}`
      }

      await s3.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType.split(';')[0].trim(),
      }))

      const newUrl = `${PUBLIC_URL}/${key}`
      console.log(`OK\n  ${oldUrl}\n  → ${newUrl}`)

      sqlLines.push(
        `UPDATE nico_works SET cover_image_url='${newUrl}', cover_image_public_id='${key}', updated_at=datetime('now') WHERE id=${work.id};`
      )
      migrated++
    } catch (err) {
      console.log(`FAIL: ${err.message}`)
      failed++
    }
  }

  console.log(`\n完成：搬移 ${migrated}、略過 ${skipped}、失敗 ${failed}`)

  if (sqlLines.length > 0) {
    const sqlPath = path.join(__dirname, 'turso-updates.sql')
    fs.writeFileSync(sqlPath, sqlLines.join('\n') + '\n')
    console.log(`\nSQL 已存至 ${sqlPath}`)
    console.log('執行方式：')
    console.log('  turso db shell <你的-db-名稱> < scripts/turso-updates.sql')
    console.log('\n或逐行複製到 Turso 控制台執行：')
    sqlLines.forEach(l => console.log(' ', l))
  }
}

main().catch(err => { console.error(err); process.exit(1) })
