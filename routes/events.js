import express from 'express';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// GET /api/events (to fetch all events)
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM events ORDER BY date DESC');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/events (to create a new event)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description = null,
      date = null,
      start_time = null,
      end_time = null,
      location = null,
      organizer_name = null,
      organizer_contact = null,
      category = null,
      capacity = null,
      registration_fee = null,
      prerequisites = null,
      additional_info = null,
      is_virtual = false,
      virtual_link = null,
      image_url = null,
      status= null
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO events (name, description, date, start_time, end_time, location, organizer_name, organizer_contact, category, capacity, registration_fee, prerequisites, additional_info, is_virtual, virtual_link, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        description,
        date,
        start_time,
        end_time,
        location,
        organizer_name,
        organizer_contact,
        category,
        capacity,
        registration_fee,
        prerequisites,
        additional_info,
        is_virtual,
        virtual_link,
        image_url,
        status, 
      ]
    );
    await connection.end();
    res.status(201).json({ message: 'Event created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/events/:id (to update an event)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description = null,
      date = null,
      start_time = null,
      end_time = null,
      location = null,
      organizer_name = null,
      organizer_contact = null,
      category = null,
      capacity = null,
      registration_fee = null,
      prerequisites = null,
      additional_info = null,
      is_virtual = false,
      virtual_link = null,
      image_url = null,
      status = null
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE events SET name = ?, description = ?, date = ?, start_time = ?, end_time = ?, location = ?, organizer_name = ?, organizer_contact = ?, category = ?, capacity = ?, registration_fee = ?, prerequisites = ?, additional_info = ?, is_virtual = ?, virtual_link = ?, image_url = ? , WHERE id = ?,status = ?',
      [
        name,
        description,
        date,
        start_time,
        end_time,
        location,
        organizer_name,
        organizer_contact,
        category,
        capacity,
        registration_fee,
        prerequisites,
        additional_info,
        is_virtual,
        virtual_link,
        image_url,
        id,
        status
      ]
    );
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/events/:id (to delete an event)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute('DELETE FROM events WHERE id = ?', [id]);
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
