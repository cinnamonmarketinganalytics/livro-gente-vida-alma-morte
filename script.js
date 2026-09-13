/**
 * GENTE: vida · alma · morte
 * Scripts de interatividade e experiência literária
 */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. Menu Mobile
  // ========================================================================
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Fechar ao clicar em qualquer link de navegação
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ========================================================================
  // 2. Abas do Leitor de Poemas (Degustação)
  // ========================================================================
  const tabs = document.querySelectorAll('.poem-tab');
  const panels = document.querySelectorAll('.poem-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');

      // Atualiza abas
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Atualiza painéis
      panels.forEach(p => {
        p.classList.remove('active');
        if (p.id === targetId) {
          p.classList.add('active');
        }
      });
    });
  });

  // ========================================================================
  // 3. Efeito Interativo 3D no Livro (Desktop)
  // ========================================================================
  const bookScene = document.getElementById('bookScene');
  const book3D = document.getElementById('book3D');

  if (bookScene && book3D && window.matchMedia('(pointer: fine)').matches) {
    bookScene.addEventListener('mousemove', (e) => {
      const rect = bookScene.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Limite suave de rotação
      const rotateY = -26 + (x / rect.width) * 28;
      const rotateX = 8 - (y / rect.height) * 20;

      book3D.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-8px) scale(1.03)`;
    });

    bookScene.addEventListener('mouseleave', () => {
      book3D.style.transform = 'rotateY(-26deg) rotateX(8deg) rotateZ(-1deg) translateY(0) scale(1)';
    });
  }

  // ========================================================================
  // 4. Compartilhamento no WhatsApp
  // ========================================================================
  const shareWhatsAppBtn = document.getElementById('shareWhatsApp');
  if (shareWhatsAppBtn) {
    const currentUrl = window.location.href.startsWith('http') 
      ? window.location.href 
      : 'https://livromelqui.pages.dev'; // Fallback elegante
    
    const message = `Conheça e baixe gratuitamente o livro de poemas *"GENTE: vida · alma · morte"*, de Andreza Costa, Kaylane Pereira e Melquisedeque Silva (Organização de Luisa Borges Canella).\n\nBaixe aqui: ${currentUrl}`;
    
    shareWhatsAppBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  }

  // ========================================================================
  // 5. Copiar Link do Site com Toast
  // ========================================================================
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const copyLinkText = document.getElementById('copyLinkText');
  const toastMessage = document.getElementById('toastMessage');

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      const urlToCopy = window.location.href.startsWith('http') 
        ? window.location.href 
        : window.location.origin || 'https://livromelqui.pages.dev';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(urlToCopy);
        } else {
          // Fallback para navegadores sem API assíncrona
          const tempInput = document.createElement('input');
          tempInput.value = urlToCopy;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }

        if (copyLinkText) copyLinkText.textContent = 'Link Copiado!';
        if (toastMessage) {
          toastMessage.classList.add('show');
          setTimeout(() => {
            toastMessage.classList.remove('show');
            if (copyLinkText) copyLinkText.textContent = 'Copiar Link do Site';
          }, 3000);
        }
      } catch (err) {
        console.error('Falha ao copiar:', err);
      }
    });
  }

  // ========================================================================
  // 6. Mensagem de Feedback ao Iniciar Download
  // ========================================================================
  const downloadTriggers = document.querySelectorAll('.download-trigger');
  downloadTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      // Feedback sutil ao usuário
      if (toastMessage) {
        toastMessage.textContent = '✨ Download iniciado! Desejamos uma excelente leitura poética.';
        toastMessage.classList.add('show');
        setTimeout(() => {
          toastMessage.classList.remove('show');
          toastMessage.textContent = 'Link copiado com sucesso!';
        }, 4000);
      }
    });
  });

  // ========================================================================
  // 7. ScrollSpy (Destaque do link ativo no menu)
  // ========================================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    const scrollPos = window.pageYOffset + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

});
