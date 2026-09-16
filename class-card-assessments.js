(() => {
  'use strict';

  function addAssessmentButtons() {
    document.querySelectorAll('#classCards .class-card').forEach((card) => {
      const actions = card.querySelector('.class-actions');
      if (!actions || actions.querySelector('[data-card-assessments]')) return;
      const course = card.dataset.course || '';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mini-button';
      button.dataset.cardAssessments = '1';
      button.textContent = 'Tests & Quizzes';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const nav = document.querySelector('[data-view="assessments"]');
        nav?.click();
        window.setTimeout(() => {
          const tab = [...document.querySelectorAll('[data-assessment-course]')]
            .find((item) => item.dataset.assessmentCourse === course);
          tab?.click();
        }, 0);
      });
      actions.appendChild(button);
    });
  }

  const cards = document.getElementById('classCards');
  if (cards) {
    new MutationObserver(addAssessmentButtons).observe(cards, { childList: true, subtree: true });
    addAssessmentButtons();
  }
})();
