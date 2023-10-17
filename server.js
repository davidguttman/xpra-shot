const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

app.get('/xpra', (req, res) => {
  const host = req.query.host;
  const password = req.query.password;
  const random = crypto.randomBytes(20).toString('hex');
  const command = `XPRA_PASSWORD=${password} xpra screenshot ${random}.jpg ws://${host}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    const filePath = path.resolve(__dirname, `${random}.jpg`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`sendFile error: ${err}`);
      } else {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`unlink error: ${err}`);
        });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

