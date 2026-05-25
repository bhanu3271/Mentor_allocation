/* =====================================================
   FINAL COMPLETE MENTOR ALLOCATOR
   WITH CSV IMPORT
===================================================== */

'use strict';

/* =====================================================
   STATE
===================================================== */

const STATE = {
  mentors: [],
  students: [],
  lastResults: null
};

const LIMITS = {
  channel: 0.45,
  inside: 0.55,
  annual: 0.25,
  full: 0.25,
  semester: 0.50
};

const STRICT_MODE = true;

let mentorCounter = 0;
let studentCounter = 0;

/* =====================================================
   HELPERS
===================================================== */

function toast(msg, type = 'info', duration = 3000) {

  const container = document.getElementById('toast-container');

  if (!container) return;

  const icons = {
    success: 'fa-check-circle',
    warn: 'fa-exclamation-circle',
    error: 'fa-times-circle',
    info: 'fa-info-circle'
  };

  const el = document.createElement('div');

  el.className = `toast ${type}`;

  el.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${msg}</span>
  `;

  container.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, duration);
}

function getQuota(capacity, ratio) {
  return Math.max(1, Math.round(capacity * ratio));
}

function barClass(used, limit, cap) {

  const ratio = used / cap;

  if (ratio > limit) return 'over';

  if (ratio > limit * 0.8) return 'warn';

  return 'ok';
}

/* =====================================================
   TAB NAVIGATION
===================================================== */

function initTabs() {

  document.querySelectorAll('.tab-btn').forEach(btn => {

    btn.addEventListener('click', () => {

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
      });

      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      btn.classList.add('active');

      const tabId = 'tab-' + btn.dataset.tab;

      const tab = document.getElementById(tabId);

      if (tab) {
        tab.classList.add('active');
      }
    });
  });
}

/* =====================================================
   MENTORS
===================================================== */

const addMentorBtn = document.getElementById('add-mentor-btn');
const mentorsList = document.getElementById('mentors-list');

function initMentors() {

  if (addMentorBtn) {

    addMentorBtn.addEventListener('click', addMentor);
  }
}

function addMentor() {

  const id = 'M' + (++mentorCounter);

  const mentor = {
    id,
    name: '',
    capacity: 10
  };

  STATE.mentors.push(mentor);

  appendMentorCard(mentor);
}

function appendMentorCard(mentor) {

  const template = document
    .getElementById('mentor-card-tpl');

  const clone = template.content.cloneNode(true);

  const card = clone.querySelector('.mentor-card');

  card.dataset.mentorId = mentor.id;

  const nameInput = card.querySelector('.mentor-name-input');
  const capInput = card.querySelector('.mentor-capacity');
  const removeBtn = card.querySelector('.remove-mentor-btn');

  nameInput.value = mentor.name;
  capInput.value = mentor.capacity;

  nameInput.addEventListener('input', () => {
    mentor.name = nameInput.value.trim();
  });

  capInput.addEventListener('input', () => {
    mentor.capacity = Math.max(5, parseInt(capInput.value) || 5);
  });

  removeBtn.addEventListener('click', () => {

    STATE.mentors = STATE.mentors.filter(m => m.id !== mentor.id);

    card.remove();

    toast('Mentor removed', 'info');
  });

  mentorsList.appendChild(card);
}

/* =====================================================
   STUDENTS
===================================================== */

const tbody = document.getElementById('students-tbody');
const addStudentRowBtn = document.getElementById('add-student-row-btn');
const clearStudentsBtn = document.getElementById('clear-students-btn');

function initStudents() {

  if (addStudentRowBtn) {

    addStudentRowBtn.addEventListener('click', () => {
      addStudentRow();
    });
  }

  if (clearStudentsBtn) {

    clearStudentsBtn.addEventListener('click', clearStudents);
  }

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }
}

function addStudentRow(data = {}) {

  const id = 'S' + (++studentCounter);

  const student = {
    id,
    name: data.name || '',
    salesType: data.salesType || 'Channel',
    paymentCategory: data.paymentCategory || 'Annual'
  };

  STATE.students.push(student);

  const tr = document.createElement('tr');

  tr.dataset.studentId = id;

  tr.innerHTML = `
    <td>${studentCounter}</td>

    <td>
      <input type="text"
             class="s-name"
             placeholder="Student Name"
             value="${student.name}" />
    </td>

    <td>
      <select class="s-sales">
        <option value="Channel">Channel</option>
        <option value="Inside">Inside</option>
      </select>
    </td>

    <td>
      <select class="s-payment">
        <option value="Annual">Annual</option>
        <option value="Full">Full</option>
        <option value="Semester">Semester</option>
      </select>
    </td>

    <td>
      <button class="btn-icon remove-row-btn">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;

  tr.querySelector('.s-sales').value = student.salesType;
  tr.querySelector('.s-payment').value = student.paymentCategory;

  tr.querySelector('.s-name').addEventListener('input', e => {
    student.name = e.target.value.trim();
  });

  tr.querySelector('.s-sales').addEventListener('change', e => {
    student.salesType = e.target.value;
  });

  tr.querySelector('.s-payment').addEventListener('change', e => {
    student.paymentCategory = e.target.value;
  });

  tr.querySelector('.remove-row-btn').addEventListener('click', () => {

    STATE.students = STATE.students.filter(s => s.id !== id);

    tr.remove();
  });

  tbody.appendChild(tr);
}

function clearStudents() {

  if (!confirm('Clear all students?')) return;

  STATE.students = [];

  studentCounter = 0;

  tbody.innerHTML = '';

  toast('Students cleared', 'info');
}

/* =====================================================
   CSV IMPORT
===================================================== */

const importCsvBtn = document.getElementById('import-csv-btn');
const csvFileInput = document.getElementById('csv-file-input');

function initCSVImport() {

  if (!importCsvBtn || !csvFileInput) return;

  importCsvBtn.addEventListener('click', () => {
    csvFileInput.click();
  });

  csvFileInput.addEventListener('change', handleCSVImport);
}

function handleCSVImport(event) {

  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    const text = e.target.result;

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    if (lines.length === 0) {
      toast('CSV file is empty', 'warn');
      return;
    }

    let imported = 0;

    lines.forEach((line, index) => {

      if (
        index === 0 &&
        line.toLowerCase().includes('student')
      ) {
        return;
      }

      const cols = line
        .split(',')
        .map(c => c.trim().replace(/^"|"$/g, ''));

      const [
        name,
        salesType,
        paymentCategory
      ] = cols;

      if (!name) return;

      addStudentRow({
        name: name,
        salesType: normalizeSalesType(salesType),
        paymentCategory: normalizePayment(paymentCategory)
      });

      imported++;
    });

    toast(`${imported} students imported`, 'success');

    csvFileInput.value = '';
  };

  reader.readAsText(file);
}

function normalizeSalesType(value) {

  if (!value) return 'Channel';

  value = value.toLowerCase();

  if (value.includes('inside')) {
    return 'Inside';
  }

  return 'Channel';
}

function normalizePayment(value) {

  if (!value) return 'Annual';

  value = value.toLowerCase();

  if (value.includes('semester')) {
    return 'Semester';
  }

  if (value.includes('full')) {
    return 'Full';
  }

  return 'Annual';
}

/* =====================================================
   ALLOCATION ENGINE
===================================================== */

const runAllocationBtn = document.getElementById('run-allocation-btn');

function initAllocation() {

  if (runAllocationBtn) {

    runAllocationBtn.addEventListener('click', runAllocation);
  }
}

function runAllocation() {

  const validMentors = STATE.mentors.filter(m => m.name);

  if (validMentors.length === 0) {
    toast('Please add mentors', 'error');
    return;
  }

  const students = STATE.students.filter(s => s.name);

  if (students.length === 0) {
    toast('Please add students', 'error');
    return;
  }

  const counts = {};

  validMentors.forEach(m => {

    counts[m.id] = {
      channel: 0,
      inside: 0,
      annual: 0,
      full: 0,
      semester: 0,
      total: 0
    };
  });

  const assigned = [];
  const unallocated = [];

  students
    .sort(() => Math.random() - 0.5)
    .forEach(student => {

      const stKey = student.salesType.toLowerCase();
      const pcKey = student.paymentCategory.toLowerCase();

      let bestMentor = null;
      let bestScore = Infinity;

      validMentors.forEach(m => {

        const c = counts[m.id];
        const cap = m.capacity;

        if (c.total >= cap) {
          return;
        }

        const stLimit = getQuota(cap, LIMITS[stKey]);
        const pcLimit = getQuota(cap, LIMITS[pcKey]);

        if (STRICT_MODE) {

          if (c[stKey] >= stLimit) {
            return;
          }

          if (c[pcKey] >= pcLimit) {
            return;
          }
        }

        const salesRatio = c[stKey] / cap;
        const paymentRatio = c[pcKey] / cap;
        const totalRatio = c.total / cap;

        const salesGap = Math.abs(LIMITS[stKey] - salesRatio);
        const paymentGap = Math.abs(LIMITS[pcKey] - paymentRatio);

        const score =
          (salesGap * 40) +
          (paymentGap * 40) +
          (totalRatio * 20);

        if (score < bestScore) {
          bestScore = score;
          bestMentor = m;
        }
      });

      if (bestMentor) {

        counts[bestMentor.id][stKey]++;
        counts[bestMentor.id][pcKey]++;
        counts[bestMentor.id].total++;

        assigned.push({
          studentName: student.name,
          mentorName: bestMentor.name,
          salesType: student.salesType,
          paymentCategory: student.paymentCategory
        });

      } else {

        unallocated.push(student);
      }
    });

  STATE.lastResults = {
    assigned,
    unallocated,
    counts,
    mentors: validMentors
  };

  renderResults();

  switchToResultsTab();

  toast(
    `Allocated ${assigned.length} students`,
    unallocated.length > 0 ? 'warn' : 'success'
  );
}

/* =====================================================
   RESULTS
===================================================== */

function renderResults() {

  const summaryCards = document.getElementById('summary-cards');
  const mentorBlocks = document.getElementById('mentor-result-blocks');
  const unallocatedSection = document.getElementById('unallocated-section');
  const unallocatedList = document.getElementById('unallocated-list');

  const {
    assigned,
    unallocated,
    counts,
    mentors
  } = STATE.lastResults;

  summaryCards.innerHTML = `
    <div class="summary-card">
      <div class="sc-num">${assigned.length}</div>
      <div class="sc-lbl">Allocated</div>
    </div>

    <div class="summary-card">
      <div class="sc-num">${unallocated.length}</div>
      <div class="sc-lbl">Unallocated</div>
    </div>
  `;

  mentorBlocks.innerHTML = '';

  mentors.forEach(m => {

    const stats = counts[m.id];

    const div = document.createElement('div');

    div.className = 'mentor-result-card';

    div.innerHTML = `
      <div class="mrc-header">
        <h3>${m.name}</h3>
        <span>${stats.total} / ${m.capacity}</span>
      </div>

      <div class="mrc-body">

        ${makeBar('Channel', stats.channel, LIMITS.channel, m.capacity)}

        ${makeBar('Inside', stats.inside, LIMITS.inside, m.capacity)}

        ${makeBar('Annual', stats.annual, LIMITS.annual, m.capacity)}

        ${makeBar('Full', stats.full, LIMITS.full, m.capacity)}

        ${makeBar('Semester', stats.semester, LIMITS.semester, m.capacity)}

      </div>
    `;

    mentorBlocks.appendChild(div);
  });

  if (unallocated.length > 0) {

    unallocatedSection.style.display = 'block';

    unallocatedList.innerHTML = unallocated.map(u => `
      <div class="unalloc-chip">
        ${u.name}
      </div>
    `).join('');

  } else {

    unallocatedSection.style.display = 'none';
  }
}

function makeBar(label, used, limitRatio, cap) {

  const limitCount = getQuota(cap, limitRatio);

  const width = Math.min((used / cap) * 100, 100);

  const cls = barClass(used, limitRatio, cap);

  return `
    <div class="bar-group">

      <div class="bar-label">
        <span>${label}</span>
        <span>${used} / ${limitCount}</span>
      </div>

      <div class="bar-track">
        <div class="bar-fill ${cls}"
             style="width:${width}%"></div>
      </div>

    </div>
  `;
}

function switchToResultsTab() {

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
  });

  document.querySelectorAll('.tab-content').forEach(t => {
    t.classList.remove('active');
  });

  document
    .querySelector('[data-tab="results"]')
    .classList.add('active');

  document
    .getElementById('tab-results')
    .classList.add('active');
}

/* =====================================================
   RESET
===================================================== */

const resetBtn = document.getElementById('reset-day-btn');

function initReset() {

  if (resetBtn) {

    resetBtn.addEventListener('click', resetDay);
  }
}

function resetDay() {

  if (!confirm('Reset all data?')) return;

  STATE.students = [];
  STATE.lastResults = null;

  studentCounter = 0;

  tbody.innerHTML = '';

  document.getElementById('summary-cards').innerHTML = '';
  document.getElementById('mentor-result-blocks').innerHTML = '';

  document.getElementById('unallocated-section').style.display = 'none';

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }

  toast('Reset completed', 'success');
}

/* =====================================================
   EXPORT CSV
===================================================== */

const exportBtn = document.getElementById('export-results-btn');

function initExport() {

  if (exportBtn) {

    exportBtn.addEventListener('click', exportCSV);
  }
}

function exportCSV() {

  if (!STATE.lastResults) {
    toast('No results available', 'warn');
    return;
  }

  const rows = [
    ['Student', 'Mentor', 'Sales Type', 'Payment Category']
  ];

  STATE.lastResults.assigned.forEach(a => {

    rows.push([
      a.studentName,
      a.mentorName,
      a.salesType,
      a.paymentCategory
    ]);
  });

  const csv = rows.map(r =>
    r.map(c => `"${c}"`).join(',')
  ).join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv'
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;

  a.download = 'mentor-allocation.csv';

  a.click();

  URL.revokeObjectURL(url);

  toast('CSV Exported', 'success');
}

/* =====================================================
   INITIALIZE APP
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  initTabs();
  initMentors();
  initStudents();
  initCSVImport();
  initAllocation();
  initReset();
  initExport();

  console.log('Mentor Allocator Loaded Successfully');
});
