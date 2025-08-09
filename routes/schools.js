// routes/schools.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// validation helpers
function isValidLat(lat) { return typeof lat === 'number' && lat >= -90 && lat <= 90; }
function isValidLng(lng) { return typeof lng === 'number' && lng >= -180 && lng <= 180; }
function isNonEmptyString(v, maxLen = 500) { return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= maxLen; }

// POST /addSchool
router.post('/addSchool', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    const errors = [];
    if (!isNonEmptyString(name, 255)) errors.push('name is required (1-255 chars)');
    if (!isNonEmptyString(address, 500)) errors.push('address is required (1-500 chars)');

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (!Number.isFinite(latNum) || !isValidLat(latNum)) errors.push('latitude must be a number between -90 and 90');
    if (!Number.isFinite(lngNum) || !isValidLng(lngNum)) errors.push('longitude must be a number between -180 and 180');

    if (errors.length) return res.status(400).json({ success: false, errors });

    const sql = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [name.trim(), address.trim(), latNum, lngNum]);

    return res.status(201).json({ success: true, id: result.insertId, message: 'School added.' });
  } catch (err) {
    console.error('addSchool error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /listSchools?lat=..&lng=..&limit=..
router.get('/listSchools', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    let limit = parseInt(req.query.limit ?? '50', 10);

    if (!Number.isFinite(userLat) || !isValidLat(userLat) || !Number.isFinite(userLng) || !isValidLng(userLng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng query params required' });
    }
    if (!Number.isFinite(limit) || limit <= 0) limit = 50;
    limit = Math.min(limit, 200);

    const sql = `
      SELECT id, name, address, latitude, longitude,
      (6371 * acos(
         cos(radians(?)) * cos(radians(latitude)) *
         cos(radians(longitude) - radians(?)) +
         sin(radians(?)) * sin(radians(latitude))
      )) AS distance_km
      FROM schools
      ORDER BY distance_km ASC
      LIMIT ${limit};
    `;
    const params = [userLat, userLng, userLat];
    console.log('lat:', userLat, 'lng:', userLng, 'limit:', limit);
    console.log('params:', params);
    const [rows] = await pool.execute(sql, params);

    const out = rows.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: Number(r.latitude),
      longitude: Number(r.longitude),
      distance_km: r.distance_km === null ? null : Math.round(r.distance_km * 1000) / 1000
    }));

    return res.json(out);
  } catch (err) {
    console.error('listSchools error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
