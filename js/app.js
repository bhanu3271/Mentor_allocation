/* =====================================================
   FINAL COMPLETE MENTOR ALLOCATOR
   WITH:
   ✔ Roll Number Support
   ✔ Existing Mentor Lock Support
   ✔ Multi Program Support
   ✔ Better Program UI
   ✔ Balanced Allocation Engine
   ✔ CSV Import
   ✔ CSV Export
===================================================== */

'use strict';

/* =====================================================
   PROGRAMS
===================================================== */

const PROGRAMS = [
  'BBA',
  'BCA',
  'B.Com',
  'MA.JMC',
  'MBA',
  'MCA',
  'M.Com',
  'MA in Economics',
  'MSc in Mathematics'
];

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

let mentorCounter = 0;
let studentCounter = 0;

/* =====================================================
   HELPERS
===================================================== */

function toast(msg, type = 'info', duration = 3000) {

  const container =
    document.getElementById('toast-container');

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

  document.querySelectorAll('.tab-btn')
    .forEach(btn => {

      btn.addEventListener('click', () => {

        document.querySelectorAll('.tab-btn')
          .forEach(b => {
            b.classList.remove('active');
          });

        document.querySelectorAll('.tab-content')
          .forEach(tab => {
            tab.classList.remove('active');
          });

        btn.classList.add('active');

        const tabId =
          'tab-' + btn.dataset.tab;

        const tab =
          document.getElementById(tabId);

        if (tab) {
          tab.classList.add('active');
        }
      });
    });
}

/* =====================================================
   MENTORS
===================================================== */

const addMentorBtn =
  document.getElementById('add-mentor-btn');

const mentorsList =
  document.getElementById('mentors-list');

function initMentors() {

  if (addMentorBtn) {

    addMentorBtn.addEventListener(
      'click',
      addMentor
    );
  }
}

function addMentor() {

  const id = 'M' + (++mentorCounter);

  const mentor = {
    id,
    name: '',
    capacity: 10,
    programs: []
  };

  STATE.mentors.push(mentor);

  appendMentorCard(mentor);
}

function appendMentorCard(mentor) {

  const template =
    document.getElementById('mentor-card-tpl');

  const clone =
    template.content.cloneNode(true);

  const card =
    clone.querySelector('.mentor-card');

  const nameInput =
    card.querySelector('.mentor-name-input');

  const capInput =
    card.querySelector('.mentor-capacity');

  const removeBtn =
    card.querySelector('.remove-mentor-btn');

  nameInput.value = mentor.name;

  capInput.value = mentor.capacity;

  const checkboxes =
    card.querySelectorAll(
      '.mentor-program-checkbox'
    );

  checkboxes.forEach(checkbox => {

    checkbox.addEventListener(
      'change',
      () => {

        mentor.programs =
          Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        checkbox.parentElement.classList.toggle(
          'checked',
          checkbox.checked
        );
      }
    );
  });

  nameInput.addEventListener(
    'input',
    () => {
      mentor.name =
        nameInput.value.trim();
    }
  );

  capInput.addEventListener(
    'input',
    () => {

      mentor.capacity = Math.max(
        1,
        parseInt(capInput.value) || 1
      );
    }
  );

  removeBtn.addEventListener(
    'click',
    () => {

      STATE.mentors =
        STATE.mentors.filter(
          m => m.id !== mentor.id
        );

      card.remove();

      toast('Mentor removed', 'info');
    }
  );

  mentorsList.appendChild(card);
}

/* =====================================================
   STUDENTS
===================================================== */

const tbody =
  document.getElementById('students-tbody');

const addStudentRowBtn =
  document.getElementById(
    'add-student-row-btn'
  );

const clearStudentsBtn =
  document.getElementById(
    'clear-students-btn'
  );

function initStudents() {

  if (addStudentRowBtn) {

    addStudentRowBtn.addEventListener(
      'click',
      () => {
        addStudentRow();
      }
    );
  }

  if (clearStudentsBtn) {

    clearStudentsBtn.addEventListener(
      'click',
      clearStudents
    );
  }

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }
}

function addStudentRow(data = {}) {

  const id = 'S' + (++studentCounter);

  const student = {
    id,
    rollNumber:
      data.rollNumber || '',
    salesType:
      data.salesType || 'Channel',
    paymentCategory:
      data.paymentCategory || 'Annual',
    program:
      data.program || PROGRAMS[0],
    existingMentor:
      data.existingMentor || ''
  };

  STATE.students.push(student);

  const tr =
    document.createElement('tr');

  tr.dataset.studentId = id;

  tr.innerHTML = `
    <td>${studentCounter}</td>

    <td>
      <input type="text"
             class="s-roll"
             placeholder="Roll Number"
             value="${student.rollNumber}" />
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
      <select class="s-program">

        ${PROGRAMS.map(p => `
          <option value="${p}">
            ${p}
          </option>
        `).join('')}

      </select>
    </td>

    <td>
      <input type="text"
             class="s-existing-mentor"
             placeholder="Existing Mentor"
             value="${student.existingMentor}" />
    </td>

    <td>
      <button class="btn-icon remove-row-btn">
        <i class="fas fa-trash"></i>
      </button>
    </td>
  `;

  tr.querySelector('.s-sales').value =
    student.salesType;

  tr.querySelector('.s-payment').value =
    student.paymentCategory;

  tr.querySelector('.s-program').value =
    student.program;

  tr.querySelector('.s-roll')
    .addEventListener('input', e => {
      student.rollNumber =
        e.target.value.trim();
    });

  tr.querySelector('.s-sales')
    .addEventListener('change', e => {
      student.salesType =
        e.target.value;
    });

  tr.querySelector('.s-payment')
    .addEventListener('change', e => {
      student.paymentCategory =
        e.target.value;
    });

  tr.querySelector('.s-program')
    .addEventListener('change', e => {
      student.program =
        e.target.value;
    });

  tr.querySelector('.s-existing-mentor')
    .addEventListener('input', e => {
      student.existingMentor =
        e.target.value.trim();
    });

  tr.querySelector('.remove-row-btn')
    .addEventListener('click', () => {

      STATE.students =
        STATE.students.filter(
          s => s.id !== id
        );

      tr.remove();
    });

  tbody.appendChild(tr);
}

/* =====================================================
   CLEAR STUDENTS
===================================================== */

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

const importCsvBtn =
  document.getElementById('import-csv-btn');

const csvFileInput =
  document.getElementById('csv-file-input');

function initCSVImport() {

  if (!importCsvBtn || !csvFileInput) return;

  importCsvBtn.addEventListener(
    'click',
    () => {
      csvFileInput.click();
    }
  );

  csvFileInput.addEventListener(
    'change',
    handleCSVImport
  );
}

function handleCSVImport(event) {

  const file =
    event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {

    const text = e.target.result;

    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    let imported = 0;

    lines.forEach((line, index) => {

      if (
        index === 0 &&
        line.toLowerCase().includes('roll')
      ) {
        return;
      }

      const cols = line
        .split(',')
        .map(c =>
          c.trim().replace(/^"|"$/g, '')
        );

      const [
        rollNumber,
        salesType,
        paymentCategory,
        program,
        existingMentor
      ] = cols;

      if (!rollNumber) return;

      addStudentRow({
        rollNumber,
        salesType:
          normalizeSalesType(salesType),
        paymentCategory:
          normalizePayment(paymentCategory),
        program:
          program || PROGRAMS[0],
        existingMentor:
          existingMentor || ''
      });

      imported++;
    });

    toast(
      `${imported} students imported`,
      'success'
    );

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

const runAllocationBtn =
  document.getElementById(
    'run-allocation-btn'
  );

function initAllocation() {

  if (runAllocationBtn) {

    runAllocationBtn.addEventListener(
      'click',
      runAllocation
    );
  }
}

function runAllocation() {

  const validMentors =
    STATE.mentors.filter(m => m.name);

  if (validMentors.length === 0) {

    toast(
      'Please add mentors',
      'error'
    );

    return;
  }

  const students =
    STATE.students.filter(
      s => s.rollNumber
    );

  if (students.length === 0) {

    toast(
      'Please add students',
      'error'
    );

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

  /* =========================================
     EXISTING LOCKED MENTORS
  ========================================= */

  students.forEach(student => {

    if (!student.existingMentor) return;

    const mentor = validMentors.find(
      m =>
        m.name.trim().toLowerCase() ===
        student.existingMentor
          .trim()
          .toLowerCase()
    );

    if (!mentor) {

      unallocated.push({
        ...student,
        reason:
          'Existing mentor not found'
      });

      return;
    }

    const stKey =
      student.salesType.toLowerCase();

    const pcKey =
      student.paymentCategory.toLowerCase();

    counts[mentor.id][stKey]++;

    counts[mentor.id][pcKey]++;

    counts[mentor.id].total++;

    assigned.push({
      rollNumber:
        student.rollNumber,
      mentorName:
        mentor.name,
      salesType:
        student.salesType,
      paymentCategory:
        student.paymentCategory,
      program:
        student.program,
      locked: true
    });
  });

  /* =========================================
     ONLY NEW STUDENTS
  ========================================= */

  const newStudents =
    students.filter(
      s => !s.existingMentor
    );

  newStudents.forEach(student => {

    const stKey =
      student.salesType.toLowerCase();

    const pcKey =
      student.paymentCategory.toLowerCase();

    const eligibleMentors =
      validMentors.filter(m => {

        if (
          m.programs.length > 0 &&
          !m.programs.includes(
            student.program
          )
        ) {
          return false;
        }

        const c = counts[m.id];

        if (c.total >= m.capacity) {
          return false;
        }

        return true;
      });

    if (eligibleMentors.length === 0) {

      unallocated.push({
        ...student,
        reason:
          'No mentor capacity'
      });

      return;
    }

    let bestMentor = null;

    let bestScore = Infinity;

    eligibleMentors.forEach(m => {

      const c = counts[m.id];

      const cap = m.capacity;

      const totalRatio =
        c.total / cap;

      const salesRatio =
        c[stKey] / cap;

      const paymentRatio =
        c[pcKey] / cap;

      const score =
        (totalRatio * 100) +
        (salesRatio * 60) +
        (paymentRatio * 60);

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
        rollNumber:
          student.rollNumber,
        mentorName:
          bestMentor.name,
        salesType:
          student.salesType,
        paymentCategory:
          student.paymentCategory,
        program:
          student.program,
        locked: false
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
    `Allocated ${assigned.length} learners`,
    unallocated.length > 0
      ? 'warn'
      : 'success'
  );
}

/* =====================================================
   RESULTS
===================================================== */

function renderResults() {

  const summaryCards =
    document.getElementById(
      'summary-cards'
    );

  const mentorBlocks =
    document.getElementById(
      'mentor-result-blocks'
    );

  const {
    assigned,
    counts,
    mentors,
    unallocated
  } = STATE.lastResults;

  summaryCards.innerHTML = `
    <div class="summary-card">
      <div class="sc-num">
        ${assigned.length}
      </div>
      <div class="sc-lbl">
        Allocated
      </div>
    </div>

    <div class="summary-card">
      <div class="sc-num">
        ${unallocated.length}
      </div>
      <div class="sc-lbl">
        Unallocated
      </div>
    </div>
  `;

  mentorBlocks.innerHTML = '';

  mentors.forEach(m => {

    const stats = counts[m.id];

    const mentorStudents =
      assigned.filter(
        a =>
          a.mentorName === m.name
      );

    const div =
      document.createElement('div');

    div.className =
      'mentor-result-card';

    div.innerHTML = `
      <div class="mrc-header">

        <h3>${m.name}</h3>

        <span>
          ${stats.total}
          /
          ${m.capacity}
        </span>

      </div>

      <div class="mrc-body">

        <div class="student-mini-list">

          ${mentorStudents.map(s => `

            <div class="student-chip">

              ${s.rollNumber}
              •
              ${s.program}

              ${s.locked
                ? '<span style="color:#16a34a"> (Locked)</span>'
                : ''
              }

            </div>

          `).join('')}

        </div>

      </div>
    `;

    mentorBlocks.appendChild(div);
  });
}

/* =====================================================
   SWITCH TAB
===================================================== */

function switchToResultsTab() {

  document.querySelectorAll('.tab-btn')
    .forEach(b => {
      b.classList.remove('active');
    });

  document.querySelectorAll('.tab-content')
    .forEach(t => {
      t.classList.remove('active');
    });

  document
    .querySelector(
      '[data-tab="results"]'
    )
    .classList.add('active');

  document
    .getElementById('tab-results')
    .classList.add('active');
}

/* =====================================================
   RESET
===================================================== */

const resetBtn =
  document.getElementById(
    'reset-day-btn'
  );

function initReset() {

  if (resetBtn) {

    resetBtn.addEventListener(
      'click',
      resetDay
    );
  }
}

function resetDay() {

  if (!confirm('Reset all data?')) return;

  STATE.students = [];

  STATE.lastResults = null;

  studentCounter = 0;

  tbody.innerHTML = '';

  document.getElementById(
    'summary-cards'
  ).innerHTML = '';

  document.getElementById(
    'mentor-result-blocks'
  ).innerHTML = '';

  toast(
    'Reset completed',
    'success'
  );
}

/* =====================================================
   EXPORT CSV
===================================================== */

const exportBtn =
  document.getElementById(
    'export-results-btn'
  );

function initExport() {

  if (exportBtn) {

    exportBtn.addEventListener(
      'click',
      exportCSV
    );
  }
}

function exportCSV() {

  if (!STATE.lastResults) {

    toast(
      'No results available',
      'warn'
    );

    return;
  }

  const rows = [[
    'Roll Number',
    'Mentor',
    'Sales Type',
    'Payment Category',
    'Program',
    'Locked'
  ]];

  STATE.lastResults.assigned
    .forEach(a => {

      rows.push([
        a.rollNumber,
        a.mentorName,
        a.salesType,
        a.paymentCategory,
        a.program,
        a.locked ? 'Yes' : 'No'
      ]);
    });

  const csv = rows
    .map(r =>
      r.map(c => `"${c}"`).join(',')
    )
    .join('\n');

  const blob = new Blob(
    [csv],
    {
      type: 'text/csv'
    }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement('a');

  a.href = url;

  a.download =
    'mentor-allocation.csv';

  a.click();

  URL.revokeObjectURL(url);

  toast(
    'CSV Exported',
    'success'
  );
}

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    initTabs();
    initMentors();
    initStudents();
    initCSVImport();
    initAllocation();
    initReset();
    initExport();

    console.log(
      'Mentor Allocator Loaded Successfully'
    );
  }
);
