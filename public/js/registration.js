document.addEventListener('DOMContentLoaded', function() {
    const registrationList = document.getElementById('registrationList');
    const registrationForm = document.getElementById('registrationForm');
    const createRegistrationBtn = document.getElementById('createRegistrationBtn');
    const cancelRegistrationForm = document.getElementById('cancelRegistrationForm');
    const registrationFormContainer = document.getElementById('registrationFormContainer');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const eventSelect = document.getElementById('eventSelect'); 
    const formEventSelect = document.getElementById('event_id');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');

    let Event_id = null;

    // Check if user is logged in and has admin privileges
    function checkAdminAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }
    }

    // Load registrations for the current event
    async function loadRegistrations() {
        if (!Event_id) return;

        try {
            console.log(`Fetching registrations for event ID: ${Event_id}`);
            const response = await fetch(`/api/registrations?event_id=${Event_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch registrations: ${errorText}`);
            }

            const registrations = await response.json();
            displayRegistrations(registrations);
        } catch (error) {
            console.error('Error loading registrations:', error);
        }
    }

    // Display registrations in the UI
    function displayRegistrations(registrations) {
        registrationList.innerHTML = registrations.map(registration => `
            <div class="registration-card">
                <h3>${registration.name}</h3>
                <p>Roll No: ${registration.roll_no}</p>
                <p>Contact: ${registration.contact_number}</p>
                <p>Amount Paid: Rs${registration.amount_paid}</p>
                <button onclick="editRegistration(${registration.id})" class="btn">Edit</button>
                <button onclick="deleteRegistration(${registration.id})" class="btn">Delete</button>
            </div>
        `).join('');
    }

    // Load events for the dropdown
    async function loadEvents() {
        try {
            console.log('Fetching events');
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch events');

            const events = await response.json();
            console.log('Events fetched:', events);

            // Populate the main event select dropdown
            eventSelect.innerHTML = events.map(event => `
                <option value="${event.id}">${event.name}</option>
            `).join('');

            // Populate the form event select dropdown
            formEventSelect.innerHTML = events.map(event => `
                <option value="${event.id}">${event.name}</option>
            `).join('');

            // Set the current event ID if not already set
            if (!Event_id && events.length > 0) {
                Event_id = events[0].id;
                loadRegistrations();
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Create or update a registration
    async function saveRegistration(e) {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        const registrationData = Object.fromEntries(formData.entries());
        const registrationId = registrationData.id || null;
        if (registrationId) {
            delete registrationData.id;
        }

        // Log the registration data to check its structure
        console.log('Registration Data:', registrationData);

        // Validate required fields
        const requiredFields = ['event_id', 'name', 'roll_no', 'contact_number', 'year', 'branch', 'section', 'college', 'amount_paid'];
        for (const field of requiredFields) {
            if (!registrationData[field]) {
                console.error(`Field ${field} is required`);
                alert(`Field ${field} is required`);
                return;
            }
        }

        try {
            const url = registrationId ? `/api/registrations/${registrationId}` : '/api/registrations';
            const method = registrationId ? 'PUT' : 'POST';

            console.log(`Making ${method} request to ${url} with data:`, registrationData);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(registrationData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save registration: ${errorText}`);
            }

            loadRegistrations();
            registrationForm.reset();
            registrationFormContainer.style.display = 'none';
        } catch (error) {
            console.error('Error saving registration:', error);
        }
    }

    // Edit a registration
    window.editRegistration = async function(id) {
        try {
            console.log(`Fetching registration with ID: ${id}`);
            const response = await fetch(`/api/registrations/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch registration');

            const registration = await response.json();
            Object.keys(registration).forEach(key => {
                const field = document.getElementById(key);
                if (field) field.value = registration[key];
            });

            registrationFormContainer.style.display = 'block';
        } catch (error) {
            console.error('Error editing registration:', error);
        }
    }

    // Delete a registration
    window.deleteRegistration = async function(id) {
        if (!confirm('Are you sure you want to delete this registration?')) return;

        try {
            console.log(`Deleting registration with ID: ${id}`);
            const response = await fetch(`/api/registrations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete registration');

            loadRegistrations();
        } catch (error) {
            console.error('Error deleting registration:', error);
        }
    }

    // Download registrations as CSV
    exportCsvBtn.addEventListener('click', async () => {
        if (!Event_id) return;

        try {
            console.log(`Exporting registrations as CSV for event ID: ${Event_id}`);
            const response = await fetch(`/api/registrations/export/csv?event_id=${Event_id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to export CSV');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registrations_event_${Event_id}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    });
    // Event listeners
    createRegistrationBtn.addEventListener('click', () => {
        registrationForm.reset();
        document.getElementById('registrationId').value = '';
        registrationFormContainer.style.display = 'block';
    });

    cancelRegistrationForm.addEventListener('click', () => {
        registrationFormContainer.style.display = 'none';
    });

    registrationForm.addEventListener('submit', saveRegistration);

    eventSelect.addEventListener('change', (e) => {
        Event_id = e.target.value;
        loadRegistrations();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const registrationCards = document.querySelectorAll('.registration-card');
        registrationCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Initialize
    checkAdminAuth();
    loadEvents();
});
