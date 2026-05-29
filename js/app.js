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
  const container = document.getElementById('toast-container');

  if (!container) {
    alert(msg);
    return;
  }

  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.innerHTML = `<span>${msg}</span>`;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalize(value) {
  return String(value || '').trim();
}

function normalizeLower(value) {
  return normalize(value).toLowerCase();
}

/* =====================================================
   TABS
===================================================== */

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
      });

      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });

      btn.classList.add('active');

      const tab = document.getElementById('tab-' + tabName);

      if (tab) {
        tab.classList.add('active');
      }
    });
  });
}

function switchToTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
  });

  document.querySelectorAll('.tab-content').forEach(t => {
    t.classList.remove('active');
  });

  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  const tab = document.getElementById(`tab-${tabName}`);

  if (btn) btn.classList.add('active');
  if (tab) tab.classList.add('active');
}

/* =====================================================
   MENTORS
===================================================== */

function initMentors() {
  const btn = document.getElementById('add-mentor-btn');

  if (!btn) {
    console.error('Add mentor button not found');
    return;
  }

  btn.addEventListener('click', addMentor);
}

function addMentor() {
  const mentor = {
    id: 'M' + (++mentorCounter),
    name: '',
    capacity: 10,
    programs: []
  };

  STATE.mentors.push(mentor);
  renderMentor(mentor);
}

function renderMentor(mentor) {
  const template = document.getElementById('mentor-card-tpl');
  const list = document.getElementById('mentors-list');

  if (!template || !list) {
    console.error('Mentor template or mentors list not found');
    return;
  }

  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.mentor-card');

  const nameInput = card.querySelector('.mentor-name-input');
  const capInput = card.querySelector('.mentor-capacity');
  const removeBtn = card.querySelector('.remove-mentor-btn');

  nameInput.value = mentor.name;
  capInput.value = mentor.capacity;

  nameInput.addEventListener('input', e => {
    mentor.name = normalize(e.target.value);
  });

  capInput.addEventListener('input', e => {
    const value = parseInt(e.target.value, 10);
    mentor.capacity = Number.isFinite(value) && value > 0 ? value : 1;
  });

  const checkboxes = card.querySelectorAll('.mentor-program-checkbox');

  checkboxes.forEach(cb => {
    cb.checked = mentor.programs.includes(cb.value);

    cb.addEventListener('change', () => {
      mentor.programs = Array.from(checkboxes)
        .filter(x => x.checked)
        .map(x => x.value);

      cb.closest('.program-chip')?.classList.toggle('checked', cb.checked);
    });
  });

  removeBtn.addEventListener('click', () => {
    STATE.mentors = STATE.mentors.filter(m => m.id !== mentor.id);
    card.remove();
    toast('Mentor removed', 'warn');
  });

  list.appendChild(card);
}

/* =====================================================
   STUDENTS
===================================================== */

function initStudents() {
  const addBtn = document.getElementById('add-student-row-btn');
  const clearBtn = document.getElementById('clear-students-btn');

  if (addBtn) {
    addBtn.addEventListener('click', () => addStudentRow());
  } else {
    console.error('Add student row button not found');
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', clearStudents);
  }

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }
}

function addStudentRow(data = {}) {
  const tbody = document.getElementById('students-tbody');

  if (!tbody) {
    console.error('Students tbody not found');
    return;
  }

  const student = {
    id: 'S' + (++studentCounter),
    rollNumber: normalize(data.rollNumber),
    salesType: normalize(data.salesType) || 'Channel',
    paymentCategory: normalize(data.paymentCategory) || 'Annual',
    program: normalize(data.program) || PROGRAMS[0],
    existingMentor: normalize(data.existingMentor)
  };

  if (!['Channel', 'Inside'].includes(student.salesType)) {
    student.salesType = 'Channel';
  }

  if (!['Annual', 'Full', 'Semester'].includes(student.paymentCategory)) {
    student.paymentCategory = 'Annual';
  }

  if (!PROGRAMS.includes(student.program)) {
    student.program = PROGRAMS[0];
  }

  STATE.students.push(student);

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="row-num">${studentCounter}</td>

    <td>
      <input class="s-roll" value="${escapeHtml(student.rollNumber)}" />
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
          <option value="${escapeHtml(p)}">${escapeHtml(p)}</option>
        `).join('')}
      </select>
    </td>

    <td>
      <input class="s-existing" value="${escapeHtml(student.existingMentor)}" />
    </td>

    <td>
      <button class="remove-row-btn" type="button">X</button>
    </td>
  `;

  tr.querySelector('.s-sales').value = student.salesType;
  tr.querySelector('.s-payment').value = student.paymentCategory;
  tr.querySelector('.s-program').value = student.program;

  tr.querySelector('.s-roll').addEventListener('input', e => {
    student.rollNumber = normalize(e.target.value);
  });

  tr.querySelector('.s-sales').addEventListener('change', e => {
    student.salesType = e.target.value;
  });

  tr.querySelector('.s-payment').addEventListener('change', e => {
    student.paymentCategory = e.target.value;
  });

  tr.querySelector('.s-program').addEventListener('change', e => {
    student.program = e.target.value;
  });

  tr.querySelector('.s-existing').addEventListener('input', e => {
    student.existingMentor = normalize(e.target.value);
  });

  tr.querySelector('.remove-row-btn').addEventListener('click', () => {
    STATE.students = STATE.students.filter(s => s.id !== student.id);
    tr.remove();
    refreshRowNumbers();
  });

  tbody.appendChild(tr);
  refreshRowNumbers();
}

function refreshRowNumbers() {
  document.querySelectorAll('#students-tbody tr').forEach((tr, index) => {
    const cell = tr.querySelector('.row-num');
    if (cell) cell.textContent = index + 1;
  });
}

function clearStudents() {
  if (!confirm('Clear students?')) return;

  STATE.students = [];
  studentCounter = 0;

  const tbody = document.getElementById('students-tbody');
  if (tbody) tbody.innerHTML = '';

  toast('Students cleared', 'success');
}

/* =====================================================
   CSV IMPORT
===================================================== */

function initCSVImport() {
  const btn = document.getElementById('import-csv-btn');
  const input = document.getElementById('csv-file-input');

  if (!btn || !input) {
    console.error('CSV import button or input not found');
    return;
  }

  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', handleCSVImport);
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());

  return result.map(c => c.replace(/^"|"$/g, '').trim());
}

function handleCSVImport(e) {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = ev => {
    const text = ev.target.result || '';
    const lines = text.split(/\r?\n/).filter(line => line.trim());

    let imported = 0;

    lines.forEach((line, index) => {
      const cols = parseCSVLine(line);

      if (
        index === 0 &&
        cols.join(',').toLowerCase().includes('roll')
      ) {
        return;
      }

      if (!cols[0]) return;

      addStudentRow({
        rollNumber: cols[0],
        salesType: cols[1] || 'Channel',
        paymentCategory: cols[2] || 'Annual',
        program: cols[3] || PROGRAMS[0],
        existingMentor: cols[4] || ''
      });

      imported++;
    });

    toast(`${imported} students imported`, 'success');
    e.target.value = '';
  };

  reader.onerror = () => {
    toast('Unable to read CSV file', 'error');
  };

  reader.readAsText(file);
}

/* =====================================================
   ALLOCATION ENGINE
===================================================== */

function initAllocation() {
  const btn = document.getElementById('run-allocation-btn');

  console.log('Run allocation button found:', btn);

  if (!btn) {
    console.error('Run Allocation button not found');
    return;
  }

  btn.addEventListener('click', () => {
    console.log('Run Allocation clicked');
    runAllocation();
  });
}

function runAllocation() {
  console.log('Run allocation started');
  console.log('Mentors:', STATE.mentors);
  console.log('Students:', STATE.students);

  const validMentors = STATE.mentors.filter(m => normalize(m.name));

  if (validMentors.length === 0) {
    toast('Please add at least one mentor with name', 'error');
    switchToTab('setup');
    return;
  }

  const students = STATE.students.filter(s => normalize(s.rollNumber));

  if (students.length === 0) {
    toast('Please add at least one student roll number', 'error');
    switchToTab('allocate');
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
  const lockedStudentIds = new Set();

  /* =========================================
     LOCK EXISTING MENTOR STUDENTS
  ========================================= */

  students.forEach(student => {
    if (!student.existingMentor) return;

    const mentor = validMentors.find(m =>
      normalizeLower(m.name) === normalizeLower(student.existingMentor)
    );

    if (!mentor) {
      unallocated.push({
        ...student,
        reason: `Existing mentor "${student.existingMentor}" not found`
      });
      lockedStudentIds.add(student.id);
      return;
    }

    if (counts[mentor.id].total >= mentor.capacity) {
      unallocated.push({
        ...student,
        reason: `Existing mentor "${mentor.name}" capacity full`
      });
      lockedStudentIds.add(student.id);
      return;
    }

    incrementCounts(counts[mentor.id], student);

    assigned.push({
      ...student,
      mentorName: mentor.name,
      locked: true
    });

    lockedStudentIds.add(student.id);
  });

  /* =========================================
     NEW STUDENTS
  ========================================= */

  const newStudents = students.filter(s => !lockedStudentIds.has(s.id));

  newStudents.forEach(student => {
    const eligible = validMentors.filter(m => {
      const mentorCount = counts[m.id];

      const programAllowed =
        !m.programs.length || m.programs.includes(student.program);

      const hasCapacity =
        mentorCount.total < m.capacity;

      return programAllowed && hasCapacity;
    });

    if (!eligible.length) {
      unallocated.push({
        ...student,
        reason: 'No eligible mentor found for program/capacity'
      });
      return;
    }

    let best = null;
    let bestScore = Infinity;

    eligible.forEach(m => {
      const c = counts[m.id];

      const salesKey = normalizeLower(student.salesType);
      const payKey = normalizeLower(student.paymentCategory);

      const score =
        (c.total * 1000) +
        ((c[salesKey] || 0) * 500) +
        ((c[payKey] || 0) * 500);

      if (score < bestScore) {
        bestScore = score;
        best = m;
      }
    });

    if (!best) {
      unallocated.push({
        ...student,
        reason: 'Unable to calculate best mentor'
      });
      return;
    }

    incrementCounts(counts[best.id], student);

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
  switchToTab('results');

  toast(`Allocated ${assigned.length} learners`, 'success');
}

function incrementCounts(countObj, student) {
  const salesKey = normalizeLower(student.salesType);
  const payKey = normalizeLower(student.paymentCategory);

  if (countObj[salesKey] !== undefined) {
    countObj[salesKey]++;
  }

  if (countObj[payKey] !== undefined) {
    countObj[payKey]++;
  }

  countObj.total++;
}

/* =====================================================
   RESULTS
===================================================== */

function renderResults() {
  const results = STATE.lastResults;

  if (!results) return;

  const summary = document.getElementById('summary-cards');
  const blocks = document.getElementById('mentor-result-blocks');
  const unallocatedSection = document.getElementById('unallocated-section');
  const unallocatedList = document.getElementById('unallocated-list');

  if (!summary || !blocks) {
    console.error('Result containers not found');
    return;
  }

  summary.innerHTML = `
    <div class="summary-card">
      <div class="sc-num">${results.assigned.length}</div>
      <div class="sc-lbl">Allocated</div>
    </div>

    <div class="summary-card">
      <div class="sc-num">${results.unallocated.length}</div>
      <div class="sc-lbl">Unallocated</div>
    </div>

    <div class="summary-card">
      <div class="sc-num">${results.mentors.length}</div>
      <div class="sc-lbl">Active Mentors</div>
    </div>
  `;

  blocks.innerHTML = '';

  results.mentors.forEach(m => {
    const c = results.counts[m.id];

    const mentorStudents = results.assigned.filter(a => a.mentorName === m.name);

    const div = document.createElement('div');
    div.className = 'mentor-result-card';

    div.innerHTML = `
      <div class="mrc-header">
        <h3>${escapeHtml(m.name)}</h3>
        <span>${c.total} / ${m.capacity}</span>
      </div>

      <div class="mrc-body">
        <p>
          Channel: ${c.channel} |
          Inside: ${c.inside}
        </p>

        <p>
          Annual: ${c.annual} |
          Full: ${c.full} |
          Semester: ${c.semester}
        </p>

        <p>
          Programs:
          ${m.programs.length ? escapeHtml(m.programs.join(', ')) : 'All Programs'}
        </p>

        <div class="student-mini-list">
          ${
            mentorStudents.length
              ? mentorStudents.map(s => `
                <div class="student-chip">
                  ${escapeHtml(s.rollNumber)}
                  •
                  ${escapeHtml(s.program)}
                  ${s.locked ? '(Locked)' : ''}
                </div>
              `).join('')
              : '<div class="student-chip">No students allocated</div>'
          }
        </div>
      </div>
    `;

    blocks.appendChild(div);
  });

  if (unallocatedSection && unallocatedList) {
    if (results.unallocated.length > 0) {
      unallocatedSection.style.display = 'block';

      unallocatedList.innerHTML = results.unallocated.map(s => `
        <div class="student-chip">
          ${escapeHtml(s.rollNumber)}
          •
          ${escapeHtml(s.program)}
          •
          ${escapeHtml(s.reason || 'Unallocated')}
        </div>
      `).join('');
    } else {
      unallocatedSection.style.display = 'none';
      unallocatedList.innerHTML = '';
    }
  }
}

/* =====================================================
   RESET
===================================================== */

function initReset() {
  const btn = document.getElementById('reset-day-btn');

  if (!btn) return;

  btn.addEventListener('click', resetDay);
}

function resetDay() {
  if (!confirm('Reset all?')) return;

  STATE.mentors = [];
  STATE.students = [];
  STATE.lastResults = null;

  mentorCounter = 0;
  studentCounter = 0;

  const mentorsList = document.getElementById('mentors-list');
  const studentsTbody = document.getElementById('students-tbody');
  const summaryCards = document.getElementById('summary-cards');
  const mentorBlocks = document.getElementById('mentor-result-blocks');
  const unallocatedSection = document.getElementById('unallocated-section');
  const unallocatedList = document.getElementById('unallocated-list');

  if (mentorsList) mentorsList.innerHTML = '';
  if (studentsTbody) studentsTbody.innerHTML = '';
  if (summaryCards) summaryCards.innerHTML = '';
  if (mentorBlocks) mentorBlocks.innerHTML = '';
  if (unallocatedSection) unallocatedSection.style.display = 'none';
  if (unallocatedList) unallocatedList.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }

  switchToTab('setup');

  toast('Reset completed', 'success');
}

/* =====================================================
   EXPORT CSV
===================================================== */

function initExport() {
  const btn = document.getElementById('export-results-btn');

  if (!btn) return;

  btn.addEventListener('click', exportCSV);
}

function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function exportCSV() {
  if (!STATE.lastResults) {
    toast('No results available', 'warn');
    return;
  }

  const rows = [[
    'Roll Number',
    'Mentor',
    'Sales Type',
    'Payment Category',
    'Program',
    'Locked',
    'Status',
    'Reason'
  ]];

  STATE.lastResults.assigned.forEach(a => {
    rows.push([
      a.rollNumber,
      a.mentorName,
      a.salesType,
      a.paymentCategory,
      a.program,
      a.locked ? 'Yes' : 'No',
      'Allocated',
      ''
    ]);
  });

  STATE.lastResults.unallocated.forEach(u => {
    rows.push([
      u.rollNumber,
      '',
      u.salesType,
      u.paymentCategory,
      u.program,
      'No',
      'Unallocated',
      u.reason || ''
    ]);
  });

  const csv = rows
    .map(row => row.map(csvEscape).join(','))
    .join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'mentor-allocation.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

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
