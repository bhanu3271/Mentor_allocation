'use strict';

const PROGRAMS = [
  'BBA', 'BCA', 'B.Com', 'MA.JMC', 'MBA',
  'MCA', 'M.Com', 'MA in Economics', 'MSc in Mathematics'
];

const PAYMENT_CATEGORIES = ['Annual', 'Full Payment', 'Semester'];
const SALES_TYPES = ['Channel', 'Inside'];
const DEFAULT_MENTOR_CAPACITY = 800;

const PROGRAM_RATIO_RULES = {
  'BCA|MCA': {
    BCA: 0.75,
    MCA: 0.25
  },

  'BBA|MBA': {
    BBA: 0.40,
    MBA: 0.60
  }
};

const DEFAULT_MENTORS = [
  ['Varsha', 'MSc in Mathematics'],
  ['Sachin', 'MA.JMC', 'MBA'],
  ['Mentor 3', 'MBA', 'M.Com'],
  ['Mentor 4', 'BBA', 'MBA']
];

const STATE = {
  mentors: [],
  students: [],
  lastResults: null
};

let mentorCounter = 0;
let studentCounter = 0;

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

  setTimeout(() => div.remove(), 3000);
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

function normalizeProgram(value) {
  const val = normalizeLower(value);

  if (['b.com', 'bcom', 'b.com.', 'b.com '].includes(val)) return 'B.Com';
  if (['bba'].includes(val)) return 'BBA';
  if (['bca'].includes(val)) return 'BCA';
  if (['mba'].includes(val)) return 'MBA';
  if (['mca'].includes(val)) return 'MCA';
  if (['m.com', 'mcom', 'm.com.'].includes(val)) return 'M.Com';
  if (['majmc', 'ma.jmc', 'ma jmc', 'ma-jmc'].includes(val)) return 'MA.JMC';
  if (['ma.eco', 'ma eco', 'ma economics', 'ma in economics'].includes(val)) return 'MA in Economics';
  if (['msc math', 'msc mathematics', 'msc in mathematics', 'm.sc mathematics'].includes(val)) return 'MSc in Mathematics';

  return normalize(value);
}

function normalizePaymentCategory(value) {
  const val = normalizeLower(value);

  if (
    val === 'full' ||
    val === 'full payment' ||
    val === 'fullpayment' ||
    val === 'fu'
  ) {
    return 'Full Payment';
  }

  if (val === 'semester' || val === 'sem' || val === 'se') {
    return 'Semester';
  }

  return 'Annual';
}

function normalizeSalesType(value) {
  const val = normalizeLower(value);
  return val === 'inside' || val === 'in' ? 'Inside' : 'Channel';
}

function getPaymentKey(paymentCategory) {
  const value = normalizePaymentCategory(paymentCategory);

  if (value === 'Full Payment') return 'fullPayment';
  if (value === 'Semester') return 'semester';

  return 'annual';
}

function getSalesKey(salesType) {
  return normalizeSalesType(salesType) === 'Inside' ? 'inside' : 'channel';
}

function pct(part, total) {
  if (!total) return '0%';
  return ((part / total) * 100).toFixed(2) + '%';
}

function getMentorProgramKey(mentor) {
  return mentor.programs
    .map(p => normalizeProgram(p))
    .sort()
    .join('|');
}

function getProgramRatioTarget(mentor, program) {
  const key = getMentorProgramKey(mentor);
  const rule = PROGRAM_RATIO_RULES[key];

  if (!rule) return null;

  const ratio = rule[program];

  if (ratio === undefined) return null;

  return mentor.capacity * ratio;
}

/* =====================================================
   TABS
===================================================== */

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchToTab(btn.dataset.tab));
  });
}

function switchToTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
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

  if (btn) {
    btn.addEventListener('click', addMentor);
  }

  loadDefaultMentors();
}

function loadDefaultMentors() {
  STATE.mentors = [];
  mentorCounter = 0;

  const list = document.getElementById('mentors-list');
  if (list) list.innerHTML = '';

  DEFAULT_MENTORS.forEach(row => {
    const mentor = {
      id: 'M' + (++mentorCounter),
      name: row[0],
      capacity: DEFAULT_MENTOR_CAPACITY,
      programs: [
        normalizeProgram(row[1]),
        normalizeProgram(row[2])
      ].filter(Boolean)
    };

    STATE.mentors.push(mentor);
    renderMentor(mentor);
  });

  toast('Default mentors loaded', 'success');
}

function addMentor() {
  const mentor = {
    id: 'M' + (++mentorCounter),
    name: '',
    capacity: DEFAULT_MENTOR_CAPACITY,
    programs: []
  };

  STATE.mentors.push(mentor);
  renderMentor(mentor);
}

function renderMentor(mentor) {
  const template = document.getElementById('mentor-card-tpl');
  const list = document.getElementById('mentors-list');

  if (!template || !list) return;

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

    if (!Number.isFinite(value) || value < 1) {
      mentor.capacity = 1;
      capInput.value = 1;
      return;
    }

    if (value > DEFAULT_MENTOR_CAPACITY) {
      mentor.capacity = DEFAULT_MENTOR_CAPACITY;
      capInput.value = DEFAULT_MENTOR_CAPACITY;
      toast('Maximum mentor capacity is 800', 'warn');
      return;
    }

    mentor.capacity = value;
  });

  const checkboxes = card.querySelectorAll('.mentor-program-checkbox');

  checkboxes.forEach(cb => {
    cb.checked = mentor.programs.includes(cb.value);
    cb.closest('.program-chip')?.classList.toggle('checked', cb.checked);

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

  if (addBtn) addBtn.addEventListener('click', () => addStudentRow());
  if (clearBtn) clearBtn.addEventListener('click', clearStudents);

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }
}

function addStudentRow(data = {}) {
  const tbody = document.getElementById('students-tbody');

  if (!tbody) return;

  const student = {
    id: 'S' + (++studentCounter),
    rollNumber: normalize(data.rollNumber),
    salesType: normalizeSalesType(data.salesType),
    paymentCategory: normalizePaymentCategory(data.paymentCategory),
    program: normalizeProgram(data.program) || PROGRAMS[0],
    existingMentor: normalize(data.existingMentor)
  };

  if (!PROGRAMS.includes(student.program)) {
    student.program = PROGRAMS[0];
  }

  STATE.students.push(student);

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="row-num"></td>

    <td>
      <input class="s-roll" value="${escapeHtml(student.rollNumber)}" />
    </td>

    <td>
      <select class="s-sales">
        ${SALES_TYPES.map(type => `
          <option value="${escapeHtml(type)}">${escapeHtml(type)}</option>
        `).join('')}
      </select>
    </td>

    <td>
      <select class="s-payment">
        ${PAYMENT_CATEGORIES.map(type => `
          <option value="${escapeHtml(type)}">${escapeHtml(type)}</option>
        `).join('')}
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
    student.salesType = normalizeSalesType(e.target.value);
  });

  tr.querySelector('.s-payment').addEventListener('change', e => {
    student.paymentCategory = normalizePaymentCategory(e.target.value);
  });

  tr.querySelector('.s-program').addEventListener('change', e => {
    student.program = normalizeProgram(e.target.value);
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

  if (!btn || !input) return;

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

      if (index === 0 && cols.join(',').toLowerCase().includes('roll')) {
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

  reader.onerror = () => toast('Unable to read CSV file', 'error');

  reader.readAsText(file);
}

/* =====================================================
   ALLOCATION ENGINE
===================================================== */

function initAllocation() {
  const btn = document.getElementById('run-allocation-btn');

  if (!btn) return;

  btn.addEventListener('click', runAllocation);
}

function createEmptyCount() {
  return {
    channel: 0,
    inside: 0,
    annual: 0,
    fullPayment: 0,
    semester: 0,
    total: 0,
    byProgram: {}
  };
}

function ensureProgramCount(countObj, program) {
  if (!countObj.byProgram[program]) {
    countObj.byProgram[program] = {
      channel: 0,
      inside: 0,
      annual: 0,
      fullPayment: 0,
      semester: 0,
      total: 0
    };
  }

  return countObj.byProgram[program];
}

function incrementCounts(countObj, student) {
  const salesKey = getSalesKey(student.salesType);
  const paymentKey = getPaymentKey(student.paymentCategory);
  const program = normalizeProgram(student.program);

  countObj[salesKey]++;
  countObj[paymentKey]++;
  countObj.total++;

  const programCount = ensureProgramCount(countObj, program);

  programCount[salesKey]++;
  programCount[paymentKey]++;
  programCount.total++;
}

function mentorCanTakeProgram(mentor, program) {
  const normalizedProgram = normalizeProgram(program);

  return mentor.programs
    .map(p => normalizeProgram(p))
    .includes(normalizedProgram);
}

function getEligibleMentorsForProgram(validMentors, program) {
  return validMentors.filter(m => mentorCanTakeProgram(m, program));
}

function getEligibleMentorsForStudent(validMentors, counts, student) {
  const program = normalizeProgram(student.program);

  return validMentors.filter(m => {
    const programAllowed = mentorCanTakeProgram(m, program);
    const hasCapacity = counts[m.id].total < m.capacity;

    if (!programAllowed || !hasCapacity) return false;

    const ratioTarget = getProgramRatioTarget(m, program);

    if (ratioTarget !== null) {
      const programCount = ensureProgramCount(counts[m.id], program);
      return programCount.total < ratioTarget;
    }

    return true;
  });
}

function buildProgramTargets(students, validMentors) {
  const targets = {};

  PROGRAMS.forEach(program => {
    const totalProgramLearners = students.filter(s => s.program === program).length;
    const eligibleMentors = getEligibleMentorsForProgram(validMentors, program);

    if (!totalProgramLearners || !eligibleMentors.length) return;

    targets[program] = {
      total: totalProgramLearners,
      mentorCount: eligibleMentors.length,
      targetPerMentor: totalProgramLearners / eligibleMentors.length
    };
  });

  return targets;
}

function runAllocation() {
  const validMentors = STATE.mentors.filter(m => normalize(m.name));

  if (validMentors.length === 0) {
    toast('Please add at least one mentor with name', 'error');
    switchToTab('setup');
    return;
  }

  const students = STATE.students
    .filter(s => normalize(s.rollNumber))
    .map(s => ({
      ...s,
      program: normalizeProgram(s.program),
      salesType: normalizeSalesType(s.salesType),
      paymentCategory: normalizePaymentCategory(s.paymentCategory)
    }));

  if (students.length === 0) {
    toast('Please add at least one student roll number', 'error');
    switchToTab('allocate');
    return;
  }

  const counts = {};

  validMentors.forEach(m => {
    counts[m.id] = createEmptyCount();
  });

  const programTargets = buildProgramTargets(students, validMentors);

  const assigned = [];
  const unallocated = [];
  const processedStudentIds = new Set();

  /* Count locked existing learners first */
  students.forEach(student => {
    if (!student.existingMentor) return;

    const mentor = validMentors.find(m =>
      normalizeLower(m.name) === normalizeLower(student.existingMentor)
    );

    if (!mentor) {
      unallocated.push({
        ...student,
        mentorName: student.existingMentor,
        locked: true,
        reason: `Existing mentor "${student.existingMentor}" not found`
      });

      processedStudentIds.add(student.id);
      return;
    }

    incrementCounts(counts[mentor.id], student);

    assigned.push({
      ...student,
      mentorName: mentor.name,
      locked: true
    });

    processedStudentIds.add(student.id);
  });

  /* Allocate only non-locked learners */
  const newStudents = students.filter(s => !processedStudentIds.has(s.id));

  newStudents.sort((a, b) => {
    const programCompare = a.program.localeCompare(b.program);
    if (programCompare !== 0) return programCompare;

    const paymentCompare = a.paymentCategory.localeCompare(b.paymentCategory);
    if (paymentCompare !== 0) return paymentCompare;

    return a.salesType.localeCompare(b.salesType);
  });

  newStudents.forEach(student => {
    const program = normalizeProgram(student.program);
    const salesKey = getSalesKey(student.salesType);
    const paymentKey = getPaymentKey(student.paymentCategory);
    const targetInfo = programTargets[program];

    const eligibleMentors = getEligibleMentorsForStudent(
      validMentors,
      counts,
      student
    );

    if (!eligibleMentors.length) {
      unallocated.push({
        ...student,
        reason: `No mentor mapped to ${program}, ratio target reached, or capacity full`
      });
      return;
    }

    let bestMentor = null;
    let bestScore = Infinity;

    eligibleMentors.forEach(m => {
      const overallCount = counts[m.id];
      const programCount = ensureProgramCount(overallCount, program);

      const ratioTarget = getProgramRatioTarget(m, program);
      const target = ratioTarget !== null
        ? ratioTarget
        : targetInfo
          ? targetInfo.targetPerMentor
          : 0;

      const gap = target - programCount.total;

      const score =
        (-gap * 100000000) +
        (programCount[paymentKey] * 100000) +
        (programCount[salesKey] * 10000) +
        (overallCount.total * 1000);

      if (score < bestScore) {
        bestScore = score;
        bestMentor = m;
      }
    });

    incrementCounts(counts[bestMentor.id], student);

    assigned.push({
      ...student,
      mentorName: bestMentor.name,
      locked: false
    });
  });

  STATE.lastResults = {
    assigned,
    unallocated,
    counts,
    mentors: validMentors,
    programTargets
  };

  renderResults();
  switchToTab('results');

  toast(`Allocated ${assigned.length} learners`, 'success');
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

  if (!summary || !blocks) return;

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
      <div class="sc-lbl">Mentors</div>
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
        <p>Channel: ${c.channel} | Inside: ${c.inside}</p>
        <p>Annual: ${c.annual} | Full Payment: ${c.fullPayment} | Semester: ${c.semester}</p>
        <p>Programs: ${m.programs.length ? escapeHtml(m.programs.join(', ')) : 'No Program'}</p>

        <div class="student-mini-list">
          ${
            mentorStudents.length
              ? mentorStudents.map(s => `
                <div class="student-chip">
                  ${escapeHtml(s.rollNumber)}
                  • ${escapeHtml(s.salesType)}
                  • ${escapeHtml(s.paymentCategory)}
                  • ${escapeHtml(s.program)}
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
          • ${escapeHtml(s.salesType)}
          • ${escapeHtml(s.paymentCategory)}
          • ${escapeHtml(s.program)}
          • ${escapeHtml(s.reason || 'Unallocated')}
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

  STATE.students = [];
  STATE.lastResults = null;
  studentCounter = 0;

  const studentsTbody = document.getElementById('students-tbody');
  const summaryCards = document.getElementById('summary-cards');
  const mentorBlocks = document.getElementById('mentor-result-blocks');
  const unallocatedSection = document.getElementById('unallocated-section');
  const unallocatedList = document.getElementById('unallocated-list');

  if (studentsTbody) studentsTbody.innerHTML = '';
  if (summaryCards) summaryCards.innerHTML = '';
  if (mentorBlocks) mentorBlocks.innerHTML = '';
  if (unallocatedSection) unallocatedSection.style.display = 'none';
  if (unallocatedList) unallocatedList.innerHTML = '';

  for (let i = 0; i < 3; i++) {
    addStudentRow();
  }

  switchToTab('allocate');
  toast('Student data reset completed', 'success');
}

/* =====================================================
   EXPORT EXCEL
===================================================== */

function initExport() {
  const btn = document.getElementById('export-results-btn');

  if (!btn) return;

  btn.addEventListener('click', exportCSV);
}

function exportCSV() {
  if (!STATE.lastResults) {
    toast('No results available', 'warn');
    return;
  }

  if (typeof XLSX === 'undefined') {
    toast('Excel library not loaded. Please check HTML script.', 'error');
    return;
  }

  const assigned = STATE.lastResults.assigned;
  const unallocated = STATE.lastResults.unallocated;
  const mentors = STATE.lastResults.mentors;
  const totalAllocated = assigned.length;

  const sheet1 = [[
    'Roll Number',
    'Mentor',
    'Sales Type',
    'Payment Category',
    'Program',
    'Locked',
    'Status',
    'Reason'
  ]];

  assigned.forEach(a => {
    sheet1.push([
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

  unallocated.forEach(u => {
    sheet1.push([
      u.rollNumber,
      u.mentorName || '',
      u.salesType,
      u.paymentCategory,
      u.program,
      u.locked ? 'Yes' : 'No',
      'Unallocated',
      u.reason || ''
    ]);
  });

  const sheet2 = [[
    'Mentor',
    'Assigned Learners',
    'Overall Allocation %',
    'Program',
    'Program Target',
    'Program Learners Assigned',
    'Program Gap',
    'Program % within Mentor',
    'Program % of Overall Allocation',
    'Channel Total',
    'Channel Annual',
    'Channel Annual %',
    'Channel Full Payment',
    'Channel Full Payment %',
    'Channel Semester',
    'Channel Semester %',
    'Inside Total',
    'Inside Annual',
    'Inside Annual %',
    'Inside Full Payment',
    'Inside Full Payment %',
    'Inside Semester',
    'Inside Semester %',
    'Locked Learners',
    'Newly Allocated Learners',
    'Capacity',
    'Assigned Programs'
  ]];

  mentors.forEach(m => {
    const mentorRows = assigned.filter(a => a.mentorName === m.name);
    const mentorTotal = mentorRows.length;
    const lockedCount = mentorRows.filter(a => a.locked).length;
    const newCount = mentorRows.filter(a => !a.locked).length;
    const mentorPrograms = [...new Set([...m.programs, ...mentorRows.map(a => a.program)])];

    mentorPrograms.forEach(program => {
      const programRows = mentorRows.filter(a => a.program === program);

      const ratioTarget = getProgramRatioTarget(m, program);
      const targetInfo = STATE.lastResults.programTargets?.[program];

      const target = ratioTarget !== null
        ? ratioTarget
        : targetInfo
          ? targetInfo.targetPerMentor
          : 0;

      const gap = target - programRows.length;

      const channelRows = programRows.filter(a => a.salesType === 'Channel');
      const insideRows = programRows.filter(a => a.salesType === 'Inside');

      const channelAnnual = channelRows.filter(a => a.paymentCategory === 'Annual').length;
      const channelFull = channelRows.filter(a => a.paymentCategory === 'Full Payment').length;
      const channelSemester = channelRows.filter(a => a.paymentCategory === 'Semester').length;

      const insideAnnual = insideRows.filter(a => a.paymentCategory === 'Annual').length;
      const insideFull = insideRows.filter(a => a.paymentCategory === 'Full Payment').length;
      const insideSemester = insideRows.filter(a => a.paymentCategory === 'Semester').length;

      sheet2.push([
        m.name,
        mentorTotal,
        pct(mentorTotal, totalAllocated),
        program,
        Number(target.toFixed(2)),
        programRows.length,
        Number(gap.toFixed(2)),
        pct(programRows.length, mentorTotal),
        pct(programRows.length, totalAllocated),
        channelRows.length,
        channelAnnual,
        pct(channelAnnual, channelRows.length),
        channelFull,
        pct(channelFull, channelRows.length),
        channelSemester,
        pct(channelSemester, channelRows.length),
        insideRows.length,
        insideAnnual,
        pct(insideAnnual, insideRows.length),
        insideFull,
        pct(insideFull, insideRows.length),
        insideSemester,
        pct(insideSemester, insideRows.length),
        lockedCount,
        newCount,
        m.capacity,
        m.programs.join(', ')
      ]);
    });
  });

  const workbook = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1);
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2);

  XLSX.utils.book_append_sheet(workbook, ws1, 'Learner Allocation');
  XLSX.utils.book_append_sheet(workbook, ws2, 'Mentor Summary');

  XLSX.writeFile(workbook, 'mentor-allocation.xlsx');

  toast('Excel Exported', 'success');
}

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
