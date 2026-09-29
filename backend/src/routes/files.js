import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

const uploadsDir = path.resolve('data/uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const safeFieldname = file.fieldname.replace(/[^a-zA-Z0-9_-]/g, '_')
    cb(null, safeFieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    })
  } catch (error) {
    console.error('File upload error:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:filename', (req, res) => {
  const { filename } = req.params
  const filePath = path.resolve(uploadsDir, filename)

  if (!filePath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    res.json({ filename, content: fileContent })
  } else {
    res.status(404).json({ error: 'File not found' })
  }
})

export default router