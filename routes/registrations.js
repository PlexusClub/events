import express from 'express';
import auth from '../middleware/auth.js';
import dbConfig from '../config/database.js';
import mysql from 'mysql2/promise';
import { Parser } from 'json2csv';
const router = express.Router();

// Helper function to check the event status
const getEventStatus = async (event_id) => {
    const connection = await mysql.createConnection(dbConfig);
    const [events] = await connection.query('SELECT status FROM events WHERE id = ?', [event_id]);
    await connection.end();

    if (events.length === 0) {
        throw new Error('Event not found');
    }

    return events[0].status;  
};

// Get all registrations for an event
router.get('/', auth, async (req, res) => {
    try {
        const { event_id } = req.query;
        if (!event_id) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [registrations] = await connection.execute('SELECT * FROM registrations WHERE event_id = ?', [event_id]);
        await connection.end();
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single registration
router.get('/:id', auth, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [registration] = await connection.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
        if (registration.length === 0) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        await connection.end();
        res.json(registration[0]);
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new registration
router.post('/', async (req, res) => {
    try {
        const { event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paid_to } = req.body;
        
        // Validate required fields
        if (!event_id || !name || !roll_no || !contact_number || !year || !branch || !section || !college || !amount_paid) {
            return res.status(400).json({ message: 'All fields except paid_to are required' });
        }

        // Set paid_to to null if not provided
        const paidTo = paid_to || null;

        // Check event status
        const eventStatus = await getEventStatus(event_id);
        if (eventStatus === 'completed') {
            return res.status(400).json({ message: 'Registrations are closed for this event as it has already ended.' });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.query(
            'INSERT INTO registrations (event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paid_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paidTo]
        );
        await connection.end();
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error creating registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update an existing registration (delete old one and insert new one)
router.put('/:id', auth, async (req, res) => {
    try {
        const { event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paid_to } = req.body;
        if (!event_id || !name || !roll_no || !contact_number || !year || !branch || !section || !college || !amount_paid) {
            return res.status(400).json({ message: 'All fields except paid_to are required' });
        }

        // Set paid_to to null if not provided
        const paidTo = paid_to || null;

        // Check event status
        const eventStatus = await getEventStatus(event_id);
        if (eventStatus === 'completed') {
            return res.status(400).json({ message: 'Registrations are closed for this event as it has already ended.' });
        }

        const connection = await mysql.createConnection(dbConfig);

        // Delete the old registration
        await connection.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);

        // Insert the new registration
        const [result] = await connection.query(
            'INSERT INTO registrations (event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paid_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paidTo]
        );
        await connection.end();

        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a registration
router.delete('/:id', auth, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
        await connection.end();
        res.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Export registrations as CSV
router.get('/export/csv', auth, async (req, res) => {
    try {
        const { event_id } = req.query;
        if (!event_id) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const connection = await mysql.createConnection(dbConfig);
        const [registrations] = await connection.execute('SELECT * FROM registrations WHERE event_id = ?', [event_id]);
        await connection.end();

        const fields = ['id', 'event_id', 'name', 'roll_no', 'contact_number', 'year', 'branch', 'section', 'college', 'amount_paid', 'paid_to'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(registrations);

        res.header('Content-Type', 'text/csv');
        res.attachment(`registrations_event_${event_id}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;