document.addEventListener('DOMContentLoaded', function() {
  // Inicializa el carrusel para "Libros más valorados" usando la clase .swiper-valorados
  var swiperValorados = new Swiper('.swiper-valorados', {
    loop: true,
    slidesPerView: 4,
    spaceBetween: 20,
    speed: 1000,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      0: { slidesPerView: 1, centeredSlides: true },
      576: { slidesPerView: 2, centeredSlides: false },
      992: { slidesPerView: 4, centeredSlides: false }
    }
  });

  // Inicializa el carrusel para "Libros recién agregados" usando la clase .swiper-new
  var swiperNuevos = new Swiper('.swiper-new', {
    loop: true,
    slidesPerView: 4,
    spaceBetween: 20,
    speed: 1000,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    breakpoints: {
      0: { slidesPerView: 1, centeredSlides: true },
      576: { slidesPerView: 2, centeredSlides: false },
      992: { slidesPerView: 4, centeredSlides: false }
    }
  });

  // Inicializa el carrusel para "Libros más leídos" usando la clase .swiper-leidos
  var swiperLeidos = new Swiper('.swiper-leidos', {
    loop: true,
    slidesPerView: 4,
    spaceBetween: 20,
    speed: 1000,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    breakpoints: {
      0: { slidesPerView: 1, centeredSlides: true },
      576: { slidesPerView: 2, centeredSlides: false },
      992: { slidesPerView: 4, centeredSlides: false }
    }
  });

  // Asigna los eventos de mouse al contenedor completo de cada carrusel para detener/reanudar el autoplay

  // Para "Libros más valorados"
  var contenedorValorados = document.querySelector('.swiper-valorados');
  if (contenedorValorados) {
    contenedorValorados.addEventListener('mouseenter', function() {
      if (swiperValorados.autoplay && swiperValorados.autoplay.stop) {
        swiperValorados.autoplay.stop();
        console.log("Detenido autoplay en valorados");
      }
    });
    contenedorValorados.addEventListener('mouseleave', function() {
      if (swiperValorados.autoplay && swiperValorados.autoplay.start) {
        swiperValorados.autoplay.start();
        console.log("Reanudado autoplay en valorados");
      }
    });
  }

  // Para "Libros recién agregados"
  var contenedorNuevos = document.querySelector('.swiper-new');
  if (contenedorNuevos) {
    contenedorNuevos.addEventListener('mouseenter', function() {
      if (swiperNuevos.autoplay && swiperNuevos.autoplay.stop) {
        swiperNuevos.autoplay.stop();
        console.log("Detenido autoplay en nuevos");
      }
    });
    contenedorNuevos.addEventListener('mouseleave', function() {
      if (swiperNuevos.autoplay && swiperNuevos.autoplay.start) {
        swiperNuevos.autoplay.start();
        console.log("Reanudado autoplay en nuevos");
      }
    });
  }

  // Para "Libros más leídos"
  var contenedorLeidos = document.querySelector('.swiper-leidos');
  if (contenedorLeidos) {
    contenedorLeidos.addEventListener('mouseenter', function() {
      if (swiperLeidos.autoplay && swiperLeidos.autoplay.stop) {
        swiperLeidos.autoplay.stop();
        console.log("Detenido autoplay en leídos");
      }
    });
    contenedorLeidos.addEventListener('mouseleave', function() {
      if (swiperLeidos.autoplay && swiperLeidos.autoplay.start) {
        swiperLeidos.autoplay.start();
        console.log("Reanudado autoplay en leídos");
      }
    });
  }
});
