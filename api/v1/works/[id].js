const { db, toWork, setCors } = require('../../../lib/turso')

module.exports = async (req, res) => {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' })

  try {
    const { id } = req.query
    const result = await db().execute({ sql: 'SELECT * FROM nico_works WHERE id = ?', args: [id] })
    if (!result.rows[0]) return res.status(404).json({ success: false, error: '作品不存在', code: 'NOT_FOUND' })
    res.status(200).json({ success: true, data: toWork(result.rows[0]) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: '伺服器錯誤', code: 'SERVER_ERROR' })
  }
}
