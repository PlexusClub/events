document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const eventList = document.getElementById('eventList');
    const eventForm = document.getElementById('eventForm');
    const eventFormContainer = document.getElementById('eventFormContainer');
    const createEventBtn = document.getElementById('createEventBtn');
    const cancelEventFormBtn = document.getElementById('cancelEventForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    let events = [];
    let currentEventId = null;

    // Fetch and render events
    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch events');
            events = await response.json();
            renderEvents(events);
        } catch (err) {
            eventList.innerHTML = `<div class="text-red-500 p-4">${err.message}</div>`;
        }
    };

    const renderEvents = (eventsToRender) => {
        if (eventsToRender.length === 0) {
            eventList.innerHTML = '<div class="text-center p-4">No events found</div>';
            return;
        }

        const table = `
            <table class="w-full">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventsToRender.map(event => `
                        <tr>
                            <td>${event.name}</td>
                            <td>${new Date(event.date).toLocaleDateString()}</td>
                            <td>${event.location}</td>
                            <td>${event.category}</td>
                            <td>${event.status}</td>
                            <td>
                                <button onclick="editEvent(${event.id})" class="btn btn-blue">Edit</button>
                                <button onclick="deleteEvent(${event.id})" class="btn btn-red">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        eventList.innerHTML = table;
    };

    // Event form handling
    createEventBtn.addEventListener('click', () => {
        currentEventId = null;
        eventForm.reset();
        eventFormContainer.style.display = 'block';
        eventList.style.display = 'none';
    });

    cancelEventFormBtn.addEventListener('click', () => {
        eventFormContainer.style.display = 'none';
        eventList.style.display = 'block';
    });

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(eventForm);
        const eventData = Object.fromEntries(formData.entries());
        // Set default values for optional fields
        eventData.prerequisites = eventData.prerequisites || null;
        eventData.additional_info = eventData.additional_info || null;
        eventData.virtual_link = eventData.virtual_link || null;
        eventData.image_url = eventData.image_url || null;
        eventData.is_virtual = formData.get('is_virtual') === 'on';

        try {
            const url = currentEventId 
                ? `http://localhost:3000/api/events/${currentEventId}`
                : 'http://localhost:3000/api/events';
            const method = currentEventId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            if (!response.ok) throw new Error('Failed to save event');
            await fetchEvents();
            eventFormContainer.style.display = 'none';
            eventList.style.display = 'block';
        } catch (err) {
            alert(err.message);
        }
    });

    // Edit event
    window.editEvent = (id) => {
        currentEventId = id;
        const event = events.find(e => e.id === id);
        if (event) {
            Object.keys(event).forEach(key => {
                const field = document.getElementById(key);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = event[key];
                    } else {
                        field.value = event[key];
                    }
                }
            });
            eventFormContainer.style.display = 'block';
            eventList.style.display = 'none';
        }
    };

    // Delete event
    window.deleteEvent = async (id) => {
        if (confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/events/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to delete event');
                await fetchEvents();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    // Search functionality
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEvents = events.filter(event => 
            event.name.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm)
        );
        renderEvents(filteredEvents);
    });

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Virtual event checkbox handling
    document.getElementById('is_virtual').addEventListener('change', function() {
        document.getElementById('virtualLinkContainer').style.display = this.checked ? 'block' : 'none';
    });

    // Initial fetch
    fetchEvents();
});