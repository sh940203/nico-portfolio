/**
 * 本地 seed：讀取 seedData.json，使用 public/images/ 靜態路徑
 * 執行：node src/utils/seedWorksLocal.js （會先清空 nico_works 再重建）
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { connectDB, db } = require('./db')

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seedData.json'), 'utf8'))

async function seed() {
  await connectDB()
  console.log('✅ DB connected')
  await db().execute('DELETE FROM nico_works')
  console.log('🗑  已清空舊作品\n')

  let order = 0
  console.log(`🎨 寫入 ${data.paintings.length} 件畫作...`)
  for (const p of data.paintings) {
    const now = Math.floor(Date.now() / 1000)
    await db().execute({
      sql: `INSERT INTO nico_works (id, title, category, series, level, year, medium, description, cover_image_url, cover_image_public_id, detail_images, display_order, is_visible, is_featured, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [uuidv4(), p.title, 'painting', p.series, p.level || null, p.year, p.medium, p.description || '',
             `/images/paintings/${p.file}`, `local/paintings/${p.file}`, '[]',
             order++, 1, p.featured ? 1 : 0, now, now],
    })
  }
  console.log('  ✅ 完成')

  order = 0
  console.log(`\n📦 寫入 ${data.packaging.length} 件包裝設計...`)
  for (const p of data.packaging) {
    const now = Math.floor(Date.now() / 1000)
    const details = (p.details || []).map(d => ({
      url: `/images/packaging/${d.file}`,
      publicId: `local/packaging/${d.file}`,
      caption: d.caption,
    }))
    await db().execute({
      sql: `INSERT INTO nico_works (id, title, category, series, year, medium, description, cover_image_url, cover_image_public_id, detail_images, display_order, is_visible, is_featured, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [uuidv4(), p.title, 'packaging', p.series, p.year, p.medium, p.description || '',
             `/images/packaging/${p.file}`, `local/packaging/${p.file}`, JSON.stringify(details),
             order++, 1, p.featured ? 1 : 0, now, now],
    })
    console.log(`  ✅ ${p.title}（含 ${details.length} 張細節圖）`)
  }

  console.log(`\n🎉 完成！畫作 ${data.paintings.length} 件、包裝 ${data.packaging.length} 件`)
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
