import express from 'express';
import { readDatabase, writeDatabase } from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/events (to fetch all events)
router.get('/', async (req, res) => {
  try {
    const data = await readDatabase();
    res.json(data.events);
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
      status = null
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const data = await readDatabase();
    const newEvent = {
      id: Date.now(),
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
      status
    };
    data.events.push(newEvent);
    await writeDatabase(data);
    res.status(201).json({ message: 'Event created successfully', id: newEvent.id });
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

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const data = await readDatabase();
    const eventIndex = data.events.findIndex(event => event.id === parseInt(id));
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }

    data.events[eventIndex] = {
      ...data.events[eventIndex],
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
      status
    };

    await writeDatabase(data);
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
    const data = await readDatabase();
    const eventIndex = data.events.findIndex(event => event.id === parseInt(id));
    
    if (eventIndex === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }

    data.events.splice(eventIndex, 1);
    await writeDatabase(data);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;