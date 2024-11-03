// Main application JavaScript file for event-related functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load events for public view
    loadPublicEvents();
});

async function loadPublicEvents() {
    try {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');

        const events = await response.json();
        displayPublicEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

function displayPublicEvents(events) {
    const container = document.getElementById('eventsContainer');
    if (!container) return;

    container.innerHTML = events.map(event => `
        <div class="event-card bg-white rounded-lg shadow-md p-6 mb-4">
            <h2 class="text-xl font-bold mb-2">${event.name}</h2>
            <p class="text-gray-600 mb-4">${event.description}</p>
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}
                </div>
                <div>
                    <strong>Time:</strong> ${event.start_time} - ${event.end_time}
                </div>
                <div>
                    <strong>Location:</strong> ${event.location}
                </div>
                <div>
                    <strong>Category:</strong> ${event.category}
                </div>
            </div>
            <button 
                onclick="window.location.href='/registration.html?eventId=${event.id}'"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Register Now
            </button>
        </div>
    `).join('');
}