const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

// Start xvfb on server startup to create a display
exec('Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log('Xvfb started successfully');
});

app.get('/xpra', (req, res) => {
  const host = req.query.host;
  const password = req.query.password;
  const random = crypto.randomBytes(20).toString('hex');
  const attachCommand = `DISPLAY=:99 XPRA_PASSWORD=${password} xpra attach ws://${host}`;
  const screenshotCommand = `XPRA_PASSWORD=${password} xpra screenshot ${random}.jpg ws://${host}`;
  const detachCommand = `XPRA_PASSWORD=${password} xpra detach ws://${host}`;
  
  exec(attachCommand, { env: { ...process.env, PULSE_SERVER: 'null' } }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    exec(screenshotCommand, { env: { ...process.env, PULSE_SERVER: 'null' } }, (error, stdout, stderr) => {
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
      exec(detachCommand, { env: { ...process.env, PULSE_SERVER: 'null' } }, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
        }
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

