<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BQinzagencIA</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Syne:wght@400;700&display=swap');
        body { margin: 0; font-family: 'Inter', sans-serif; background-color: #111318; color: white; }
        nav { position: fixed; width: 100%; background: rgba(0, 0, 0, 0.8); padding: 15px; display: flex; justify-content: space-between; align-items: center; }
        nav a { color: white; text-decoration: none; margin: 0 15px; }
        nav .cta { background-color: #FF6B00; padding: 10px 20px; border-radius: 5px; color: white; }
        .hero { height: 100vh; background-image: url('https://source.unsplash.com/1600x900/?business,whatsapp'); background-size: cover; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .hero h1 { font-size: 3rem; margin: 0; }
        .hero p { font-size: 1.5rem; margin: 10px 0; }
        .hero .btn { background-color: #FF6B00; padding: 15px 30px; border: none; border-radius: 5px; color: white; margin: 5px; cursor: pointer; }
        .stats { display: flex; justify-content: space-around; padding: 50px 0; }
        .stat { text-align: center; }
        .services { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; padding: 50px; }
        .service-card { background: #1E2125; padding: 20px; border-radius: 10px; text-align: center; }
        .about { display: flex; padding: 50px; }
        .about img { width: 50%; border-radius: 10px; }
        .about-text { padding: 0 20px; }
        .testimonials { display: flex; justify-content: space-around; padding: 50px; }
        .testimonial-card { background: #1E2125; padding: 20px; border-radius: 10px; text-align: center; }
        .contact { padding: 50px; }
        .contact form { display: flex; flex-direction: column; }
        .contact input, .contact textarea { margin: 10px 0; padding: 10px; border-radius: 5px; border: 1px solid #ccc; }
        footer { background: rgba(0, 0, 0, 0.8); padding: 20px; text-align: center; }
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .hero p { font-size: 1rem; }
        }
    </style>
</head>
<body>

<nav>
    <div class="logo">BQinzagencIA</div>
    <div>
        <a href="#services">Servicios</a>
        <a href="#about">Nosotros</a>
        <a href="#contact">Contacto</a>
        <button class="cta">Reservar cita</button>
    </div>
</nav>

<section class="hero">
    <h1>Impulsa tu negocio con WhatsApp</h1>
    <p>Desarrollamos soluciones personalizadas para empresas en España</p>
    <button class="btn">Descubre nuestros servicios</button>
    <button class="btn">Contáctanos</button>
</section>

<section class="stats">
    <div class="stat">10+ años de experiencia</div>
    <div class="stat">500+ clientes satisfechos</div>
    <div class="stat">100+ proyectos exitosos</div>
</section>

<section class="services" id="services">
    <div class="service-card">
        <svg width="50" height="50"><circle cx="25" cy="25" r="20" fill="#FF6B00"/></svg>
        <h3>Desarrollo Personalizado</h3>
        <p>Creamos soluciones a medida para tus necesidades específicas.</p>
    </div>
    <div class="service-card">
        <svg width="50" height="50"><rect width="50" height="50" fill="#FF6B00"/></svg>
        <h3>Integración de API</h3>
        <p>Integramos WhatsApp a tus sistemas existentes para una experiencia fluida.</p>
    </div>
    <div class="service-card">
        <svg width="50" height="50"><ellipse cx="25" cy="25" rx="25" ry="15" fill="#FF6B00"/></svg>
        <h3>Soporte y Mantenimiento</h3>
        <p>Brindamos soporte continuo y mantenimiento para tus soluciones.</p>
    </div>
</section>

<section class="about" id="about">
    <img src="https://source.unsplash.com/500x300/?team" alt="Nuestro equipo">
    <div class="about-text">
        <h2>Sobre nosotros</h2>
        <p>En BQinzagencIA, somos un equipo de expertos dedicados a ayudar a empresas a crecer utilizando WhatsApp. Nuestro enfoque es personalizado y orientado a resultados.</p>
    </div>
</section>

<section class="testimonials">
    <div class="testimonial-card">
        <p>"BQinzagencIA transformó nuestra comunicación con los clientes. ¡Altamente recomendados!"</p>
        <strong>Juan Pérez</strong>
        <div>⭐⭐⭐⭐⭐</div>
    </div>
    <div class="testimonial-card">
        <p>"Excelente servicio y atención al cliente. Nos ayudaron a mejorar nuestras ventas."</p>
        <strong>María López</strong>
        <div>⭐⭐⭐⭐⭐</div>
    </div>
    <div class="testimonial-card">
        <p>"Gran equipo de profesionales. Nos guiaron en todo el proceso."</p>
        <strong>Andrés Martínez</strong>
        <div>⭐⭐⭐⭐⭐</div>
    </div>
</section>

<section class="contact" id="contact">
    <h2>Contacto</h2>
    <form id="contactForm" onsubmit="handleSubmit(event)">
        <input type="text" name="name" placeholder="Tu nombre" required>
        <input type="email" name="email" placeholder="Tu email" required>
        <input type="tel" name="phone" placeholder="Tu teléfono" required>
        <textarea name="message" placeholder="Tu mensaje" required></textarea>
        <button type="submit">Enviar</button>
    </form>
    <div>
        <p>Teléfono: +34680172420</p>
        <p>Email: obqinz@gmail.com</p>
    </div>
    <div style="height: 300px; background-color: #ccc; margin-top: 20px;">Mapa aquí</div>
</section>

<footer>
    <div class="logo">BQinzagencIA</div>
    <div>
        <a href="#services">Servicios</a>
        <a href="#about">Nosotros</a>
        <a href="#contact">Contacto</a>
    </div>
    <p>&copy; 2023 BQinzagencIA. Todos los derechos reservados.</p>
</footer>

<script>
    function handleSubmit(event) {
        event.preventDefault();
        alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
        document.getElementById('contactForm').reset();
    }
</script>

</body>
</html>