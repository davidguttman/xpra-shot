const fs = require('fs')
const path = require('path')
const Jimp = require('jimp')
const crypto = require('crypto')
const express = require('express')
const { exec } = require('child_process')

const app = express()
const port = process.env.PORT || 3000

const CROP_X = 5
const CROP_Y = 31

app.get('/xpra', (req, res) => {
  const host = req.query.host
  const password = req.query.password
  const random = crypto.randomBytes(20).toString('hex')
  const command = `XPRA_PASSWORD=${password} xpra screenshot ${random}.jpg ws://${host}`

  exec(command, (error, stdout, stderr) => {
    if (error) return console.error(`exec error: ${error}`)

    const filePath = path.resolve(__dirname, `${random}.jpg`)
    Jimp.read(filePath)
      .then(image => {
        const w = image.bitmap.width - CROP_X
        const h = image.bitmap.height - CROP_Y
        return image.crop(CROP_X, CROP_Y, w, h)
      })
      .then(image => image.write(filePath))
      .then(() => {
        res.sendFile(filePath, err => {
          if (err) return console.error(`sendFile error: ${err}`)

          fs.unlink(filePath, err => {
            if (err) console.error(`unlink error: ${err}`)
          })
        })
      })
      .catch(err => console.error(err))
  })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
