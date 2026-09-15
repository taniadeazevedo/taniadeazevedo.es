// Set hero background from img src
const heroSection = document.querySelector('.hero');
const heroImg = document.querySelector('.hero-img');
if (heroSection && heroImg) {
  heroSection.style.backgroundImage = 'url("' + heroImg.src + '")';
}

const nav = document.getElementById('main-nav');
const promoBar = document.getElementById('promo-bar');

function updateNav() {
  const scrollY = window.scrollY;
  const heroH = window.innerHeight;
  const promoH = 40;
  nav.classList.toggle('with-bg', scrollY > heroH - 80);
  nav.classList.toggle('promo-gone', scrollY > promoH);
  if (scrollY > promoH) {
    promoBar.style.height = '0';
    promoBar.style.opacity = '0';
    nav.style.top = '0';
  } else {
    promoBar.style.height = '';
    promoBar.style.opacity = '';
    nav.style.top = '40px';
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Filter pills
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', function() {
    this.closest('.filter-row').querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
  });
});
