/* =====================================================
   FINAL COMPLETE MENTOR ALLOCATOR
   FULLY UPDATED
   ✔ All Buttons Working
   ✔ CSV Import Working
   ✔ Existing Mentor Lock
   ✔ Balanced Allocation
   ✔ Better Equal Distribution
   ✔ Program Wise Allocation
   ✔ Export CSV
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

let mentorCounter = 0;
let studentCounter = 0;

/* =====================================================
   HELPERS
===================================================== */

function toast(msg, type = 'info') {

  const container =
    document.getElementById('toast-container');

  if (!container) return;

  const div =
    document.createElement('div');

  div.className = `toast ${type}`;

  div.innerHTML = `
    <span>${msg}</span>
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

  btn.addEventListener(
    'click',
    addMentor
  );
}

function addMentor() {

  const mentor = {
    id: 'M' + (++mentorCounter),
    name: '',
    capacity: 100,
    programs: []
  };

  STATE.mentors.push(mentor);

  renderMentor(mentor);
}

function renderMentor(mentor) {

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

  nameInput.addEventListener(
    'input',
    e => {
      mentor.name = e.target.value.trim();
    }
  );

  capInput.addEventListener(
    'input',
    e => {

      mentor.capacity =
        parseInt(e.target.value) || 1;
    }
  );

  const checkboxes =
    card.querySelectorAll(
      '.mentor-program-checkbox'
    );

  checkboxes.forEach(cb => {

    cb.addEventListener(
      'change',
      () => {

        mentor.programs =
          Array.from(checkboxes)
            .filter(x => x.checked)
            .map(x => x.value);

        cb.parentElement.classList.toggle(
          'checked',
          cb.checked
        );
      }
    );
  });

  removeBtn.addEventListener(
    'click',
    () => {

      STATE.mentors =
        STATE.mentors.filter(
          m => m.id !== mentor.id
        );

      card.remove();

      toast(
        'Mentor removed',
        'warn'
      );
    }
  );

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

  if (addBtn) {

    addBtn.addEventListener(
      'click',
      () => addStudentRow()
    );
  }

  if (clearBtn) {

    clearBtn.addEventListener(
      'click',
      clearStudents
    );
  }

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }
}

function addStudentRow(data = {}) {

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
      <input class="s-roll"
        value="${student.rollNumber}" />
    </td>

    <td>
      <select class="s-sales">
        <option>Channel</option>
        <option>Inside</option>
      </select>
    </td>

    <td>
      <select class="s-payment">
        <option>Annual</option>
        <option>Full</option>
        <option>Semester</option>
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
      <input
        class="s-existing"
        value="${student.existingMentor}"
      />
    </td>

    <td>
      <button class="remove-row-btn">
        X
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

  tr.querySelector('.s-existing')
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

  document
    .getElementById('students-tbody')
    .appendChild(tr);
}

function clearStudents() {

  if (!confirm('Clear students?')) return;

  STATE.students = [];

  studentCounter = 0;

  document.getElementById(
    'students-tbody'
  ).innerHTML = '';

  toast(
    'Students cleared',
    'success'
  );
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

  if (!btn || !input) return;

  btn.addEventListener(
    'click',
    () => input.click()
  );

  input.addEventListener(
    'change',
    handleCSVImport
  );
}

function handleCSVImport(e) {

  const file =
    e.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = ev => {

    const text =
      ev.target.result;

    const lines =
      text.split('\n');

    let imported = 0;

    lines.forEach((line, index) => {

      if (
        index === 0 &&
        line.toLowerCase().includes('roll')
      ) {
        return;
      }

      const cols =
        line.split(',')
          .map(c =>
            c.trim()
              .replace(/^"|"$/g, '')
          );

      if (cols.length < 4) return;

      addStudentRow({

        rollNumber:
          cols[0],

        salesType:
          cols[1] || 'Channel',

        paymentCategory:
          cols[2] || 'Annual',

        program:
          cols[3] || PROGRAMS[0],

        existingMentor:
          cols[4] || ''
      });

      imported++;
    });

    toast(
      `${imported} students imported`,
      'success'
    );

    e.target.value = '';
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

  if (!btn) return;

  btn.addEventListener(
    'click',
    runAllocation
  );
}

function runAllocation() {

  const validMentors =
    STATE.mentors.filter(
      m => m.name.trim()
    );

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
     LOCKED STUDENTS
  ========================================= */

  students.forEach(student => {

    if (!student.existingMentor) return;

    const mentor =
      validMentors.find(
        m =>
          m.name.toLowerCase() ===
          student.existingMentor
            .toLowerCase()
      );

    if (!mentor) return;

    const st =
      student.salesType.toLowerCase();

    const pay =
      student.paymentCategory.toLowerCase();

    counts[mentor.id][st]++;
    counts[mentor.id][pay]++;
    counts[mentor.id].total++;

    assigned.push({
      ...student,
      mentorName: mentor.name,
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

    const st =
      student.salesType.toLowerCase();

    const pay =
      student.paymentCategory.toLowerCase();

    const eligible =
      validMentors.filter(m => {

        if (
          m.programs.length &&
          !m.programs.includes(
            student.program
          )
        ) {
          return false;
        }

        return (
          counts[m.id].total <
          m.capacity
        );
      });

    if (!eligible.length) {

      unallocated.push(student);

      return;
    }

    let best = null;

    let bestScore = Infinity;

    eligible.forEach(m => {

      const c =
        counts[m.id];

      const score =
        (c.total * 1000) +
        (c[st] * 500) +
        (c[pay] * 500);

      if (score < bestScore) {

        bestScore = score;
        best = m;
      }
    });

    counts[best.id][st]++;
    counts[best.id][pay]++;
    counts[best.id].total++;

    assigned.push({
      ...student,
      mentorName: best.name,
      locked: false
    });
  });

  STATE.lastResults = {
    assigned,
    unallocated,
    counts,
    mentors: validMentors
  };

  renderResults();

  switchToResults();

  toast(
    `Allocated ${assigned.length} learners`,
    'success'
  );
}

/* =====================================================
   RESULTS
===================================================== */

function renderResults() {

  const results =
    STATE.lastResults;

  if (!results) return;

  const summary =
    document.getElementById(
      'summary-cards'
    );

  const blocks =
    document.getElementById(
      'mentor-result-blocks'
    );

  summary.innerHTML = `

    <div class="summary-card">
      <div class="sc-num">
        ${results.assigned.length}
      </div>
      <div class="sc-lbl">
        Allocated
      </div>
    </div>

    <div class="summary-card">
      <div class="sc-num">
        ${results.unallocated.length}
      </div>
      <div class="sc-lbl">
        Unallocated
      </div>
    </div>
  `;

  blocks.innerHTML = '';

  results.mentors.forEach(m => {

    const c =
      results.counts[m.id];

    const students =
      results.assigned.filter(
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
          ${c.total} / ${m.capacity}
        </span>

      </div>

      <div class="mrc-body">

        <p>
          Channel:
          ${c.channel}
          |
          Inside:
          ${c.inside}
        </p>

        <p>
          Annual:
          ${c.annual}
          |
          Full:
          ${c.full}
          |
          Semester:
          ${c.semester}
        </p>

        <div class="student-mini-list">

          ${students.map(s => `

            <div class="student-chip">

              ${s.rollNumber}
              •
              ${s.program}

              ${s.locked
                ? '(Locked)'
                : ''
              }

            </div>

          `).join('')}

        </div>

      </div>
    `;

    blocks.appendChild(div);
  });
}

/* =====================================================
   SWITCH RESULTS TAB
===================================================== */

function switchToResults() {

  document.querySelectorAll('.tab-btn')
    .forEach(b =>
      b.classList.remove('active')
    );

  document.querySelectorAll('.tab-content')
    .forEach(t =>
      t.classList.remove('active')
    );

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

function initReset() {

  const btn =
    document.getElementById(
      'reset-day-btn'
    );

  if (!btn) return;

  btn.addEventListener(
    'click',
    resetDay
  );
}

function resetDay() {

  if (!confirm('Reset all?')) return;

  STATE.students = [];
  STATE.lastResults = null;

  document.getElementById(
    'students-tbody'
  ).innerHTML = '';

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

function initExport() {

  const btn =
    document.getElementById(
      'export-results-btn'
    );

  if (!btn) return;

  btn.addEventListener(
    'click',
    exportCSV
  );
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

  const csv =
    rows.map(r =>
      r.map(x => `"${x}"`)
        .join(',')
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

  toast(
    'CSV Exported',
    'success'
  );
}

/* =====================================================
   INITIALIZE APP
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
      'Mentor Allocator Loaded'
    );
  }
);
