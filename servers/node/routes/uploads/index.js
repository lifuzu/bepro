/*jslint node: true */
"use strict";

const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');

/* configure the multer. */
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const dir = path.join('./uploads', file.mimetype);
    mkdirp(dir, function (err) {
      if (err) console.log(err);
      else callback(null, dir);
    });

  },
  filename: function (req, file, callback) {
    callback(null, file.originalname.substring(0, 4) + '-' + Date.now());
  }
});
// max upload 9 files
const uploads = multer({ storage : storage }).array('file', 9);


/* POST uploads/ to upload files */
router.post('/', function(req, res, next) {
  uploads(req, res, function(err) {
    if(err) {
      console.log(err);
      return res.end("Error uploading file.");
    }
    res.json(req.files);
  });
});

module.exports = router;