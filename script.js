/**
 * GENTE: vida · alma · morte
 * Scripts de interatividade, captura de leads e Firebase Firestore
 */

// ========================================================================
// Firebase Firestore Integration (v12.19.0)
// ========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuAztb-a6VxQ6jKUOIhw_wJeq-cY8JZWI",
  authDomain: "livro-gente.firebaseapp.com",
  projectId: "livro-gente",
  storageBucket: "livro-gente.firebasestorage.app",
  messagingSenderId: "1073940475555",
  appId: "1:1073940475555:web:fc29396bcdff3d2fd59916"
};

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.warn('Aviso ao inicializar Firebase:', err);
}

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
      : 'https://livro-gente-vida-alma-morte.cinnamon-marketing-analytics.workers.dev';
    
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
        : 'https://livro-gente-vida-alma-morte.cinnamon-marketing-analytics.workers.dev';

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
  // 6. Modal de Download & Captura de Lead com Firebase
  // ========================================================================
  const downloadModal = document.getElementById('downloadModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const downloadForm = document.getElementById('downloadForm');
  const userNameInput = document.getElementById('userName');
  const userEmailInput = document.getElementById('userEmail');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const btnSubmitDownload = document.getElementById('btnSubmitDownload');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const downloadTriggers = document.querySelectorAll('.download-trigger');

  const PDF_URL = 'Gente-%20vida,%20alma,%20morte%20poemas_v.2.pdf';
  const PDF_FILENAME = 'Gente - vida, alma, morte - Poemas.pdf';
  let activeDownloadMode = 'download'; // 'download' ou 'view'

  // Abrir Modal
  function openDownloadModal(mode = 'download') {
    activeDownloadMode = mode;

    // Preencher com dados salvos anteriormente, se houver
    try {
      const savedName = localStorage.getItem('gente_lead_name');
      const savedEmail = localStorage.getItem('gente_lead_email');
      if (savedName && userNameInput && !userNameInput.value) {
        userNameInput.value = savedName;
      }
      if (savedEmail && userEmailInput && !userEmailInput.value) {
        userEmailInput.value = savedEmail;
      }
    } catch (e) {}

    if (downloadModal) {
      downloadModal.classList.add('active');
      downloadModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Foco inteligente
      setTimeout(() => {
        if (userNameInput && !userNameInput.value) {
          userNameInput.focus();
        } else if (userEmailInput) {
          userEmailInput.focus();
        }
      }, 150);
    }
  }

  // Fechar Modal
  function closeDownloadModal() {
    if (downloadModal) {
      downloadModal.classList.remove('active');
      downloadModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      clearErrors();
    }
  }

  function clearErrors() {
    if (nameError) nameError.classList.remove('show');
    if (emailError) emailError.classList.remove('show');
    if (userNameInput) userNameInput.classList.remove('has-error');
    if (userEmailInput) userEmailInput.classList.remove('has-error');
  }

  // Acionar download do arquivo PDF
  function triggerActualDownload() {
    if (activeDownloadMode === 'view') {
      window.open(PDF_URL, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = PDF_URL;
      link.download = PDF_FILENAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Event Listeners nos botões de download
  downloadTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = btn.getAttribute('data-mode') || 'download';
      openDownloadModal(mode);
    });
  });

  // Fechar no botão X
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeDownloadModal);
  }

  // Fechar ao clicar no backdrop escuro
  if (downloadModal) {
    downloadModal.addEventListener('click', (e) => {
      if (e.target === downloadModal) {
        closeDownloadModal();
      }
    });
  }

  // Fechar na tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && downloadModal && downloadModal.classList.contains('active')) {
      closeDownloadModal();
    }
  });

  // Limpar erro ao digitar
  if (userNameInput) {
    userNameInput.addEventListener('input', () => {
      userNameInput.classList.remove('has-error');
      if (nameError) nameError.classList.remove('show');
    });
  }
  if (userEmailInput) {
    userEmailInput.addEventListener('input', () => {
      userEmailInput.classList.remove('has-error');
      if (emailError) emailError.classList.remove('show');
    });
  }

  // Submissão do Formulário
  if (downloadForm) {
    downloadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const nomeVal = userNameInput ? userNameInput.value.trim() : '';
      const emailVal = userEmailInput ? userEmailInput.value.trim().toLowerCase() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      let hasError = false;

      if (!nomeVal || nomeVal.length < 3) {
        if (userNameInput) userNameInput.classList.add('has-error');
        if (nameError) nameError.classList.add('show');
        hasError = true;
      }

      if (!emailVal || !emailRegex.test(emailVal)) {
        if (userEmailInput) userEmailInput.classList.add('has-error');
        if (emailError) emailError.classList.add('show');
        hasError = true;
      }

      if (hasError) return;

      // Estado de Carregamento
      if (btnSubmitDownload) btnSubmitDownload.disabled = true;
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (btnText) btnText.textContent = 'Liberando seu exemplar...';

      // 1. Salvar no Firebase Firestore
      const now = new Date();
      const dataHoraLocal = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      try {
        if (db) {
          await addDoc(collection(db, 'downloads'), {
            nome: nomeVal,
            email: emailVal,
            modo: activeDownloadMode,
            dataHoraStr: dataHoraLocal,
            createdAt: serverTimestamp(),
            timestampMs: Date.now(),
            navegador: navigator.userAgent
          });
        }
      } catch (fbErr) {
        console.error('Registro no Firestore (aviso):', fbErr);
      }

      // 2. Salvar dados no LocalStorage para conveniência futura
      try {
        localStorage.setItem('gente_lead_name', nomeVal);
        localStorage.setItem('gente_lead_email', emailVal);
      } catch (lsErr) {}

      // 3. Disparar o download do PDF
      triggerActualDownload();

      // 4. Fechar modal e exibir mensagem de boas-vindas
      setTimeout(() => {
        closeDownloadModal();

        // Resetar botão
        if (btnSubmitDownload) btnSubmitDownload.disabled = false;
        if (btnSpinner) btnSpinner.classList.add('hidden');
        if (btnText) btnText.textContent = 'Liberar e Baixar Livro';

        // Toast de Sucesso
        if (toastMessage) {
          toastMessage.textContent = '✨ Download liberado! Desejamos uma excelente leitura poética.';
          toastMessage.classList.add('show');
          setTimeout(() => {
            toastMessage.classList.remove('show');
            toastMessage.textContent = 'Link copiado com sucesso!';
          }, 4500);
        }
      }, 600);
    });
  }

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

  // ========================================================================
  // 8. Botão Voltar ao Topo
  // ========================================================================
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});

