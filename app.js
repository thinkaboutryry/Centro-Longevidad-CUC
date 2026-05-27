/*
========================================================================
   LÓGICA PRINCIPAL Y ROUTER SPA DE 11 VISTAS - CENTRO DE LONGEVIDAD
   Universidad de la Costa (CUC)
   Adaptación Cromática, Sitemap Acortado y Control de Hover
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. INICIALIZAR EL ROUTER SPA NATIVO
    initSPARouter();
    
    // 2. INICIALIZAR COMPONENTES GLOBALES
    initHeaderScroll();
    initMobileMenu();
    initAccessibilityState();
    initFormHandlers();
    initAboutSlider();
    initProyectosToggle();
});

/*
========================================================================
   1. ENRUTADOR SPA NATIVO DE 11 RUTA (SUBPÁGINAS INDEPENDIENTES)
========================================================================
*/
function initSPARouter() {
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('nav a');
    
    // Mapa de rutas actualizado con el sitemap final
    const routeMap = {
        '': 'home',
        '#': 'home',
        '#home': 'home',
        '#sobre-el-centro': 'home',
        '#alianzas': 'home',
        '#noticias': 'home',
        '#conoce-el-centro': 'home',
        '#lineas-investigacion': 'lineas-investigacion',
        '#proyectos': 'proyectos',
        '#observatorio': 'observatorio',
        '#investigaciones': 'investigaciones',
        '#equipo': 'equipo',
        '#vinculacion': 'vinculacion',
        '#contacto': 'contacto'
    };

    const handleRouting = () => {
        const hash = window.location.hash;
        const targetViewId = routeMap[hash] || 'home';
        
        // 1. Ocultar todas las subpáginas
        views.forEach(view => {
            view.classList.remove('active');
        });
        
        // 2. Mostrar la subpágina actual
        const activeView = document.getElementById(`view-${targetViewId}`);
        if (activeView) {
            activeView.classList.add('active');
        }
        
        // 3. Resaltar pestaña activa del menú
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === hash || (hash === '' && linkHref === '#home')) {
                link.classList.add('active');
            }
        });
        
        // Resaltar también el botón principal derecho
        const vinculacionBtn = document.querySelector('.nav-btn-vinculacion');
        if (vinculacionBtn) {
            vinculacionBtn.classList.toggle('active', hash === '#vinculacion');
        }
        
        // 4. Resetear la posición del scroll (comportamiento de página real)
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        });
        
        // 5. Desencadenar la inicialización específica de cada subpágina
        triggerSubpageLogic(targetViewId);
    };
    
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); // Ejecutar carga inicial
}

/*
========================================================================
   DESENCADENAR CONTROLES DING SEGÚN LA SUBPÁGINA ACTIVA
========================================================================
*/
function triggerSubpageLogic(viewId) {
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
        // Ejecutar las animaciones de scroll difuminadas para el contenido cargado
        const revealElements = activeView.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
        
        revealElements.forEach(el => {
            el.classList.remove('active'); // Reset previo
            scrollObserver.observe(el);
        });
    }

    // Lógica particular de carga diferida
    if (viewId === 'home') {
        setTimeout(initStatsCounter, 100);
    }
    if (viewId === 'observatorio') {
        setTimeout(initObservatorioDashboard, 100);
    }
    if (viewId === 'investigaciones') {
        setTimeout(initPublicationsFilter, 100);
    }
}

/*
========================================================================
   2. CONTROL DEL SCROLL EN EL HEADER
========================================================================
*/
function initHeaderScroll() {
    const header = document.querySelector('header');
    const handleScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

/*
========================================================================
   3. MENÚ RESPONSIVO HAMBURGUESA COLLAPSIBLE A 1250PX
========================================================================
*/
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav a');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('open');
            const isOpen = nav.classList.contains('open');
            menuToggle.innerHTML = isOpen 
                ? '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>'
                : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
        
        // Cerrar menú responsivo al hacer clic
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                menuToggle.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

/*
========================================================================
   4. ESTADÍSTICAS ANIMADAS EN EL HOME
========================================================================
*/
function initStatsCounter() {
    const counters = document.querySelectorAll('.counter-number');
    const section = document.querySelector('.impact-section');
    if (counters.length === 0 || !section) return;
    
    let animated = false;
    
    const startCounting = () => {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            let current = 0;
            const duration = 1500; // 1.5s de animación suave y fluida
            const startTime = performance.now();
            
            const updateCount = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing cúbico-out para desacelerar premium al final
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const val = Math.floor(easeProgress * target);
                
                counter.innerText = '+' + val;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = '+' + target;
                }
            };
            requestAnimationFrame(updateCount);
        });
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                startCounting();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    observer.observe(section);
}

/*
========================================================================
   5. PANEL FLOTANTE DE ACCESIBILIDAD UNIVERSAL ♿
========================================================================
*/
function initAccessibilityState() {
    const toggleBtn = document.querySelector('.btn-accessibility-toggle');
    const accessMenu = document.querySelector('.accessibility-menu');
    
    if (toggleBtn && accessMenu) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accessMenu.classList.toggle('open');
            const isOpen = accessMenu.classList.contains('open');
            toggleBtn.setAttribute('aria-expanded', isOpen);
        });
        
        document.addEventListener('click', (e) => {
            if (!accessMenu.contains(e.target) && e.target !== toggleBtn) {
                accessMenu.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Controles de Tamaño de Texto
    const fontSizes = ['16px', '18px', '20px'];
    const fontBtns = document.querySelectorAll('.btn-fontsize');
    let currentSizeIndex = localStorage.getItem('accessibility-font-size-index') 
        ? parseInt(localStorage.getItem('accessibility-font-size-index')) 
        : 0;
        
    const setFontSize = (index) => {
        document.documentElement.style.setProperty('--base-font-size', fontSizes[index]);
        fontBtns.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        localStorage.setItem('accessibility-font-size-index', index);
    };
    
    fontBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            currentSizeIndex = index;
            setFontSize(currentSizeIndex);
        });
    });
    setFontSize(currentSizeIndex);
    
    // Toggle de Alto Contraste
    const contrastSwitch = document.getElementById('contrast-switch');
    const isHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    const setHighContrast = (active) => {
        document.body.classList.toggle('high-contrast', active);
        if (contrastSwitch) contrastSwitch.checked = active;
        localStorage.setItem('accessibility-high-contrast', active);
    };
    if (contrastSwitch) {
        contrastSwitch.addEventListener('change', (e) => {
            setHighContrast(e.target.checked);
        });
    }
    setHighContrast(isHighContrast);
    
    // Toggle de Fuente para Dislexia
    const dyslexiaSwitch = document.getElementById('dyslexia-switch');
    const isDyslexic = localStorage.getItem('accessibility-dyslexia') === 'true';
    const setDyslexic = (active) => {
        document.body.classList.toggle('dyslexic-font', active);
        if (dyslexiaSwitch) dyslexiaSwitch.checked = active;
        localStorage.setItem('accessibility-dyslexia', active);
    };
    if (dyslexiaSwitch) {
        dyslexiaSwitch.addEventListener('change', (e) => {
            setDyslexic(e.target.checked);
        });
    }
    setDyslexic(isDyslexic);
    
    // Toggle de Reducción de Animaciones
    const motionSwitch = document.getElementById('motion-switch');
    const isReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';
    const setReducedMotion = (active) => {
        document.body.classList.toggle('reduce-motion', active);
        if (motionSwitch) motionSwitch.checked = active;
        localStorage.setItem('accessibility-reduced-motion', active);
    };
    if (motionSwitch) {
        motionSwitch.addEventListener('change', (e) => {
            setReducedMotion(e.target.checked);
        });
    }
    setReducedMotion(isReducedMotion);
    
    // Lector de Voz
    const voiceSwitch = document.getElementById('voice-switch');
    let isVoiceActive = false;
    let synth = window.speechSynthesis;
    let currentUtterance = null;
    
    const stopVoice = () => {
        if (synth && synth.speaking) {
            synth.cancel();
        }
    };
    
    const readText = (text) => {
        stopVoice();
        if (!text) return;
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = 'es-ES';
        synth.speak(currentUtterance);
    };
    
    if (voiceSwitch) {
        voiceSwitch.addEventListener('change', (e) => {
            isVoiceActive = e.target.checked;
            if (!isVoiceActive) {
                stopVoice();
            } else {
                readText("Lector de voz activado. Seleccione texto para escucharlo.");
            }
        });
    }
    
    document.body.addEventListener('click', (e) => {
        if (!isVoiceActive) return;
        if (accessMenu.contains(e.target) || toggleBtn.contains(e.target)) return;
        
        const textElement = e.target.closest('p, h1, h2, h3, h4, li, blockquote');
        if (textElement) {
            readText(textElement.innerText);
            textElement.style.outline = '2px solid var(--color-sky-blue)';
            setTimeout(() => {
                textElement.style.outline = 'none';
            }, 800);
        }
    });
}

/*
========================================================================
   6. INTERACTIVIDAD DEL OBSERVATORIO DE LONGEVIDAD
========================================================================
*/
const mockDataObservatorio = {
    region: {
        labels: ["Región Caribe", "Región Andina", "Región Pacífica", "Región Orinoquía", "Región Amazonía"],
        values: [142, 115, 68, 14, 6],
        percentages: [41, 33, 20, 4, 2]
    },
    envejecimiento: {
        labels: ["Año 2000", "Año 2010", "Año 2020", "Año 2026 (Proy)"],
        values: [48, 62, 89, 105],
        percentages: [12, 18, 30, 40]
    },
    factores: {
        labels: ["Estilo de vida activo", "Genómica y epigenética", "Entorno social/familiar", "Nutrición balanceada"],
        values: [40, 35, 15, 10],
        percentages: [40, 35, 15, 10]
    }
};

function initObservatorioDashboard() {
    const tabBtns = document.querySelectorAll('#view-observatorio .btn-tab');
    const chartBars = document.getElementById('obs-bars');
    const pieSvg = document.getElementById('obs-pie-svg');
    const pieLegend = document.getElementById('obs-pie-legend');
    
    if (tabBtns.length === 0 || !chartBars) return;
    
    const updateDashboard = (categoryKey) => {
        const data = mockDataObservatorio[categoryKey];
        if (!data) return;
        
        // 1. Renderizar barras planas
        chartBars.innerHTML = '';
        data.labels.forEach((label, index) => {
            const val = data.values[index];
            const pct = data.percentages[index];
            
            const barRow = document.createElement('div');
            barRow.className = 'bar-row';
            barRow.innerHTML = `
                <div class="bar-label">${label}</div>
                <div class="bar-track">
                    <div class="bar-fill" style="width: 0%"></div>
                </div>
                <div class="bar-value">${val} ${categoryKey === 'factores' ? '%' : ''}</div>
            `;
            
            chartBars.appendChild(barRow);
            
            setTimeout(() => {
                const fill = barRow.querySelector('.bar-fill');
                if (fill) fill.style.width = `${pct}%`;
            }, 25 * index);
        });
        
        // 2. Renderizar circular plano
        if (pieSvg && pieLegend) {
            pieSvg.innerHTML = '';
            pieLegend.innerHTML = '';
            
            const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            bgCircle.setAttribute("cx", "80");
            bgCircle.setAttribute("cy", "80");
            bgCircle.setAttribute("r", "50");
            bgCircle.setAttribute("class", "pie-bg");
            pieSvg.appendChild(bgCircle);
            
            let accumulatedPercentage = 0;
            const segmentColors = ['pie-segment-1', 'pie-segment-2', 'pie-segment-3', 'pie-segment-4', 'pie-segment-5'];
            
            data.labels.forEach((label, index) => {
                const pct = data.percentages[index];
                if (pct <= 0) return;
                
                const segmentCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                segmentCircle.setAttribute("cx", "80");
                segmentCircle.setAttribute("cy", "80");
                segmentCircle.setAttribute("r", "50");
                
                const colorClass = segmentColors[index % segmentColors.length];
                segmentCircle.setAttribute("class", `pie-segment ${colorClass}`);
                
                const perimeter = 2 * Math.PI * 50;
                const dashArrayVal = (pct / 100) * perimeter;
                const dashOffsetVal = -((accumulatedPercentage / 100) * perimeter);
                
                segmentCircle.setAttribute("stroke-dasharray", `0 ${perimeter}`);
                segmentCircle.setAttribute("stroke-dashoffset", dashOffsetVal.toString());
                
                pieSvg.appendChild(segmentCircle);
                
                setTimeout(() => {
                    segmentCircle.setAttribute("stroke-dasharray", `${dashArrayVal} ${perimeter - dashArrayVal}`);
                }, 50);
                
                accumulatedPercentage += pct;
                
                const colorIndex = (index % segmentColors.length) + 1;
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <div class="legend-color legend-color-${colorIndex}"></div>
                    <div>${label}: <strong>${pct}%</strong></div>
                `;
                pieLegend.appendChild(legendItem);
            });
        }
    };
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-target');
            updateDashboard(category);
        });
    });
    
    updateDashboard('region');
}

/*
========================================================================
   7. FILTRO Y BÚSQUEDA DEL CATÁLOGO DE PUBLICACIONES
========================================================================
*/
const dbPublicaciones = [
    {
        title: "Factores genéticos y epigenéticos en centenarios del Caribe colombiano",
        category: "artículos",
        excerpt: "Estudio molecular integral sobre la prevalencia de alelos protectores frente a enfermedades cardiovasculares y metabólicas en personas centenarias.",
        authors: "Dr. Antonio Martínez, Dra. Mariana Castro",
        date: "Mayo 2026",
        link: "#"
    },
    {
        title: "Informe sobre envejecimiento saludable e indicadores en América Latina",
        category: "informes",
        excerpt: "Análisis estadístico comparado sobre esperanza de vida funcional, determinantes sociales y hábitos de salud en poblaciones mayores de 80 años.",
        authors: "Dr. Carlos Gómez et al.",
        date: "Marzo 2026",
        link: "#"
    },
    {
        title: "Guía de políticas públicas para la promoción de la autonomía en la vejez",
        category: "políticas",
        excerpt: "Propuestas de reformas y programas comunitarios basadas en evidencia científica para fomentar entornos urbanos inclusivos y amigables.",
        authors: "Dra. Sofía Restrepo",
        date: "Enero 2026",
        link: "#"
    },
    {
        title: "Construcción de biorepositorios: estándares clínicos y éticos",
        category: "resultados",
        excerpt: "Metodologías de criopreservación y catalogación de muestras de plasma para la identificación a gran escala de biomarcadores biológicos.",
        authors: "Dra. Laura Ortega, Dr. J. Silva",
        date: "Noviembre 2025",
        link: "#"
    },
    {
        title: "Inteligencia artificial y predicción de fragilidad en adultos mayores",
        category: "artículos",
        excerpt: "Desarrollo de modelos predictivos basados en redes neuronales para anticipar la pérdida de masa muscular y caídas en geriatría preventiva.",
        authors: "Ing. Roberto Díaz, Dr. Antonio Martínez",
        date: "Octubre 2025",
        link: "#"
    },
    {
        title: "Evaluación del Observatorio de Longevidad de la Costa",
        category: "informes",
        excerpt: "Primer censo y análisis demográfico profundo sobre supercentenarios en Colombia, mapeando el impacto del microclima y estilo de vida costero.",
        authors: "Observatorio de Longevidad",
        date: "Julio 2025",
        link: "#"
    }
];

function initPublicationsFilter() {
    const searchInput = document.getElementById('pub-search');
    const filterBtns = document.querySelectorAll('.btn-filter');
    const publicationsGrid = document.getElementById('pub-grid');
    
    if (!publicationsGrid) return;
    
    let activeFilter = 'todos';
    let searchQuery = '';
    
    const renderPublications = () => {
        publicationsGrid.innerHTML = '';
        
        const filtered = dbPublicaciones.filter(pub => {
            const matchesFilter = activeFilter === 'todos' || pub.category.includes(activeFilter);
            const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 pub.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 pub.authors.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
        
        if (filtered.length === 0) {
            publicationsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: var(--color-text-muted);">
                    <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom: 0.5rem; opacity: 0.5;">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p>No se encontraron publicaciones correspondientes.</p>
                </div>
            `;
            return;
        }
        
        filtered.forEach((pub, index) => {
            const card = document.createElement('div');
            card.className = 'publication-card';
            card.style.opacity = '0';
            card.style.transform = 'none';
            card.style.transition = `opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.05}s`;
            
            const categoryCapitalized = pub.category.charAt(0).toUpperCase() + pub.category.slice(1);
            
            card.innerHTML = `
                <div>
                    <div class="pub-meta">
                        <span>${categoryCapitalized}</span>
                        <span>•</span>
                        <span>${pub.date}</span>
                    </div>
                    <h4 class="pub-title">${pub.title}</h4>
                    <p class="pub-excerpt">${pub.excerpt}</p>
                </div>
                <div class="pub-footer">
                    <span class="pub-authors">${pub.authors}</span>
                    <a href="${pub.link}" class="pub-link">
                        Ver PDF
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                    </a>
                </div>
            `;
            publicationsGrid.appendChild(card);
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'none';
            }, 30);
        });
    };
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            renderPublications();
        });
    });
    
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                renderPublications();
            }, 150);
        });
    }
    
    renderPublications();
}

/*
========================================================================
   8. ENVIÓ DE FORMULARIOS CON FEEDBACK VISUAL
========================================================================
*/
function initFormHandlers() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const feedbackEl = form.querySelector('.form-feedback');
            
            if (!submitBtn || !feedbackEl) return;
            
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 38 38" stroke="currentColor" style="animation: spin 1s linear infinite; margin-right: 0.5rem;">
                    <g fill="none" fill-rule="evenodd">
                        <g transform="translate(1 1)" stroke-width="3">
                            <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
                            <path d="M36 18c0-9.94-8.06-18-18-18"></path>
                        </g>
                    </g>
                </svg>
                Procesando...
            `;
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                feedbackEl.classList.remove('success', 'error');
                feedbackEl.classList.add('success');
                
                if (form.id === 'participa-form') {
                    feedbackEl.innerHTML = `
                        <strong>Registro completado con éxito.</strong><br>
                        Agradecemos tu interés en colaborar con nosotros. Responderemos a tu correo a la brevedad.
                    `;
                } else {
                    feedbackEl.innerHTML = `
                        <strong>Mensaje enviado correctamente.</strong><br>
                        Tu consulta ha sido recibida en el Centro de Investigación. Te responderemos en las próximas horas.
                    `;
                }
                
                form.reset();
                
                setTimeout(() => {
                    feedbackEl.style.display = 'none';
                    setTimeout(() => {
                        feedbackEl.style.display = '';
                        feedbackEl.classList.remove('success');
                    }, 300);
                }, 6000);
                
            }, 1200);
        });
    });
}

/*
========================================================================
   9. CARRUSEL "CONOCE EL CENTRO" (HOME)
========================================================================
*/
function initAboutSlider() {
    const slides = document.querySelectorAll('.about-slide');
    const prevBtn = document.getElementById('about-prev');
    const nextBtn = document.getElementById('about-next');
    let currentSlide = 0;
    
    if (slides.length === 0) return;

    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    };
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
        
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
    }

    // Soporte para gestos táctiles (Swipe) en dispositivos móviles
    const sliderContainer = document.querySelector('.about-slider-container');
    if (sliderContainer) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        const handleSwipe = () => {
            const swipeThreshold = 50; // Umbral de píxeles para reconocer el gesto
            if (touchStartX - touchEndX > swipeThreshold) {
                // Deslizar a la izquierda -> Siguiente tarjeta
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            } else if (touchEndX - touchStartX > swipeThreshold) {
                // Deslizar a la derecha -> Tarjeta anterior
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
            }
        };
    }
}

/*
========================================================================
   10. COLAPSABLE PUESTA EN MARCHA DEL PROYECTO
========================================================================
*/
function initProyectosToggle() {
    const btn = document.querySelector('.btn-profundizar');
    const panel = document.getElementById('proyectos-panel');
    
    if (btn && panel) {
        btn.addEventListener('click', () => {
            panel.classList.toggle('open');
            const isOpen = panel.classList.contains('open');
            btn.innerText = isOpen ? 'Ocultar detalles metodológicos' : 'Profundizar en la metodología';
            btn.setAttribute('aria-expanded', isOpen);
        });
    }
}
