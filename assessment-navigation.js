(() => {
  'use strict';

  function openAssessments(event) {
    const trigger = event.target.closest?.('[data-view="assessments"]');
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    document.querySelectorAll('.view').forEach((view) => view.classList.add('hidden'));
    document.getElementById('assessmentsView')?.classList.remove('hidden');
    document.querySelectorAll('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === 'assessments'));

    const eyebrow = document.getElementById('viewEyebrow');
    const title = document.getElementById('viewTitle');
    const subtitle = document.getElementById('viewSubtitle');
    if (eyebrow) eyebrow.textContent = 'TESTS · QUIZZES · RESULTS';
    if (title) title.textContent = 'Tests & Quizzes';
    if (subtitle) subtitle.textContent = 'Schedule assessments and record student results in one place.';
  }

  // Capture before app.js handles the click. The core app predates the assessments view
  // and otherwise treats this new view as Home.
  document.addEventListener('click', openAssessments, true);
})();
