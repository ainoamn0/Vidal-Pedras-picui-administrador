document.addEventListener('DOMContentLoaded', () => {
    const stonesContainer = document.getElementById('stones-catalog');
    const accessoriesContainer = document.getElementById('accessories-catalog');
    const whatsappNumber = "5583999486999";
    
    let currentModalImages = [];
    let currentModalImageIndex = 0;

    // GSAP Initialization
    gsap.registerPlugin(ScrollTrigger);

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.opacity = '0';
        
        let currentImageIndex = 0;
        const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name} (R$ ${product.price}). Pode me dar mais detalhes?`);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

        card.innerHTML = `
            <div class="product-image-container">
                <div class="image-slider">
                    ${product.images.map((img, index) => `
                        <img src="${img}" 
                             alt="${product.name}" 
                             class="slider-img ${index === 0 ? 'active' : ''}"
                             onerror="this.src='https://via.placeholder.com/400x400/f8f9f8/0e3d2f?text=${encodeURIComponent(product.name)}'">
                    `).join('')}
                </div>
                
                <button class="slider-btn prev" title="Anterior">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="slider-btn next" title="Próximo">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>

                <div class="slider-dots">
                    ${product.images.map((_, index) => `
                        <span class="dot ${index === 0 ? 'active' : ''}"></span>
                    `).join('')}
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${product.price}</span>
                    <a href="${whatsappLink}" target="_blank" class="buy-btn">Tenho Interesse</a>
                </div>
            </div>
        `;

        // Slider logic
        const images = card.querySelectorAll('.slider-img');
        const dots = card.querySelectorAll('.dot');
        const prevBtn = card.querySelector('.slider-btn.prev');
        const nextBtn = card.querySelector('.slider-btn.next');

        function updateSlider(newIndex) {
            images[currentImageIndex].classList.remove('active');
            dots[currentImageIndex].classList.remove('active');
            
            currentImageIndex = newIndex;
            if (currentImageIndex < 0) currentImageIndex = images.length - 1;
            if (currentImageIndex >= images.length) currentImageIndex = 0;
            
            images[currentImageIndex].classList.add('active');
            dots[currentImageIndex].classList.add('active');
        }

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateSlider(currentImageIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateSlider(currentImageIndex + 1);
        });

        // Modal functionality
        images.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                const modal = document.getElementById('product-modal');
                const modalImg = document.getElementById('modal-image');
                const modalCategory = document.getElementById('modal-category');
                const modalTitle = document.getElementById('modal-title');
                const modalDesc = document.getElementById('modal-description');
                const modalPrice = document.getElementById('modal-price');
                const modalWhatsapp = document.getElementById('modal-whatsapp');

                if(modal) {
                    currentModalImages = product.images;
                    currentModalImageIndex = index;
                    modalImg.src = currentModalImages[currentModalImageIndex];

                    modalCategory.textContent = product.category;
                    modalTitle.textContent = product.name;
                    modalDesc.textContent = product.description;
                    modalPrice.textContent = `R$ ${product.price}`;
                    modalWhatsapp.href = whatsappLink;

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                }
            });
        });

        return card;
    }

    function renderSection(type, container) {
        if (!container) return;
        container.innerHTML = '';
        
        const filteredProducts = products.filter(p => p.type === type);

        if (filteredProducts.length === 0) {
            container.innerHTML = '<div class="loading">Nenhum produto encontrado.</div>';
            return;
        }

        filteredProducts.forEach((product) => {
            const card = createProductCard(product);
            container.appendChild(card);
        });

        // Animation for cards in this container
        gsap.to(container.children, {
            scrollTrigger: {
                trigger: container,
                start: "top 85%",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        });
    }

    // Hero Animations
    gsap.from(".hero-mini", { opacity: 0, y: 20, duration: 1, delay: 0.2 });
    gsap.from(".hero h1", { opacity: 0, y: 30, duration: 1, delay: 0.4 });
    gsap.from(".hero p", { opacity: 0, y: 30, duration: 1, delay: 0.6 });
    gsap.from(".hero-btns", { opacity: 0, y: 30, duration: 1, delay: 0.8 });

    // Section Animations
    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section.querySelector('.section-header'), {
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
            },
            opacity: 0,
            y: 50,
            duration: 1
        });
    });

    // Initial render
    renderSection('pedra', stonesContainer);
    renderSection('acessorio', accessoriesContainer);

    // Mobile Menu Toggle Logic
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const allNavLinks = document.querySelectorAll('.nav-links a');

    function toggleMenu() {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Mouse Parallax
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        gsap.to('.bg-decor', {
            x: x * 50,
            y: y * 50,
            duration: 1,
            ease: "power2.out",
            stagger: 0.05
        });
    });

    // Modal Close Logic
    const modal = document.getElementById('product-modal');
    if (modal) {
        const closeModal = document.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Modal Slider Logic
        const modalPrevBtn = document.getElementById('modal-prev');
        const modalNextBtn = document.getElementById('modal-next');
        const modalImg = document.getElementById('modal-image');

        if (modalPrevBtn && modalNextBtn && modalImg) {
            modalPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentModalImages.length > 0) {
                    currentModalImageIndex = (currentModalImageIndex - 1 + currentModalImages.length) % currentModalImages.length;
                    modalImg.src = currentModalImages[currentModalImageIndex];
                }
            });

            modalNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentModalImages.length > 0) {
                    currentModalImageIndex = (currentModalImageIndex + 1) % currentModalImages.length;
                    modalImg.src = currentModalImages[currentModalImageIndex];
                }
            });
        }
    }
});
