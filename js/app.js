/* =====================================================
   UPDATED MENTOR ALLOCATOR — PRODUCTION VERSION
   ===================================================== */

'use strict';

const STATE = {
  programs: [],
  mentors: [],
  students: [],
  lastResults: null,
};

const LIMITS = {
  channel: 0.45,
  inside: 0.55,
  annual: 0.25,
  full: 0.25,
  semester: 0.50,
};

const STRICT_MODE = true;
const PROGRAMS_MAX = 9;

let mentorCounter = 0;
let studentCounter = 0;

/* =====================================================
   HELPERS
===================================================== */

function uid() {
  return '_' + Math.random().toString(36).slice(2, 9);
}

function toast(msg, type = 'info', duration = 3000) {
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

  document.getElementById('toast-container').appendChild(el);

  setTimeout(() => {
    el.remove();
  }, duration);
}

function getQuota(capacity, ratio) {
  return Math.max(1, Math.round(capacity * ratio));
}

function pct(val, cap) {
  if (!cap) return 0;
  return Math.round((val / cap) * 100);
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

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
    });

    document.querySelectorAll('.tab-content').forEach(t => {
      t.classList.remove('active');
    });

    btn.classList.add('active');

    document
      .getElementById('tab-' + btn.dataset.tab)
      .classList.add('active');
  });
});

/* =====================================================
   PROGRAMS
===================================================== */

const programInput = document.getElementById('program-input');
const addProgramBtn = document.getElementById('add-program-btn');
const programsList = document.getElementById('programs-list');
const programsCount = document.getElementById('programs-count');

function renderPrograms() {

  programsList.innerHTML = '';

  STATE.programs.forEach((p, i) => {

    const li = document.createElement('li');

    li.innerHTML = `
      <span>${p}</span>
      <button title="Remove" data-idx="${i}">
        <i class="fas fa-times"></i>
      </button>
    `;

    li.querySelector('button').addEventListener('click', () => {
      STATE.programs.splice(i, 1);
      syncProgramsToMentors();
      renderPrograms();
    });

    programsList.appendChild(li);
  });

  programsCount.textContent = `${STATE.programs.length} / ${PROGRAMS_MAX}`;

  syncProgramsToMentors();
}

function addProgram() {

  const val = programInput.value.trim();

  if (!val) {
    toast('Please enter program name', 'warn');
    return;
  }

  if (STATE.programs.length >= PROGRAMS_MAX) {
    toast(`Maximum ${PROGRAMS_MAX} programs allowed`, 'warn');
    return;
  }

  if (
    STATE.programs
      .map(p => p.toLowerCase())
      .includes(val.toLowerCase())
  ) {
    toast('Program already exists', 'warn');
    return;
  }

  STATE.programs.push(val);

  programInput.value = '';

  renderPrograms();

  toast(`Program ${val} added`, 'success');
}

addProgramBtn.addEventListener('click', addProgram);

programInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addProgram();
});

function syncProgramsToMentors() {

  STATE.mentors.forEach(m => {

    const card = document.querySelector(
      `.mentor-card[data-mentor-id="${m.id}"]`
    );

    if (!card) return;

    renderMentorPrograms(card, m);
  });

  refreshStudentProgramDropdowns();
}

/* =====================================================
   MENTORS
===================================================== */

const addMentorBtn = document.getElementById('add-mentor-btn');
const mentorsList = document.getElementById('mentors-list');

addMentorBtn.addEventListener('click', addMentor);

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

  const tpl = document
    .getElementById('mentor-card-tpl')
    .content
    .cloneNode(true);

  const card = tpl.querySelector('.mentor-card');

  card.dataset.mentorId = mentor.id;

  const nameInput = card.querySelector('.mentor-name-input');

  nameInput.value = mentor.name;

  nameInput.addEventListener('input', () => {
    mentor.name = nameInput.value.trim();
  });

  const capInput = card.querySelector('.mentor-capacity');

  capInput.value = mentor.capacity;

  capInput.addEventListener('input', () => {
    mentor.capacity = Math.max(5, parseInt(capInput.value) || 5);
  });

  card
    .querySelector('.remove-mentor-btn')
    .addEventListener('click', () => {

      STATE.mentors = STATE.mentors.filter(m => m.id !== mentor.id);

      card.remove();

      toast('Mentor removed', 'info');
    });

  mentorsList.appendChild(card);

  renderMentorPrograms(card, mentor);
}

function renderMentorPrograms(card, mentor) {

  const box = card.querySelector('.program-checkboxes');

  box.innerHTML = '';

  if (STATE.programs.length === 0) {

    box.innerHTML = `
      <span style="font-size:.78rem;color:var(--text-3)">
        No programs defined
      </span>
    `;

    return;
  }

  STATE.programs.forEach(prog => {

    const checked = mentor.programs.includes(prog);

    const lbl = document.createElement('label');

    lbl.className = checked ? 'checked' : '';

    lbl.innerHTML = `
      <input type="checkbox" ${checked ? 'checked' : ''} />
      ${prog}
    `;

    const cb = lbl.querySelector('input');

    cb.addEventListener('change', () => {

      if (cb.checked) {

        if (!mentor.programs.includes(prog)) {
          mentor.programs.push(prog);
        }

        lbl.classList.add('checked');

      } else {

        mentor.programs = mentor.programs.filter(p => p !== prog);

        lbl.classList.remove('checked');
      }
    });

    box.appendChild(lbl);
  });
}

/* =====================================================
   STUDENTS
===================================================== */

const tbody = document.getElementById('students-tbody');
const addStudentRowBtn = document.getElementById('add-student-row-btn');
const clearStudentsBtn = document.getElementById('clear-students-btn');

addStudentRowBtn.addEventListener('click', () => {
  addStudentRow();
});

clearStudentsBtn.addEventListener('click', () => {

  if (!confirm('Clear all students?')) return;

  STATE.students = [];
  studentCounter = 0;

  tbody.innerHTML = '';

  toast('All students cleared', 'info');
});

window.addEventListener('DOMContentLoaded', () => {
  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }
});

function addStudentRow(data = {}) {

  const id = 'S' + (++studentCounter);

  const student = {
    id,
    name: data.name || '',
    salesType: data.salesType || 'Channel',
    paymentCategory: data.paymentCategory || 'Annual',
    program: data.program || ''
  };

  const alreadyExists = STATE.students.some(
    s => s.name.trim().toLowerCase() === student.name.trim().toLowerCase()
  );

  if (student.name && alreadyExists) {
    toast('Student already exists', 'warn');
    return;
  }

  STATE.students.push(student);

  const tr = document.createElement('tr');

  tr.dataset.studentId = id;

  tr.innerHTML = `
    <td>${studentCounter}</td>

    <td>
      <input type="text"
             placeholder="Student Name"
             value="${student.name}"
             class="s-name" />
    </td>

    <td>
      <select class="s-salestype">
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
        <option value="">-- Select Program --</option>
      </select>
    </td>

    <td>
      <button class="btn-icon remove-row-btn">
        <i class="fas fa-trash-alt"></i>
      </button>
    </td>
  `;

  buildProgramDropdown(
    tr.querySelector('.s-program'),
    student.program
  );

  tr.querySelector('.s-name').addEventListener('input', e => {
    student.name = e.target.value.trim();
  });

  tr.querySelector('.s-salestype').addEventListener('change', e => {
    student.salesType = e.target.value;
  });

  tr.querySelector('.s-payment').addEventListener('change', e => {
    student.paymentCategory = e.target.value;
  });

  tr.querySelector('.s-program').addEventListener('change', e => {
    student.program = e.target.value;
  });

  tr.querySelector('.remove-row-btn').addEventListener('click', () => {

    STATE.students = STATE.students.filter(s => s.id !== id);

    tr.remove();
  });

  tbody.appendChild(tr);

  return tr;
}

function buildProgramDropdown(sel, currentValue) {

  while (sel.options.length > 1) {
    sel.remove(1);
  }

  STATE.programs.forEach(p => {

    const opt = new Option(p, p);

    if (p === currentValue) {
      opt.selected = true;
    }

    sel.appendChild(opt);
  });
}

function refreshStudentProgramDropdowns() {

  document.querySelectorAll('#students-tbody tr').forEach(tr => {

    const id = tr.dataset.studentId;

    const student = STATE.students.find(s => s.id === id);

    if (!student) return;

    buildProgramDropdown(
      tr.querySelector('.s-program'),
      student.program
    );
  });
}

/* =====================================================
   ALLOCATION ENGINE
===================================================== */

const runAllocationBtn = document.getElementById('run-allocation-btn');

runAllocationBtn.addEventListener('click', runAllocation);

function runAllocation() {

  const validMentors = STATE.mentors.filter(m => m.name);

  if (validMentors.length === 0) {
    toast('Please add mentors', 'error');
    return;
  }

  const students = [...STATE.students];

  if (students.length === 0) {
    toast('No students found', 'error');
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
      const prog = student.program;

      let best = null;
      let bestScore = Infinity;

      validMentors.forEach(m => {

        const cap = m.capacity;
        const c = counts[m.id];

        // STRICT PROGRAM MATCH
        if (prog && !m.programs.includes(prog)) {
          return;
        }

        // TOTAL CAPACITY
        if (c.total >= cap) {
          return;
        }

        const stUsed = c[stKey];
        const pcUsed = c[pcKey];

        const stLimit = getQuota(cap, LIMITS[stKey]);
        const pcLimit = getQuota(cap, LIMITS[pcKey]);

        if (STRICT_MODE) {

          if (stUsed >= stLimit) {
            return;
          }

          if (pcUsed >= pcLimit) {
            return;
          }
        }

        // SMART WEIGHTED SCORE
        const salesCurrentRatio = c[stKey] / cap;
        const paymentCurrentRatio = c[pcKey] / cap;
        const totalLoadRatio = c.total / cap;

        const salesGap = Math.abs(
          LIMITS[stKey] - salesCurrentRatio
        );

        const paymentGap = Math.abs(
          LIMITS[pcKey] - paymentCurrentRatio
        );

        const score =
          (salesGap * 40) +
          (paymentGap * 40) +
          (totalLoadRatio * 20);

        if (score < bestScore) {
          bestScore = score;
          best = m;
        }
      });

      if (best) {

        counts[best.id][stKey]++;
        counts[best.id][pcKey]++;
        counts[best.id].total++;

        assigned.push({
          studentId: student.id,
          studentName: student.name,
          mentorId: best.id,
          mentorName: best.name,
          salesType: student.salesType,
          paymentCategory: student.paymentCategory,
          program: student.program
        });

      } else {

        unallocated.push({
          studentId: student.id,
          studentName: student.name,
          salesType: student.salesType,
          paymentCategory: student.paymentCategory,
          program: student.program,
          reason: determineReason(
            student,
            validMentors,
            counts
          )
        });
      }
    });

  const mentorStats = {};

  validMentors.forEach(m => {
    mentorStats[m.id] = {
      ...counts[m.id],
      capacity: m.capacity
    };
  });

  STATE.lastResults = {
    assigned,
    unallocated,
    mentorStats,
    mentors: validMentors
  };

  renderResults();

  toast(
    `Allocated ${assigned.length} students`,
    unallocated.length > 0 ? 'warn' : 'success'
  );
}

function determineReason(student, mentors, counts) {

  const stKey = student.salesType.toLowerCase();
  const pcKey = student.paymentCategory.toLowerCase();
  const prog = student.program;

  const reasons = [];

  mentors.forEach(m => {

    const cap = m.capacity;
    const c = counts[m.id];

    if (prog && !m.programs.includes(prog)) {
      reasons.push(`${m.name}: Program mismatch`);
      return;
    }

    if (c.total >= cap) {
      reasons.push(`${m.name}: Full capacity`);
      return;
    }

    if (
      c[stKey] >= getQuota(cap, LIMITS[stKey])
    ) {
      reasons.push(`${m.name}: ${student.salesType} quota full`);
      return;
    }

    if (
      c[pcKey] >= getQuota(cap, LIMITS[pcKey])
    ) {
      reasons.push(`${m.name}: ${student.paymentCategory} quota full`);
      return;
    }
  });

  return reasons.slice(0, 2).join('; ');
}

/* =====================================================
   RESULTS
===================================================== */

function renderResults() {

  if (!STATE.lastResults) return;

  const {
    assigned,
    unallocated,
    mentorStats,
    mentors
  } = STATE.lastResults;

  const resultsEl = document.getElementById('mentor-result-blocks');

  resultsEl.innerHTML = '';

  mentors.forEach(m => {

    const stats = mentorStats[m.id];

    const div = document.createElement('div');

    div.className = 'mentor-result-card';

    div.innerHTML = `
      <div class="mrc-header">

        <h3>${m.name}</h3>

        <div>
          Total: ${stats.total} / ${stats.capacity}
        </div>

      </div>

      <div class="mrc-body">

        ${makeBar('Channel', stats.channel, LIMITS.channel, stats.capacity)}

        ${makeBar('Inside', stats.inside, LIMITS.inside, stats.capacity)}

        ${makeBar('Annual', stats.annual, LIMITS.annual, stats.capacity)}

        ${makeBar('Full', stats.full, LIMITS.full, stats.capacity)}

        ${makeBar('Semester', stats.semester, LIMITS.semester, stats.capacity)}

      </div>
    `;

    resultsEl.appendChild(div);
  });

  console.log('Assigned', assigned);
  console.log('Unallocated', unallocated);
}

function makeBar(label, used, limitRatio, cap) {

  const limitCount = getQuota(cap, limitRatio);

  const pctUsed = cap > 0
    ? Math.min((used / cap) * 100, 100)
    : 0;

  const cls = barClass(used, limitRatio, cap);

  return `
    <div class="bar-group">

      <div class="bar-label">
        <span>${label}</span>
        <span>${used} / ${limitCount}</span>
      </div>

      <div class="bar-track">
        <div class="bar-fill ${cls}"
             style="width:${pctUsed}%"></div>
      </div>

    </div>
  `;
}

/* =====================================================
   RESET
===================================================== */

document
  .getElementById('reset-day-btn')
  .addEventListener('click', () => {

    if (!confirm('Reset all data?')) {
      return;
    }

    STATE.students = [];
    STATE.lastResults = null;

    studentCounter = 0;

    tbody.innerHTML = '';

    document.getElementById(
      'mentor-result-blocks'
    ).innerHTML = '';

    for (let i = 0; i < 3; i++) {
      addStudentRow();
    }

    toast('Reset completed', 'success');
  });

/* =====================================================
   EXPORT CSV
===================================================== */

document
  .getElementById('export-results-btn')
  .addEventListener('click', () => {

    if (!STATE.lastResults) {
      toast('No results available', 'warn');
      return;
    }

    const {
      assigned,
      unallocated
    } = STATE.lastResults;

    const rows = [
      [
        'Student Name',
        'Sales Type',
        'Payment Category',
        'Program',
        'Mentor',
        'Status'
      ]
    ];

    assigned.forEach(a => {

      rows.push([
        a.studentName,
        a.salesType,
        a.paymentCategory,
        a.program,
        a.mentorName,
        'Allocated'
      ]);
    });

    unallocated.forEach(u => {

      rows.push([
        u.studentName,
        u.salesType,
        u.paymentCategory,
        u.program,
        '',
        'Unallocated - ' + u.reason
      ]);
    });

    const csv = rows
      .map(r =>
        r.map(c =>
          `"${String(c).replace(/"/g, '""')}"`
        ).join(',')
      ).join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv'
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = `mentor-allocation-${new Date().toISOString().slice(0,10)}.csv`;

    a.click();

    URL.revokeObjectURL(url);

    toast('CSV exported', 'success');
  });
