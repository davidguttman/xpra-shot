const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')
const crypto = require('crypto')
const express = require('express')
const { exec } = require('child_process')

const app = express()
const port = process.env.PORT || 3000

const CROP_X = 5
const CROP_Y = 32

app.get('/xpra', async (req, res) => {
  const host = req.query.host
  const password = req.query.password
  const random = crypto.randomBytes(20).toString('hex')
  const command = `XPRA_PASSWORD=${password} xpra screenshot ${random}.png wss://${host}`

  try {
    await executeCommand(command)
    const filePath = path.resolve(__dirname, `${random}.png`)
    const buffer = await cropImage(filePath)
    await sendBuffer(res, buffer)
    console.log(`Buffer sent ${random}`)
    fs.unlinkSync(filePath)
  } catch (error) {
    handleError(res, error)
  }
})

const executeCommand = command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(`exec error: ${error}`)
      resolve()
    })
  })
}

const cropImage = filePath => {
  return Jimp.read(filePath)
    .then(image => {
      const w = image.bitmap.width - CROP_X
      const h = image.bitmap.height - CROP_Y
      return image.crop(CROP_X, CROP_Y, w, h)
    })
    .then(image => image.getBufferAsync(Jimp.MIME_PNG))
}

const sendBuffer = (res, buffer) => {
  res.setHeader('Content-Type', 'image/png')
  res.send(buffer)
}

const handleError = (res, error) => {
  console.error(error)
  res.status(500).send('Server Error')
}

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
