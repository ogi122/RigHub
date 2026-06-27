const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/');
  },
  filename: (req, file, callback) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    callback(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;