const express = require('express');
const router = express.Router();
const multer = require('multer');
const moment = require('moment');
const path = require('path');

console.log(path)
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    if (file.fieldname === "movie_image") {
      callBack(null, "./public");
    }  // Adjust path as needed
  },
  filename: (req, file, callBack) => {
    if (file.fieldname === "movie_image") {
      const filename =
        req.body.title +
        "-genre" +
        "-" +
        moment() +
        path.extname(file.originalname);
      image_path = "uploads/movies/" + filename;
    }
    callBack(null, image_path); 
  }
});

var upload = multer({
  storage: storage,
});

router.get('/all-movies', function(req, res, next) {
  const search = req.query.search || '';

  let query =  `select * from movies`
  if (search.trim() !== '') {
    query += ` WHERE title LIKE '%${search}%'`; // Adjust based on your database schema and search criteria
  }

    db.query(query, (err, rows) =>{
        try{
            if(!err){
                res.status(200).json({ success: true, data: rows });
            }else{
                res.status(500).json({ success: false, msg: "Server Error" });
            }
        }
        catch(err){
            res.status(500).json({ success: false, msg: "Server Error" });
        }
    })
 
});

router.post('/add-movie', upload.single('movie_image'), (req, res) => { // Use upload.single
  const { title, type, date } = req.body;
  const poster = req.file ? req.file.filename : null; // Handle missing file gracefully

  if (!poster) {
    return res.status(400).json({ success: false, msg: 'No image file uploaded' });
  }

  const query = `INSERT INTO movies (title, poster, type, year, status) VALUES (?, ?, ?, ?, ?)`;
  const values = [title, poster, type, date, 'TRUE'];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Database error:', err); // Log specific error details
      return res.status(500).json({ success: false, msg: 'Server Error' });
    }
    res.status(200).json({ success: true, msg: 'Data Added Successfully!' });
  });
});

module.exports = router;
