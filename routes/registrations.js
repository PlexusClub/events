import express from 'express';
import auth from '../middleware/auth.js';
import { readDatabase, writeDatabase } from '../config/database.js';
import { Parser } from 'json2csv';
const router = express.Router();

// Helper function to check the event status
const getEventStatus = async (event_id) => {
    const data = await readDatabase();
    const event = data.events.find(e => e.id === parseInt(event_id));
    if (!event) {
        throw new Error('Event not found');
    }
    return event.status;
};

// Get all registrations for an event
router.get('/', auth, async (req, res) => {
    try {
        const { event_id } = req.query;
        if (!event_id) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const data = await readDatabase();
        const registrations = data.registrations.filter(r => r.event_id === parseInt(event_id));
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get a single registration
router.get('/:id', auth, async (req, res) => {
    try {
        const data = await readDatabase();
        const registration = data.registrations.find(r => r.id === parseInt(req.params.id));
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }
        res.json(registration);
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create a new registration
router.post('/', async (req, res) => {
    try {
        const { event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paid_to } = req.body;
        
        if (!event_id || !name || !roll_no || !contact_number || !year || !branch || !section || !college || !amount_paid) {
            return res.status(400).json({ message: 'All fields except paid_to are required' });
        }

        const paidTo = paid_to || null;

        const eventStatus = await getEventStatus(event_id);
        if (eventStatus === 'completed') {
            return res.status(400).json({ message: 'Registrations are closed for this event as it has already ended.' });
        }

        const data = await readDatabase();
        const newRegistration = {
            id: Date.now(),
            event_id: parseInt(event_id),
            name,
            roll_no,
            contact_number,
            year,
            branch,
            section,
            college,
            amount_paid,
            paid_to: paidTo
        };
        data.registrations.push(newRegistration);
        await writeDatabase(data);
        res.status(201).json(newRegistration);
    } catch (error) {
        console.error('Error creating registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update an existing registration
router.put('/:id', auth, async (req, res) => {
    try {
        const { event_id, name, roll_no, contact_number, year, branch, section, college, amount_paid, paid_to } = req.body;
        if (!event_id || !name || !roll_no || !contact_number || !year || !branch || !section || !college || !amount_paid) {
            return res.status(400).json({ message: 'All fields except paid_to are required' });
        }

        const paidTo = paid_to || null;

        const eventStatus = await getEventStatus(event_id);
        if (eventStatus === 'completed') {
            return res.status(400).json({ message: 'Registrations are closed for this event as it has already ended.' });
        }

        const data = await readDatabase();
        const registrationIndex = data.registrations.findIndex(r => r.id === parseInt(req.params.id));
        if (registrationIndex === -1) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        data.registrations[registrationIndex] = {
            ...data.registrations[registrationIndex],
            event_id: parseInt(event_id),
            name,
            roll_no,
            contact_number,
            year,
            branch,
            section,
            college,
            amount_paid,
            paid_to: paidTo
        };

        await writeDatabase(data);
        res.json(data.registrations[registrationIndex]);
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete a registration
router.delete('/:id', auth, async (req, res) => {
    try {
        const data = await readDatabase();
        const registrationIndex = data.registrations.findIndex(r => r.id === parseInt(req.params.id));
        if (registrationIndex === -1) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        data.registrations.splice(registrationIndex, 1);
        await writeDatabase(data);
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

        const data = await readDatabase();
        const event = data.events.find(e => e.id === parseInt(event_id));
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const registrations = data.registrations.filter(r => r.event_id === parseInt(event_id));

        // Replace event_id with event name in registrations
        const registrationsWithEventName = registrations.map(registration => ({
            ...registration,
            event_name: event.name,
            event_id: undefined
        }));

        const fields = ['id', 'event_name', 'name', 'roll_no', 'contact_number', 'year', 'branch', 'section', 'college', 'amount_paid', 'paid_to'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(registrationsWithEventName);

        res.header('Content-Type', 'text/csv');
        res.attachment(`registrations_event_${event_id}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;