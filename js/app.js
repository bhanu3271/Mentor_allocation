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

let mentorCounter = 0;
let studentCounter = 0;

/* =====================================================
   TOAST
===================================================== */

function toast(msg, type = 'info') {

  const container =
    document.getElementById('toast-container');

  if (!container) return;

  const div = document.createElement('div');

  div.className = `toast ${type}`;

  div.innerHTML = `
    <div class="toast-msg">
      ${msg}
    </div>
  `;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

/* =====================================================
   TABS
===================================================== */

function initTabs() {

  const buttons =
    document.querySelectorAll('.tab-btn');

  const tabs =
    document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {

    btn.addEventListener('click', () => {

      buttons.forEach(b =>
        b.classList.remove('active')
      );

      tabs.forEach(t =>
        t.classList.remove('active')
      );

      btn.classList.add('active');

      const tab =
        document.getElementById(
          'tab-' + btn.dataset.tab
        );

      if (tab) {
        tab.classList.add('active');
      }
    });
  });
}

/* =====================================================
   MENTORS
===================================================== */

function initMentors() {

  const btn =
    document.getElementById('add-mentor-btn');

  if (!btn) return;

  btn.addEventListener('click', addMentor);
}

function addMentor() {

  const mentor = {
    id: 'M' + (++mentorCounter),
    name: '',
    capacity: 100,
    programs: []
  };

  STATE.mentors.push(mentor);

  renderMentorCard(mentor);
}

function renderMentorCard(mentor) {

  const template =
    document.getElementById('mentor-card-tpl');

  const clone =
    template.content.cloneNode(true);

  const card =
    clone.querySelector('.mentor-card');

  const nameInput =
    card.querySelector('.mentor-name-input');

  const capacityInput =
    card.querySelector('.mentor-capacity');

  const removeBtn =
    card.querySelector('.remove-mentor-btn');

  const checkboxes =
    card.querySelectorAll(
      '.mentor-program-checkbox'
    );

  nameInput.addEventListener('input', e => {
    mentor.name = e.target.value.trim();
  });

  capacityInput.addEventListener(
    'input',
    e => {

      mentor.capacity =
        parseInt(e.target.value) || 1;
    }
  );

  checkboxes.forEach(cb => {

    cb.addEventListener('change', () => {

      mentor.programs =
        Array.from(checkboxes)
          .filter(x => x.checked)
          .map(x => x.value);
    });
  });

  removeBtn.addEventListener('click', () => {

    STATE.mentors =
      STATE.mentors.filter(
        m => m.id !== mentor.id
      );

    card.remove();

    toast('Mentor removed');
  });

  document
    .getElementById('mentors-list')
    .appendChild(card);
}

/* =====================================================
   STUDENTS
===================================================== */

function initStudents() {

  const addBtn =
    document.getElementById(
      'add-student-row-btn'
    );

  const clearBtn =
    document.getElementById(
      'clear-students-btn'
    );

  addBtn.addEventListener(
    'click',
    () => addStudentRow()
  );

  clearBtn.addEventListener(
    'click',
    clearStudents
  );
}

function addStudentRow(data = {}) {

  const tbody =
    document.getElementById(
      'students-tbody'
    );

  const student = {
    id: 'S' + (++studentCounter),
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

  tr.innerHTML = `
    <td>${studentCounter}</td>

    <td>
      <input type="text"
             class="s-roll"
             value="${student.rollNumber}">
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
             value="${student.existingMentor}">
    </td>

    <td>
      <button class="remove-row-btn">
        Delete
      </button>
    </td>
  `;

  tbody.appendChild(tr);

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
          s => s.id !== student.id
        );

      tr.remove();
    });
}

function clearStudents() {

  if (!confirm('Clear all students?')) {
    return;
  }

  STATE.students = [];

  studentCounter = 0;

  document.getElementById(
    'students-tbody'
  ).innerHTML = '';

  toast('Students cleared');
}

/* =====================================================
   CSV IMPORT
===================================================== */

function initCSVImport() {

  const btn =
    document.getElementById(
      'import-csv-btn'
    );

  const input =
    document.getElementById(
      'csv-file-input'
    );

  btn.addEventListener('click', () => {
    input.click();
  });

  input.addEventListener(
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

    const lines =
      text.split('\n');

    let imported = 0;

    lines.forEach((line, index) => {

      if (index === 0) return;

      if (!line.trim()) return;

      const cols =
        line.split(',');

      addStudentRow({
        rollNumber:
          cols[0]?.trim(),
        salesType:
          cols[1]?.trim() || 'Channel',
        paymentCategory:
          cols[2]?.trim() || 'Annual',
        program:
          cols[3]?.trim() || PROGRAMS[0],
        existingMentor:
          cols[4]?.trim() || ''
      });

      imported++;
    });

    toast(
      imported + ' learners imported',
      'success'
    );
  };

  reader.readAsText(file);
}

/* =====================================================
   ALLOCATION ENGINE
===================================================== */

function initAllocation() {

  const btn =
    document.getElementById(
      'run-allocation-btn'
    );

  btn.addEventListener(
    'click',
    runAllocation
  );
}

function runAllocation() {

  const mentors =
    STATE.mentors.filter(
      m => m.name
    );

  if (mentors.length === 0) {

    toast('Please add mentors');

    return;
  }

  const students =
    STATE.students.filter(
      s => s.rollNumber
    );

  if (students.length === 0) {

    toast('Please add students');

    return;
  }

  const assigned = [];
  const unallocated = [];

  const mentorStats = {};

  mentors.forEach(m => {

    mentorStats[m.name] = {
      total: 0,
      channel: 0,
      inside: 0,
      annual: 0,
      full: 0,
      semester: 0
    };
  });

  /* =========================================
     LOCKED STUDENTS
  ========================================= */

  students.forEach(student => {

    if (!student.existingMentor) {
      return;
    }

    const mentor =
      mentors.find(
        m =>
          m.name.trim().toLowerCase() ===
          student.existingMentor
            .trim()
            .toLowerCase()
      );

    if (!mentor) {
      return;
    }

    const stat =
      mentorStats[mentor.name];

    stat.total++;

    stat[
      student.salesType.toLowerCase()
    ]++;

    stat[
      student.paymentCategory.toLowerCase()
    ]++;

    assigned.push({
      ...student,
      mentor: mentor.name,
      locked: true
    });
  });

  /* =========================================
     NEW STUDENTS
  ========================================= */

  const newStudents =
    students.filter(
      s => !s.existingMentor
    );

  newStudents.forEach(student => {

    const eligible =
      mentors.filter(m => {

        if (
          m.programs.length > 0 &&
          !m.programs.includes(
            student.program
          )
        ) {
          return false;
        }

        return (
          mentorStats[m.name].total <
          m.capacity
        );
      });

    if (eligible.length === 0) {

      unallocated.push(student);

      return;
    }

    eligible.sort((a, b) => {

      const aStats =
        mentorStats[a.name];

      const bStats =
        mentorStats[b.name];

      const type =
        student.salesType.toLowerCase();

      const payment =
        student.paymentCategory.toLowerCase();

      const aScore =
        aStats.total +
        aStats[type] * 2 +
        aStats[payment] * 3;

      const bScore =
        bStats.total +
        bStats[type] * 2 +
        bStats[payment] * 3;

      return aScore - bScore;
    });

    const mentor =
      eligible[0];

    mentorStats[mentor.name].total++;

    mentorStats[mentor.name][
      student.salesType.toLowerCase()
    ]++;

    mentorStats[mentor.name][
      student.paymentCategory.toLowerCase()
    ]++;

    assigned.push({
      ...student,
      mentor: mentor.name,
      locked: false
    });
  });

  STATE.lastResults = {
    assigned,
    unallocated,
    mentorStats
  };

  renderResults();

  document
    .querySelector(
      '[data-tab="results"]'
    )
    .click();

  toast(
    'Allocation completed',
    'success'
  );
}

/* =====================================================
   RESULTS
===================================================== */

function renderResults() {

  const summary =
    document.getElementById(
      'summary-cards'
    );

  const blocks =
    document.getElementById(
      'mentor-result-blocks'
    );

  const unallocatedSection =
    document.getElementById(
      'unallocated-section'
    );

  const unallocatedList =
    document.getElementById(
      'unallocated-list'
    );

  summary.innerHTML = '';
  blocks.innerHTML = '';
  unallocatedList.innerHTML = '';

  const {
    assigned,
    unallocated
  } = STATE.lastResults;

  summary.innerHTML = `
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

  const mentorMap = {};

  assigned.forEach(a => {

    if (!mentorMap[a.mentor]) {
      mentorMap[a.mentor] = [];
    }

    mentorMap[a.mentor].push(a);
  });

  Object.keys(mentorMap)
    .forEach(name => {

      const students =
        mentorMap[name];

      const div =
        document.createElement('div');

      div.className =
        'mentor-result-card';

      div.innerHTML = `
        <div class="mrc-header">
          <h3>${name}</h3>
          <span>
            ${students.length}
          </span>
        </div>

        <div class="mrc-body">

          ${students.map(s => `
            <div class="student-chip">

              ${s.rollNumber}
              •
              ${s.program}
              •
              ${s.salesType}
              •
              ${s.paymentCategory}

              ${
                s.locked
                  ? '<span style="color:green">(Locked)</span>'
                  : ''
              }

            </div>
          `).join('')}

        </div>
      `;

      blocks.appendChild(div);
    });

  if (unallocated.length > 0) {

    unallocatedSection.style.display =
      'block';

    unallocated.forEach(s => {

      const div =
        document.createElement('div');

      div.className =
        'student-chip';

      div.innerHTML = `
        ${s.rollNumber}
        •
        ${s.program}
      `;

      unallocatedList.appendChild(div);
    });

  } else {

    unallocatedSection.style.display =
      'none';
  }
}

/* =====================================================
   EXPORT CSV
===================================================== */

function initExport() {

  const btn =
    document.getElementById(
      'export-results-btn'
    );

  btn.addEventListener(
    'click',
    exportCSV
  );
}

function exportCSV() {

  if (!STATE.lastResults) {

    toast('No results found');

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
        a.mentor,
        a.salesType,
        a.paymentCategory,
        a.program,
        a.locked ? 'Yes' : 'No'
      ]);
    });

  const csv =
    rows.map(r =>
      r.map(x => `"${x}"`).join(',')
    ).join('\n');

  const blob =
    new Blob([csv], {
      type: 'text/csv'
    });

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement('a');

  a.href = url;

  a.download =
    'mentor-allocation.csv';

  a.click();

  URL.revokeObjectURL(url);

  toast('CSV exported');
}

/* =====================================================
   RESET
===================================================== */

function initReset() {

  const btn =
    document.getElementById(
      'reset-day-btn'
    );

  btn.addEventListener(
    'click',
    () => {

      if (
        confirm('Reset complete app?')
      ) {

        location.reload();
      }
    }
  );
}

/* =====================================================
   INIT
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    initTabs();
    initMentors();
    initStudents();
    initCSVImport();
    initAllocation();
    initExport();
    initReset();

    console.log(
      'Mentor Allocator Ready'
    );
  }
);
