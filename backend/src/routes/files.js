import { Router } from 'express'
import multer from 'multer'
import path from 'path'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
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
  const filePath = path.join('data/uploads', filename)

  import('fs').then(fs => {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      res.json({ filename, content: fileContent })
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }).catch(() => res.status(500).json({ error: 'Failed to read file' }))
})

export default router