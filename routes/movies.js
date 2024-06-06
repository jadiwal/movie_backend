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
    } else if(file.fieldname === "poster"){
      callBack(null, "./public");
    }
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
    }else if(file.fieldname === "poster"){
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

  let query =  `select * from movies WHERE status = 'TRUE'`
  if (search.trim() !== '') {
    query += ` AND title LIKE '%${search}%'`; // Adjust based on your database schema and search criteria
  }
  query += ' ORDER BY id DESC';
    db.query(query, (err, rows) =>{
        try{
            if(!err){
              if(rows.length > 0){
                res.status(200).json({ success: true, data: rows });
              }else{
                res.status(200).json({success:false, msg:'Movie Not Found'})
              }
            }else{
                res.status(500).json({ success: false, msg: "Movies Not Found" });
            }
        }
        catch(err){
            res.status(500).json({ success: false, msg: "Server Error" });
        }
    })
 
});

router.get('/single-movie/:id', function(req, res, next) {
  const search = req.params.search || '';

  let query =  `select * from movies`
  if (search.trim() !== '') {
    query += ` WHERE title LIKE '%${search}%'`; // Adjust based on your database schema and search criteria
  }

    db.query(query, (err, rows) =>{
        try{
            if(!err){
              if(rows.length > 0){
                res.status(200).json({ success: true, data: rows });
              }else{
                res.status(200).json({success:false, msg:'Movie Not Found'})
              }
            }else{
                res.status(500).json({ success: false, msg: "Movies Not Found" });
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


router.post('/delete-movie', (req, res) =>{
  let {id} = req.query
  let query =  `UPDATE movies SET status='FALSE', updated_date=now()
  WHERE id=${id}`


  db.query(query, (err) =>{
    if(err){
      return res.status(500).json({ success: false, msg: 'Server Error' });
    }
    res.status(200).json({ success: true, msg: 'Movie Deleted Successfully!' });
  })
})


router.get('/movie', function(req, res, next) {
  const search = req.query.search || '';

  let query =  `select * from movies where id =${search}`
 

    db.query(query, (err, rows) =>{
        try{
            if(!err){
                res.status(200).json({ success: true, data: rows });
            }else{
                res.status(500).json({ success: false, msg: "Movies Not Found" });
            }
        }
        catch(err){
            res.status(500).json({ success: false, msg: "Server Error" });
        }
    })
 
});



router.post('/update-movie', upload.single('poster'), (req, res) => {
  const { id } = req.query;
  const { title, type, year } = req.body;
  let posterQuery = ''; // Initialize an empty variable to hold the poster update query

  if (req.file) { // Check if a new poster file is uploaded
    const poster = req.file.filename;
    posterQuery = `, poster='${poster}'`; // Construct the poster update query
  }

  const query = `UPDATE movies
  SET title='${title}', 
      type='${type}', 
      year='${year}'
      ${posterQuery ? posterQuery : ''},
      updated_date=NOW()
  WHERE id=${id}`;

  db.query(query, (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, msg: 'Server Error' });
    }
    res.status(200).json({ success: true, msg: 'Movie Updated Successfully!' });
  });
});

module.exports = router;
