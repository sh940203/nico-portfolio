/**
 * 執行方式：node src/utils/seedWorks.js
 * 需先在 server/.env 填入正確的 CLOUDINARY_* 設定
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { connectDB, db } = require('./db')
const { uploadImage } = require('./cloudinary')

const PAINTINGS_DIR = '/Users/sh/Desktop/portfolio_images/paintings'
const PACKAGING_DIR = '/Users/sh/Desktop/portfolio_images/packaging'

// 畫作檔案清單（優先 jpg，去除 heic 和重複）
const PAINTINGS = [
  { file: 'D2EBFAED-515D-41E1-868C-DCF201F55EF7.jpg', title: '作品 #1', medium: '混合媒材', year: 2024 },
  { file: 'D4FE2BC2-8E25-4A73-B6DE-DE1E6EE5061A.jpg', title: '作品 #2', medium: '混合媒材', year: 2024 },
  { file: 'EF52708E-BB62-4CF4-BB3D-4779DDED02B2.jpg', title: '作品 #3', medium: '混合媒材', year: 2024 },
  { file: 'IMG_0804.jpg',  title: '作品 #4', medium: '攝影', year: 2024 },
  { file: 'IMG_7988.JPG',  title: '作品 #5', medium: '攝影', year: 2024 },
  { file: 'IMG_7989.JPG',  title: '作品 #6', medium: '攝影', year: 2024 },
  { file: '原子筆(1).jpg', title: '原子筆 II', medium: '原子筆', year: 2023 },
  { file: '原子筆.jpg',    title: '原子筆 I', medium: '原子筆', year: 2023 },
  { file: '油畫(1).jpg',   title: '油畫 II', medium: '油畫、畫布', year: 2023 },
  { file: '油畫.jpg',      title: '油畫 I', medium: '油畫、畫布', year: 2022 },
  { file: '粉彩(1).jpg',   title: '粉彩 II', medium: '粉彩', year: 2022 },
  { file: '粉彩(2).jpg',   title: '粉彩 III', medium: '粉彩', year: 2023 },
  { file: '粉彩(3).jpg',   title: '粉彩 IV', medium: '粉彩', year: 2023 },
  { file: '粉彩.jpg',      title: '粉彩 I', medium: '粉彩', year: 2022 },
  { file: '車2.png',       title: '汽車速寫', medium: '電腦繪圖', year: 2023 },
  { file: '電繪臨摹(1).jpg', title: '電繪臨摹 II', medium: '數位繪圖', year: 2023 },
  { file: '電繪臨摹(2).jpg', title: '電繪臨摹 III', medium: '數位繪圖', year: 2023 },
  { file: '電繪臨摹(3).png', title: '電繪臨摹 IV', medium: '數位繪圖', year: 2024 },
  { file: '電繪臨摹.jpg',    title: '電繪臨摹 I', medium: '數位繪圖', year: 2022 },
]

const PACKAGING_WORKS = [
  { file: 'IMG_0078.PNG', title: '便當盒包裝設計', medium: '包裝設計、印刷', year: 2024, description: '以日式便當美學為概念，結合環保材質與簡約線條，設計一套完整的便當盒包裝系統。' },
]

async function uploadFile(filePath, folder) {
  const buffer = fs.readFileSync(filePath)
  return uploadImage(buffer, { folder: `nico-portfolio/${folder}` })
}

async function workExists(title, category) {
  const res = await db().execute({
    sql: 'SELECT id FROM nico_works WHERE title = ? AND category = ?',
    args: [title, category],
  })
  return res.rows.length > 0
}

async function seed() {
  await connectDB()
  console.log('✅ DB connected\n')

  // --- Paintings ---
  console.log(`📸 上傳 ${PAINTINGS.length} 件畫作...`)
  for (let i = 0; i < PAINTINGS.length; i++) {
    const p = PAINTINGS[i]
    if (await workExists(p.title, 'painting')) {
      console.log(`  ⏭  跳過（已存在）: ${p.title}`)
      continue
    }
    const filePath = path.join(PAINTINGS_DIR, p.file)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  找不到檔案: ${p.file}`)
      continue
    }
    try {
      process.stdout.write(`  [${i + 1}/${PAINTINGS.length}] ${p.title} ... `)
      const img = await uploadFile(filePath, 'paintings')
      const id = uuidv4()
      const now = Math.floor(Date.now() / 1000)
      await db().execute({
        sql: `INSERT INTO nico_works (id, title, category, year, medium, description, cover_image_url, cover_image_public_id, cover_image_width, cover_image_height, detail_images, display_order, is_visible, is_featured, created_at, updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [id, p.title, 'painting', p.year, p.medium, p.description || '', img.url, img.publicId, img.width || null, img.height || null, '[]', i, 1, i < 3 ? 1 : 0, now, now],
      })
      console.log(`✅ ${img.url.split('/').pop()}`)
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }
  }

  // --- Packaging ---
  console.log(`\n📦 上傳 ${PACKAGING_WORKS.length} 件包裝設計...`)
  for (let i = 0; i < PACKAGING_WORKS.length; i++) {
    const p = PACKAGING_WORKS[i]
    if (await workExists(p.title, 'packaging')) {
      console.log(`  ⏭  跳過（已存在）: ${p.title}`)
      continue
    }
    const filePath = path.join(PACKAGING_DIR, p.file)
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  找不到檔案: ${p.file}`)
      continue
    }
    try {
      process.stdout.write(`  [${i + 1}/${PACKAGING_WORKS.length}] ${p.title} ... `)
      const img = await uploadFile(filePath, 'packaging')
      const id = uuidv4()
      const now = Math.floor(Date.now() / 1000)
      await db().execute({
        sql: `INSERT INTO nico_works (id, title, category, year, medium, description, cover_image_url, cover_image_public_id, cover_image_width, cover_image_height, detail_images, display_order, is_visible, is_featured, created_at, updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [id, p.title, 'packaging', p.year, p.medium, p.description || '', img.url, img.publicId, img.width || null, img.height || null, '[]', i, 1, 1, now, now],
      })
      console.log(`✅ ${img.url.split('/').pop()}`)
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }
  }

  console.log('\n🎉 Seed 完成！')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
