const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { secret } = require('./config.json');
const jwt = require('jsonwebtoken');
module.exports = router;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'softinc',
  database: 'goodbits_test'
});

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  connection.query(`SELECT username FROM goodbits_test.userlists WHERE username = ? and password = ?;`, [username, password], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'Invalid username' });
    const token = jwt.sign({ sub: username }, secret);
    res.send({
      'response': 'success',
      'accessToken': token,
      'username': username,
      'email': username,
      'roles': ['ROLE_USER', 'ROLE_MODERATOR'],
    });
  });
});

router.post('/register_user', async (req, res) => {
  const { username, password, email } = req.body
  let records = [[username, password, email]]
  connection.query(`INSERT INTO goodbits_test.userlists (username, password, email) VALUES ?`, [records], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'Error occured' });
    res.send({
      'response': 'success'
    });
  });
});

router.post('/add_emp_detail', async (req, res) => {
  const { emp_id, emp_name, emp_email, emp_age, emp_address, emp_mob } = req.body
  let records = [[parseInt(emp_id), emp_name, emp_email, emp_age ? parseInt(emp_age) : null, emp_address, emp_mob]]
  connection.query(`INSERT INTO goodbits_test.employee_details (emp_id, emp_name, emp_email, emp_age, emp_address, emp_mob) VALUES ?`, [records], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'Error occured' });
    res.send({
      'response': 'success'
    });
  });
});

router.get('/get_all_employees', function (req, res) {
  connection.query(`SELECT * FROM goodbits_test.employee_details`, [], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'No result' });
    res.send({
      'response': 'success',
      'employee_details': result
    });
  });
});

router.post('/delete_emp_detail', function (req, res) {
  const { emp_id } = req.body
  connection.query(`DELETE FROM goodbits_test.employee_details WHERE emp_id=? LIMIT 1;`, [emp_id], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'No result' });
    res.send({
      'response': 'success'
    });
  });
});

router.post('/update_emp_detail', function (req, res) {
  const { emp_id, column, new_value } = req.body
  let query;
  if (!new_value)
    query = `UPDATE goodbits_test.employee_details SET ${column}=null WHERE emp_id=${emp_id};`;
  else if (column == 'emp_age')
    query = `UPDATE goodbits_test.employee_details SET ${column}=${new_value} WHERE emp_id=${emp_id};`;
  else query = `UPDATE goodbits_test.employee_details SET ${column}='${new_value}' WHERE emp_id=${emp_id};`;

  connection.query(query, [], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'No result' });
    res.send({
      'response': 'success'
    });
  });
});

router.get('/search_emp_detail/:column/:new_value', function (req, res) {
  const { column, new_value } = req.params
  connection.query(`SELECT * FROM goodbits_test.employee_details WHERE ${column}=?`, [new_value], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: 'No result' });
    res.send({
      'response': 'success',
      'employee_details': result
    });
  });
});
