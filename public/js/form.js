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
            event_id: parseInt(formData.get('eventId'), 10) || 0, 
            name: formData.get('userName') || '',
            roll_no: formData.get('rollNo') || '',
            contact_number: formData.get('mobileNo') || '',
            email: formData.get('email') || '',
            branch: formData.get('dept') || '',
            section: formData.get('section') || '',
            college: formData.get('college') || 'MRCE',
            year: formData.get('year') || '',
            amount_paid: formData.get('amountPaid') || '0',
        };
        console.log('Data to be sent:', data);
        try {
            const response = await fetch('/api/registrations', {
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
                console.log('Server response:', result);
                alert(`Registration failed: ${result.message}`);
                
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during registration. Please try again.');
        }
    });
});
