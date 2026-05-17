const vagueVerbs = [
  'understand',
  'demonstrate an understanding of',
  'develop an understanding of',
  'explore',
  'read',
  'think about',
  'learn about'
];

const assessmentTypes = [
  'Discussion',
  'Quiz/Exam',
  'Written Assignment',
  'Interactive Activity',
  'Other'
];

const materialTypes = [
  'Reading',
  'Lecture Video',
  'Other Video',
  'Website',
  'Interactive Object',
  'Other'
];

const storageKey = 'courseMapDraft';

let state = {
  courseNumber: '',
  courseName: '',
  clos: ['', '', ''],
  modules: []
};

const elements = {
  courseNumber: document.getElementById('courseNumber'),
  courseName: document.getElementById('courseName'),
  cloList: document.getElementById('cloList'),
  addCloBtn: document.getElementById('addCloBtn'),
  modulesSection: document.getElementById('modulesSection'),
  addModuleBtn: document.getElementById('addModuleBtn'),
  alignmentSummary: document.getElementById('alignmentSummary'),
  alignmentCheckBtn: document.getElementById('alignmentCheckBtn'),
  downloadWordBtn: document.getElementById('downloadWordBtn')
};

function createDefaultMO() {
  return {
    text: '',
    alignedClos: state.clos.map(() => false),
    expanded: true
  };
}

function createDefaultAssessment(moCount) {
  return {
    type: '',
    desc: '',
    alignedMos: Array.from({ length: moCount }, () => false),
    expanded: true
  };
}

function createDefaultMaterial() {
  return {
    type: '',
    desc: '',
    expanded: true
  };
}

function createDefaultModule() {
  return {
    title: '',
    mos: [],
    assessments: [],
    materials: []
  };
}

function loadState() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      state = {
        ...state,
        ...parsed,
        clos: Array.isArray(parsed.clos) && parsed.clos.length ? parsed.clos : state.clos,
        modules: Array.isArray(parsed.modules) ? parsed.modules : []
      };
    }
  } catch (error) {
    console.warn('Unable to load saved course map:', error);
  }

  if (!Array.isArray(state.clos) || state.clos.length < 1) {
    state.clos = ['', '', ''];
  }

  if (state.clos.length > 10) {
    state.clos = state.clos.slice(0, 10);
  }

  if (!Array.isArray(state.modules)) {
    state.modules = [];
  }

  if (state.modules.length === 0) {
    state.modules.push(createDefaultModule());
  }

  state.modules = state.modules.map(module => {
    if (!Array.isArray(module.mos) || module.mos.length < 1) {
      module.mos = [];
    }
    module.mos = module.mos.map(mo => {
      if (!Array.isArray(mo.alignedClos) || mo.alignedClos.length !== state.clos.length) {
        mo.alignedClos = state.clos.map((_, index) => mo.alignedClos?.[index] ?? false);
      }
      return {
        text: typeof mo.text === 'string' ? mo.text : '',
        alignedClos: mo.alignedClos,
        expanded: typeof mo.expanded === 'boolean' ? mo.expanded : true
      };
    });

    module.assessments = Array.isArray(module.assessments) ? module.assessments : [];
    module.assessments = module.assessments.map(assessment => {
      const alignedMos = Array.isArray(assessment.alignedMos) ? assessment.alignedMos : [];
      return {
        type: assessmentTypes.includes(assessment.type) ? assessment.type : '',
        desc: typeof assessment.desc === 'string' ? assessment.desc : '',
        alignedMos: module.mos.map((_, index) => alignedMos[index] ?? false),
        expanded: typeof assessment.expanded === 'boolean' ? assessment.expanded : true
      };
    });

    module.materials = Array.isArray(module.materials) ? module.materials : [];
    module.materials = module.materials.map(material => ({
      type: materialTypes.includes(material.type) ? material.type : '',
      desc: typeof material.desc === 'string' ? material.desc : '',
      expanded: typeof material.expanded === 'boolean' ? material.expanded : true
    }));

    return module;
  });
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function containsVagueLanguage(value) {
  const normalized = value.trim().toLowerCase();
  return vagueVerbs.some(verb => normalized.includes(verb));
}

function typeSlug(value) {
  return value.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const typeStyleMap = {
  discussion: { color: '#C99076' },
  'quiz-exam': { color: '#D9B27B' },
  'written-assignment': { color: '#B9BE9A' },
  'interactive-activity': { color: '#9FAFC6' },
  other: { color: '#A89EA8' },
  reading: { color: '#D7B292' },
  'lecture-video': { color: '#B9B1CD' },
  'other-video': { color: '#D6A77D' },
  website: { color: '#98A68B' },
  'interactive-object': { color: '#A7B3C6' }
};

function buildCustomDropdown(options, selectedValue, placeholder, onSelect) {
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'custom-select-toggle';
  toggle.setAttribute('aria-haspopup', 'listbox');
  toggle.setAttribute('aria-expanded', 'false');

  const dot = document.createElement('span');
  dot.className = 'custom-select-dot';
  const selectedLabel = document.createElement('span');
  selectedLabel.className = 'custom-select-value';
  selectedLabel.textContent = selectedValue || placeholder;

  if (selectedValue) {
    const style = typeStyleMap[typeSlug(selectedValue)];
    if (style) dot.style.backgroundColor = style.color;
    else dot.style.opacity = '0.3';
  } else {
    dot.style.border = '1px solid rgba(20,20,19,0.12)';
    dot.style.backgroundColor = 'transparent';
  }

  const icon = document.createElement('span');
  icon.className = 'custom-select-icon';
  icon.textContent = '▾';

  toggle.append(dot, selectedLabel, icon);

  const list = document.createElement('ul');
  list.className = 'custom-select-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  options.forEach(option => {
    const item = document.createElement('li');
    item.className = 'custom-select-item';
    item.setAttribute('role', 'option');
    item.tabIndex = 0;
    item.dataset.value = option;

    const itemDot = document.createElement('span');
    itemDot.className = 'custom-option-dot';
    const style = typeStyleMap[typeSlug(option)];
    itemDot.style.backgroundColor = style ? style.color : 'transparent';

    const itemLabel = document.createElement('span');
    itemLabel.textContent = option;

    item.append(itemDot, itemLabel);

    item.addEventListener('click', () => {
      setValue(option);
    });

    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setValue(option);
      }
    });

    list.appendChild(item);
  });

  function closeDropdown() {
    list.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    wrapper.classList.remove('open');
  }

  function openDropdown() {
    list.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    wrapper.classList.add('open');
  }

  function setValue(value) {
    selectedLabel.textContent = value;
    const style = typeStyleMap[typeSlug(value)];
    if (style) {
      dot.style.backgroundColor = style.color;
      dot.style.border = 'none';
    }
    closeDropdown();
    onSelect(value);
  }

  toggle.addEventListener('click', event => {
    event.stopPropagation();
    if (list.hidden) {
      closeAllCustomDropdowns();
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  wrapper.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeDropdown();
      toggle.focus();
    }
  });

  wrapper.closeDropdown = closeDropdown;
  wrapper.setValue = setValue;

  wrapper.append(toggle, list);
  return wrapper;
}

function closeAllCustomDropdowns() {
  document.querySelectorAll('.custom-select.open').forEach(control => {
    control.classList.remove('open');
    const list = control.querySelector('.custom-select-list');
    const toggle = control.querySelector('.custom-select-toggle');
    if (list) list.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
}

function getAlignmentIssues() {
  const issues = [];

  if (state.modules.length === 0) {
    issues.push('Add at least one module.');
  }

  state.modules.forEach((module, moduleIndex) => {
    const moduleNumber = moduleIndex + 1;

    if (!Array.isArray(module.mos) || module.mos.length === 0) {
      issues.push(`Module ${moduleNumber} needs at least one module objective.`);
    }

    module.mos.forEach((mo, moIndex) => {
      const moNumber = `${moduleNumber}.${moIndex + 1}`;
      if (!mo.alignedClos.some(Boolean)) {
        issues.push(`Module ${moduleNumber} MO ${moNumber} must align with at least one CLO.`);
      }
      const alignedToAssessment = module.assessments.some(assessment => assessment.alignedMos[moIndex]);
      if (!alignedToAssessment) {
        issues.push(`Module ${moduleNumber} MO ${moNumber} must align with at least one assessment.`);
      }
    });

    module.assessments.forEach((assessment, assessmentIndex) => {
      const assessmentNumber = assessmentIndex + 1;
      if (!assessment.type) {
        issues.push(`Module ${moduleNumber} assessment ${assessmentNumber} needs a type.`);
      }
      if (!assessment.alignedMos.some(Boolean)) {
        issues.push(`Module ${moduleNumber} assessment ${assessmentNumber} must align with at least one MO.`);
      }
    });
  });

  state.clos.forEach((_, cloIndex) => {
    const cloMatched = state.modules.some(module => module.mos.some(mo => mo.alignedClos[cloIndex]));
    if (!cloMatched) {
      issues.push(`CLO ${cloIndex + 1} is not aligned with any module objective.`);
    }
  });

  return issues;
}

function buildToggleButton(labelText, active) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pill-button';
  if (active) {
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  } else {
    button.setAttribute('aria-pressed', 'false');
  }
  button.textContent = labelText;
  return button;
}

function renderCLOs(alignmentIssues) {
  elements.cloList.innerHTML = '';
  state.clos.forEach((clo, index) => {
    const template = document.getElementById('cloTemplate');
    const node = template.content.cloneNode(true);
    const item = node.querySelector('.clo-item');
    item.dataset.cloIndex = index;
    item.querySelector('.clo-number').textContent = index + 1;

    const input = item.querySelector('.clo-text');
    input.value = clo;
    input.addEventListener('input', event => {
      state.clos[index] = event.target.value;
      syncClosInMos();
      saveState();
    });

    const deleteButton = item.querySelector('.delete-clo');
    deleteButton.disabled = state.clos.length <= 1;
    deleteButton.addEventListener('click', () => {
      if (state.clos.length <= 1) return;
      state.clos.splice(index, 1);
      state.modules.forEach(module => module.mos.forEach(mo => mo.alignedClos.splice(index, 1)));
      saveState();
      render();
    });

    const vagueWarning = item.querySelector('.vague-warning');
    if (clo && containsVagueLanguage(clo)) {
      vagueWarning.textContent = 'This objective may use vague language. Try a stronger Bloom verb.';
      vagueWarning.classList.remove('hidden');
    }

    const unassigned = item.querySelector('.clo-unassigned');
    const cloIssue = alignmentIssues.find(issue => issue.includes(`CLO ${index + 1}`));
    if (cloIssue) {
      unassigned.textContent = 'This CLO is not aligned to any module objective yet.';
      unassigned.classList.remove('hidden');
      item.classList.add('invalid');
    }

    elements.cloList.appendChild(node);
  });
}

function syncClosInMos() {
  state.modules.forEach(module => {
    module.mos.forEach(mo => {
      while (mo.alignedClos.length < state.clos.length) {
        mo.alignedClos.push(false);
      }
      if (mo.alignedClos.length > state.clos.length) {
        mo.alignedClos = mo.alignedClos.slice(0, state.clos.length);
      }
    });
  });
}

function renderModules(alignmentIssues) {
  elements.modulesSection.innerHTML = '';

  if (!Array.isArray(state.modules) || state.modules.length === 0) {
    state.modules = [createDefaultModule()];
  }

  const moduleTemplate = document.getElementById('moduleTemplate');
  if (!moduleTemplate) {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = 'Module template not found.';
    elements.modulesSection.appendChild(errorMessage);
    return;
  }

  state.modules.forEach((module, moduleIndex) => {
    const moduleNode = moduleTemplate.content.cloneNode(true);
    const moduleCard = moduleNode.querySelector('.module-card');
    const moduleIndexLabel = moduleNode.querySelector('.module-index');
    moduleIndexLabel.textContent = moduleIndex + 1;

    const titleInput = moduleNode.querySelector('.module-title-input');
    titleInput.value = module.title;
    titleInput.addEventListener('input', event => {
      state.modules[moduleIndex].title = event.target.value;
      saveState();
    });

    const deleteModuleBtn = moduleNode.querySelector('.delete-module');
    deleteModuleBtn.disabled = state.modules.length <= 1;
    deleteModuleBtn.addEventListener('click', () => {
      if (state.modules.length <= 1) return;
      state.modules.splice(moduleIndex, 1);
      saveState();
      render();
    });

    const moList = moduleNode.querySelector('.mo-list');
    const addMoButton = moduleNode.querySelector('.add-mo');
    addMoButton.addEventListener('click', () => {
      if (state.modules[moduleIndex].mos.length >= 10) return;
      state.modules[moduleIndex].mos.push(createDefaultMO());
      state.modules[moduleIndex].assessments.forEach(assessment => assessment.alignedMos.push(false));
      saveState();
      render();
    });

    module.mos.forEach((mo, moIndex) => {
      const moTemplate = document.getElementById('moTemplate');
      const moNode = moTemplate.content.cloneNode(true);
      const card = moNode.querySelector('.mo-item');
      const toggle = moNode.querySelector('.card-toggle');
      const content = moNode.querySelector('.collapsible-content');
      const summary = moNode.querySelector('.mo-card-summary');
      const moNumber = `${moduleIndex + 1}.${moIndex + 1}`;
      moNode.querySelector('.mo-number').textContent = moNumber;

      card.classList.toggle('collapsed', !mo.expanded);
      if (!mo.expanded) {
        summary.classList.remove('hidden');
        summary.textContent = mo.text ? mo.text : 'Tap to expand';
      }

      toggle.addEventListener('click', () => {
        state.modules[moduleIndex].mos[moIndex].expanded = !state.modules[moduleIndex].mos[moIndex].expanded;
        saveState();
        render();
      });

      const moInput = moNode.querySelector('.mo-text');
      moInput.value = mo.text;
      moInput.addEventListener('input', event => {
        state.modules[moduleIndex].mos[moIndex].text = event.target.value;
        saveState();
      });

      const pillContainer = moNode.querySelector('.mo-clo-pills');
      state.clos.forEach((_, cloIndex) => {
        const pill = buildToggleButton(`CLO ${cloIndex + 1}`, mo.alignedClos[cloIndex]);
        pill.addEventListener('click', () => {
          state.modules[moduleIndex].mos[moIndex].alignedClos[cloIndex] = !state.modules[moduleIndex].mos[moIndex].alignedClos[cloIndex];
          saveState();
          render();
        });
        pillContainer.appendChild(pill);
      });

      const vagueWarning = moNode.querySelector('.vague-warning');
      if (mo.text && containsVagueLanguage(mo.text)) {
        vagueWarning.textContent = 'This objective may use vague language. Try a stronger Bloom verb.';
        vagueWarning.classList.remove('hidden');
      }

      const moUnassigned = moNode.querySelector('.mo-unassigned');
      const moIssue = alignmentIssues.find(issue => issue.includes(`MO ${moNumber}`));
      if (moIssue) {
        moUnassigned.textContent = 'This MO must align with a CLO and at least one assessment.';
        moUnassigned.classList.remove('hidden');
      }

      const deleteMoBtn = moNode.querySelector('.delete-mo');
      deleteMoBtn.addEventListener('click', () => {
        if (state.modules[moduleIndex].mos.length <= 1) return;
        state.modules[moduleIndex].mos.splice(moIndex, 1);
        state.modules[moduleIndex].assessments.forEach(assessment => assessment.alignedMos.splice(moIndex, 1));
        saveState();
        render();
      });

      moList.appendChild(moNode);
    });

    const assessmentList = moduleNode.querySelector('.assessment-list');
    const addAssessmentButton = moduleNode.querySelector('.add-assessment');
    addAssessmentButton.addEventListener('click', () => {
      if (state.modules[moduleIndex].assessments.length >= 10) return;
      state.modules[moduleIndex].assessments.push(createDefaultAssessment(state.modules[moduleIndex].mos.length));
      saveState();
      render();
    });

    module.assessments.forEach((assessment, assessmentIndex) => {
      const assessmentTemplate = document.getElementById('assessmentTemplate');
      const assessmentNode = assessmentTemplate.content.cloneNode(true);
      const assessmentItem = assessmentNode.querySelector('.assessment-item');
      const toggle = assessmentNode.querySelector('.card-toggle');
      const content = assessmentNode.querySelector('.collapsible-content');
      const details = assessmentNode.querySelector('.assessment-details');
      const summary = assessmentNode.querySelector('.assessment-card-summary');
      assessmentItem.classList.add(typeSlug(assessment.type || '')); 

      cardExpandState(assessmentItem, assessment, summary);

      toggle.addEventListener('click', () => {
        state.modules[moduleIndex].assessments[assessmentIndex].expanded = !state.modules[moduleIndex].assessments[assessmentIndex].expanded;
        saveState();
        render();
      });

      const typeSelect = assessmentNode.querySelector('.assessment-type');
      const assessmentDropdown = buildCustomDropdown(assessmentTypes, assessment.type, 'Select a type', selected => {
        state.modules[moduleIndex].assessments[assessmentIndex].type = selected;
        if (!selected) {
          state.modules[moduleIndex].assessments[assessmentIndex].desc = '';
        }
        saveState();
        render();
      });
      typeSelect.replaceWith(assessmentDropdown);

      const descInput = assessmentNode.querySelector('.assessment-desc');
      descInput.value = assessment.desc;

      if (assessment.type) {
        details.classList.remove('hidden');
      }

      descInput.addEventListener('input', event => {
        state.modules[moduleIndex].assessments[assessmentIndex].desc = event.target.value;
        saveState();
      });

      const mosContainer = assessmentNode.querySelector('.mos-pills');
      module.mos.forEach((_, moIndex) => {
        const pill = buildToggleButton(`MO ${moduleIndex + 1}.${moIndex + 1}`, assessment.alignedMos[moIndex]);
        pill.addEventListener('click', () => {
          state.modules[moduleIndex].assessments[assessmentIndex].alignedMos[moIndex] = !state.modules[moduleIndex].assessments[assessmentIndex].alignedMos[moIndex];
          saveState();
          render();
        });
        mosContainer.appendChild(pill);
      });

      const assessmentWarning = assessmentNode.querySelector('.assessment-mos-warning');
      const assessmentIssue = alignmentIssues.find(issue => issue.includes(`assessment ${assessmentIndex + 1}`));
      if (assessmentIssue) {
        assessmentWarning.textContent = 'This assessment must be aligned with at least one MO.';
        assessmentWarning.classList.remove('hidden');
      }

      const deleteAssessmentBtn = assessmentNode.querySelector('.delete-assessment');
      deleteAssessmentBtn.addEventListener('click', () => {
        state.modules[moduleIndex].assessments.splice(assessmentIndex, 1);
        saveState();
        render();
      });

      assessmentList.appendChild(assessmentNode);
    });

    const materialList = moduleNode.querySelector('.material-list');
    const addMaterialButton = moduleNode.querySelector('.add-material');
    addMaterialButton.addEventListener('click', () => {
      if (state.modules[moduleIndex].materials.length >= 10) return;
      state.modules[moduleIndex].materials.push(createDefaultMaterial());
      saveState();
      render();
    });

    module.materials.forEach((material, materialIndex) => {
      const materialTemplate = document.getElementById('materialTemplate');
      const materialNode = materialTemplate.content.cloneNode(true);
      const materialItem = materialNode.querySelector('.material-item');
      const toggle = materialNode.querySelector('.card-toggle');
      const details = materialNode.querySelector('.material-details');
      const summary = materialNode.querySelector('.material-card-summary');
      materialItem.classList.add(typeSlug(material.type || ''));

      cardExpandState(materialItem, material, summary);

      toggle.addEventListener('click', () => {
        state.modules[moduleIndex].materials[materialIndex].expanded = !state.modules[moduleIndex].materials[materialIndex].expanded;
        saveState();
        render();
      });

      const typeSelect = materialNode.querySelector('.material-type');
      const materialDropdown = buildCustomDropdown(materialTypes, material.type, 'Select a type', selected => {
        state.modules[moduleIndex].materials[materialIndex].type = selected;
        if (!selected) {
          state.modules[moduleIndex].materials[materialIndex].desc = '';
        }
        saveState();
        render();
      });
      typeSelect.replaceWith(materialDropdown);

      const descInput = materialNode.querySelector('.material-desc');
      descInput.value = material.desc;

      if (material.type) {
        details.classList.remove('hidden');
      }

      descInput.addEventListener('input', event => {
        state.modules[moduleIndex].materials[materialIndex].desc = event.target.value;
        saveState();
      });

      const deleteMaterialBtn = materialNode.querySelector('.delete-material');
      deleteMaterialBtn.addEventListener('click', () => {
        state.modules[moduleIndex].materials.splice(materialIndex, 1);
        saveState();
        render();
      });

      materialList.appendChild(materialNode);
    });

    elements.modulesSection.appendChild(moduleNode);
  });
}

function cardExpandState(cardItem, itemState, summary) {
  cardItem.classList.toggle('collapsed', !itemState.expanded);
  if (!itemState.expanded) {
    summary.classList.remove('hidden');
    summary.textContent = itemState.type ? `${itemState.type}` : 'Tap to expand';
  }
}

function renderAlignmentSummary(alignmentIssues) {
  elements.alignmentSummary.innerHTML = '';
  if (!alignmentIssues.length) {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.textContent = 'All alignment rules are satisfied. Great work!';
    elements.alignmentSummary.appendChild(item);
    return;
  }
  alignmentIssues.forEach(issue => {
    const item = document.createElement('div');
    item.className = 'notice-item';
    item.textContent = issue;
    elements.alignmentSummary.appendChild(item);
  });
}

function render() {
  elements.courseNumber.value = state.courseNumber;
  elements.courseName.value = state.courseName;
  const issues = getAlignmentIssues();
  renderCLOs(issues);
  renderModules(issues);
  renderAlignmentSummary(issues);
}

function initEventBindings() {
  elements.courseNumber.addEventListener('input', event => {
    state.courseNumber = event.target.value;
    saveState();
  });

  elements.courseName.addEventListener('input', event => {
    state.courseName = event.target.value;
    saveState();
  });

  elements.addCloBtn.addEventListener('click', () => {
    if (state.clos.length >= 10) return;
    state.clos.push('');
    syncClosInMos();
    try { saveState(); } catch (e) { /* ignore storage errors */ }
    render();
  });

  if (elements.addModuleBtn) {
    elements.addModuleBtn.addEventListener('click', () => {
      console.log('addModuleBtn clicked');
      try {
        state.modules.push(createDefaultModule());
        // render first so user sees immediate feedback
        render();
        try { saveState(); } catch (e) { console.warn('saveState failed', e); }
      } catch (err) {
        console.error('Error in addModule handler:', err);
      }
    });
  }

  elements.alignmentCheckBtn.addEventListener('click', () => {
    const issues = getAlignmentIssues();
    if (!issues.length) {
      alert('Great work! All alignment rules are satisfied.');
      return;
    }
    alert(`Alignment issues found:\n\n${issues.join('\n')}`);
  });

  elements.downloadWordBtn.addEventListener('click', createWordDownload);

  document.addEventListener('click', event => {
    if (!event.target.closest('.custom-select')) {
      closeAllCustomDropdowns();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeAllCustomDropdowns();
    }
  });
}

function createWordDownload() {
  const wrapper = document.createElement('div');
  const header = document.createElement('h1');
  header.textContent = 'Course Mapping Report';
  wrapper.appendChild(header);

  const courseInfo = document.createElement('p');
  courseInfo.innerHTML = `<strong>Course Number:</strong> ${state.courseNumber || 'N/A'}<br><strong>Course Name:</strong> ${state.courseName || 'N/A'}`;
  wrapper.appendChild(courseInfo);

  const cloTitle = document.createElement('h2');
  cloTitle.textContent = 'Course Learning Objectives';
  wrapper.appendChild(cloTitle);
  const cloList = document.createElement('ol');
  state.clos.forEach((clo) => {
    const item = document.createElement('li');
    item.textContent = clo || '—';
    cloList.appendChild(item);
  });
  wrapper.appendChild(cloList);

  const modulesTitle = document.createElement('h2');
  modulesTitle.textContent = 'Course Modules';
  wrapper.appendChild(modulesTitle);

  state.modules.forEach((module, moduleIndex) => {
    const moduleHeading = document.createElement('h3');
    moduleHeading.textContent = `Module ${moduleIndex + 1}: ${module.title || 'Untitled Module'}`;
    wrapper.appendChild(moduleHeading);

    const mosHeading = document.createElement('h4');
    mosHeading.textContent = 'Module Objectives';
    wrapper.appendChild(mosHeading);
    const mosList = document.createElement('ol');
    module.mos.forEach((mo, moIndex) => {
      const moItem = document.createElement('li');
      const cloLabels = mo.alignedClos
        .map((aligned, cloIndex) => (aligned ? `CLO ${cloIndex + 1}` : null))
        .filter(Boolean)
        .join(', ');
      moItem.innerHTML = `${mo.text || '—'}<br><em>Aligned CLOs:</em> ${cloLabels || 'None'}`;
      mosList.appendChild(moItem);
    });
    wrapper.appendChild(mosList);

    const assessmentHeading = document.createElement('h4');
    assessmentHeading.textContent = 'Assessments';
    wrapper.appendChild(assessmentHeading);
    const assessmentList = document.createElement('ol');
    module.assessments.forEach((assessment, assessmentIndex) => {
      const item = document.createElement('li');
      const alignedMos = assessment.alignedMos
        .map((aligned, moIndex) => (aligned ? `${moduleIndex + 1}.${moIndex + 1}` : null))
        .filter(Boolean)
        .join(', ');
      item.innerHTML = `<strong>${assessment.type || 'Unspecified'}</strong>: ${assessment.desc || '—'}<br><em>Aligned MOs:</em> ${alignedMos || 'None'}`;
      assessmentList.appendChild(item);
    });
    wrapper.appendChild(assessmentList);

    const materialsHeading = document.createElement('h4');
    materialsHeading.textContent = 'Instructional Materials';
    wrapper.appendChild(materialsHeading);
    const materialsList = document.createElement('ol');
    module.materials.forEach(material => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${material.type || 'Unspecified'}</strong>: ${material.desc || '—'}`;
      materialsList.appendChild(item);
    });
    wrapper.appendChild(materialsList);
  });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Course Mapping Report</title></head><body>${wrapper.innerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${(state.courseNumber || 'course-map').replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function init() {
  loadState();
  initEventBindings();
  render();
}

// Global fallback for environments where event binding fails.
window.__lastAddModule = 0;
window.__fallbackAddModule = function() {
  try {
    const now = Date.now();
    if (now - (window.__lastAddModule || 0) < 500) return; // debounce duplicates
    window.__lastAddModule = now;
    if (!state || !Array.isArray(state.modules)) state.modules = [createDefaultModule()];
    state.modules.push(createDefaultModule());
    try { render(); } catch (e) { console.warn('render failed in fallback', e); }
    try { saveState(); } catch (e) { console.warn('saveState failed in fallback', e); }
  } catch (err) {
    console.error('fallback addModule error', err);
  }
};

init();
