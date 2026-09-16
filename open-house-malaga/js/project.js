document.addEventListener('DOMContentLoaded', function () {
  // Cursor personalizado
  var cursor = document.querySelector('.custom-cursor');
  if (cursor) {
    document.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    var hoverables = document.querySelectorAll('a, button, .meta-pill, .gallery-item, .carousel-item, .carousel-btn');
    hoverables.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  // Leer más / leer menos
  document.querySelectorAll('.read-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('aria-controls');
      var target = document.getElementById(targetId);
      if (!target) return;
      var collapsed = target.classList.toggle('is-collapsed');
      // classList.toggle returns true if class ends up present (collapsed)
      var isCollapsed = target.classList.contains('is-collapsed');
      btn.setAttribute('aria-expanded', (!isCollapsed).toString());
      btn.textContent = isCollapsed ? '+ Leer más' : '– Leer menos';
    });
  });

  // Vídeo de hero (fade-in al cargar)
  document.querySelectorAll('.hero-video').forEach(function (video) {
    var reveal = function () { video.classList.add('is-loaded'); };
    if (video.readyState >= 2) {
      reveal();
    } else {
      video.addEventListener('loadeddata', reveal);
      video.addEventListener('canplay', reveal);
    }
  });

  // Carrusel (La Nueva Línea)
  var track = document.querySelector('.carousel-track');
  var prev = document.getElementById('carouselPrev');
  var next = document.getElementById('carouselNext');
  if (track && prev && next) {
    var scrollAmount = function () {
      var item = track.querySelector('.carousel-item');
      return item ? item.getBoundingClientRect().width + 16 : 300;
    };
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  }
});
