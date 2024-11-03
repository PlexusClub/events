document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const eventName = urlParams.get('eventName');

    document.getElementById('eventName').textContent = `Registration for ${eventName}`;
    document.getElementById('eventId').value = eventId;

    document.getElementById('registrationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            eventId: parseInt(formData.get('eventId'), 10),
            userName: formData.get('userName'),
            rollNo: formData.get('rollNo'),
            mobileNo: formData.get('mobileNo'),
            email: formData.get('email'),
            deptSection: `${formData.get('dept')}-${formData.get('section')}`
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registration successful!');
                window.location.href = 'index.html';
            } else {
                alert(`Registration failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
});