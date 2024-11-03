document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel');
    const list = document.querySelector('.list');
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    const runningTime = document.querySelector('.carousel .timeRunning');
    const backBtn = document.querySelector('.back');

    const timeRunning = 3000;
    const timeAutoNext = 7000;

    let runTimeOut;
    let runNextAuto;

    async function fetchEvents() {
        try {
            const response = await fetch('/api/events');
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }

    function createEventElement(event) {
        const item = document.createElement('div');
        item.className = 'item';
        item.style.backgroundImage = `url(${event.image_url})`;
        item.dataset.eventId = event.id;

        item.innerHTML = `
            <div class="content">
                <div class="name">${event.name}</div>
                <div class="des">${event.description}</div>
                <div class="btn">
                    <button class="see-more">See More</button>
                    <button class="register">Register</button>
                </div>
            </div>
        `;

        const seeMoreBtn = item.querySelector('.see-more');
        const registerBtn = item.querySelector('.register');

        seeMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            alert(`Event Details for ${event.name}:\n\nDate: ${event.date}\nStatus: ${event.status}\n\n${event.description}`);
        });

        registerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `registration.html?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`;
        });

        return item;
    }

    async function initializeCarousel() {
        const events = await fetchEvents();
        list.innerHTML = '';
        events.forEach(event => {
            const eventElement = createEventElement(event);
            list.appendChild(eventElement);
        });

        if (events.length > 0) {
            showSlider('next');
        }
    }

    function showSlider(type) {
        const items = list.querySelectorAll('.item');
        if (items.length === 0) {
            console.error('No items found in the list');
            return;
        }

        if (type === 'next') {
            if (items[0]) {
                list.appendChild(items[0]);
                carousel.classList.add('next');
            }
        } else {
            if (items[items.length - 1]) {
                list.prepend(items[items.length - 1]);
                carousel.classList.add('prev');
            }
        }

        clearTimeout(runTimeOut);
        runTimeOut = setTimeout(() => {
            carousel.classList.remove('next');
            carousel.classList.remove('prev');
        }, timeRunning);

        clearTimeout(runNextAuto);
        runNextAuto = setTimeout(() => {
            nextBtn.click();
        }, timeAutoNext);

        resetTimeAnimation();
    }

    function resetTimeAnimation() {
        runningTime.style.animation = 'none';
        runningTime.offsetHeight; // Trigger reflow
        runningTime.style.animation = null;
        runningTime.style.animation = 'runningTime 7s linear 1 forwards';
    }

    nextBtn.addEventListener('click', () => showSlider('next'));
    prevBtn.addEventListener('click', () => showSlider('prev'));

    backBtn.addEventListener('click', () => {
        console.log('Back button clicked');
        window.history.back();
    });

    initializeCarousel();
});