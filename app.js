const optionalSections = [
  {
    id: "ipDetail",
    title: "Intellectual Property And Reuse",
    question: "Add expanded wording on customer-owned outputs, CloudInteract background IP and reusable accelerators.",
    defaultStatus: "include"
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    question: "Add a short clause referring to any separate NDA or master agreement.",
    defaultStatus: "include"
  },
  {
    id: "assurance",
    title: "Assurance And Oversight",
    question: "Add operational assurance, audit logging, human oversight and dashboard expectations.",
    defaultStatus: "include"
  },
  {
    id: "stage2",
    title: "Stage 2 Roadmap",
    question: "Add pilot, productionise and scale roadmap content after the Stage 1 proof.",
    defaultStatus: "optional",
  },
  {
    id: "legalBoilerplate",
    title: "Extended Legal Boilerplate",
    question: "Add governing law, assignment, third-party rights, counterparts, warranty and liability placeholders.",
    defaultStatus: "optional"
  }
];

if (window.location.protocol === "file:") {
  document.body.classList.add("is-file-mode");
}

let coverAssetsReady = false;

const colours = ["#5b2ee6", "#ef0f64", "#f57c00", "#0aa85a", "#6b35d4", "#0877ea", "#0d7eea"];
const icons = ["?", "✎", "⚙", "▥", "✓", "★", "◆"];

const mandatoryContent = [
  { id: "proprietaryNotice", title: "Proprietary Notice", rows: 5 },
  { id: "agreementText", title: "Agreement", rows: 4 },
  { id: "backgroundOverview", title: "Background - Customer Overview", rows: 4 },
  { id: "backgroundRequirements", title: "Background - Customer Requirements", rows: 4 },
  { id: "scopeIncluded", title: "Scope - Included", rows: 7 },
  { id: "scopeExclusions", title: "Scope - Boundaries And Exclusions", rows: 5 },
  { id: "successMeasuresText", title: "Success Metrics", rows: 5 },
  { id: "dependenciesText", title: "Dependencies", rows: 6 },
  { id: "changeControlText", title: "Change Control", rows: 4 },
  { id: "securityText", title: "Data Protection, Security And AI Governance", rows: 4 }
];

const sample = {
  opportunityNumber: "INF001",
  customer: "Informa",
  project: "Knowledge Agent - Stage 1 Prototype",
  subtitle: "Statement of Work",
  supplier: "CloudInteract",
  author: "CloudInteract",
  version: "v0.1",
  versionComment: "First draft",
  price: "£20,000",
  startDate: "2026-08-03",
  duration: 8,
  overview:
    "A focused Stage 1 proof of value to demonstrate that a reasoning agent can resolve real IT software requests end to end through Microsoft Teams, using Informa's AWS account, dev ServiceNow and Confluence knowledge sources.",
  scope: [
    "Select one primary and one backup proof-of-value business process with Informa, centred on discrete automatable IT requests such as software approval.",
    "Investigate Informa's ServiceNow configuration, workflows and existing approval process.",
    "Design, create, test and deploy a self-service reasoning agent for the selected proof-of-value process.",
    "Expose the colleague experience through Microsoft Teams, using Power Platform Approvals where needed.",
    "Hand over the solution to Informa IT with recommended next steps for pilot and production rollout."
  ],
  exclusions: [
    "Production hardening, high-scale rollout and live production ServiceNow write access.",
    "Additional business processes beyond the agreed Stage 1 proof of value.",
    "Unsupported or undocumented ServiceNow API functionality.",
    "Stage 2 pilot, productionise and scale activities, which will be separately scoped."
  ],
  success: [
    "At least 40% autonomous resolution for in-scope requests.",
    "At least 90% correct escalation routing when the agent cannot resolve.",
    "At least 80% retrieval relevance for selected knowledge sources.",
    "Stakeholders can experience the end-to-end Teams journey against a realistic dev environment."
  ],
  dependencies: [
    "Dev ServiceNow instance with REST API access, populated with representative tickets, CMDB and knowledge base data.",
    "Confluence read access to two or three ETS knowledge spaces.",
    "AWS sandbox account for hosting and Bedrock AgentCore enablement.",
    "Teams channel/app access and identity inputs from HR/IdP, which may be mocked if required.",
    "Service Desk SME, technical lead/product owner and timely security/governance decisions."
  ],
  roles: [
    ["CloudInteract", "Build engineers, Teams app, ServiceNow and tooling integration, testing, project management and business analysis."],
    ["AWS PACE", "Prototype architect, Bedrock and AgentCore enablement, architecture reviews, guardrails, sandbox tooling and AWS credits."],
    ["Informa ETS", "Own AWS account, ServiceNow, Confluence, network/security approvals, SMEs, data, decisions and sign-off."]
  ],
  phases: [
    { name: "Discovery", sprint: "Sprint 0", start: 1, weeks: 1, milestone: "Discovery Complete" },
    { name: "Design", sprint: "Sprint 1", start: 2, weeks: 1, milestone: "Design Sign-off" },
    { name: "Core Build", sprint: "Sprint 2", start: 3, weeks: 2, milestone: "Core Build Complete" },
    { name: "Systems Integration", sprint: "Sprint 3", start: 5, weeks: 2, milestone: "Teams / ServiceNow Tested" },
    { name: "UAT", sprint: "Sprint 4", start: 7, weeks: 1, milestone: "UAT Sign-off" },
    { name: "Go Live & Handover", sprint: "Sprint 5", start: 8, weeks: 1, milestone: "POV Playback" },
    { name: "Hypercare", sprint: "Sprint 6", start: 9, weeks: 2, milestone: "Handover Complete" }
  ],
  proprietaryNotice:
    "© Copyright 2026 CloudInteract Holdings All rights reserved. CloudInteract Ltd Registered Office: 4 Parkside Court, Greenhough Road, Lichfield, Staffordshire, United Kingdom, WS13 7FE.\n\nThe information and data contained or referenced in this Statement of Work document constitute confidential information of CloudInteract Holdings or its affiliates or subsidiaries. In consideration of receipt of this document, the recipient agrees to maintain such information in confidence and not to reproduce or otherwise disclose this information without the express permission of CloudInteract.",
  agreementText:
    "This Statement of Work (“SOW”) is entered into between {supplier} Ltd (“Service Provider”), and {customer} (“Client”), pursuant to the applicable agreement between the parties.",
  backgroundOverview:
    "A focused Stage 1 proof of value to demonstrate that a reasoning agent can resolve real IT software requests end to end through Microsoft Teams, using {customer}'s AWS account, dev ServiceNow and Confluence knowledge sources.",
  backgroundRequirements:
    "The Stage 1 objective is to prove that one reasoning agent can give {customer} colleagues a fast and consistent IT resolution experience, and can escalate cleanly to the service desk when autonomous resolution is not appropriate.",
  scopeIncluded:
    "Select one primary and one backup proof-of-value business process with {customer}, centred on discrete automatable IT requests such as software approval.\nInvestigate {customer}'s ServiceNow configuration, workflows and existing approval process.\nDesign, create, test and deploy a self-service reasoning agent for the selected proof-of-value process.\nExpose the colleague experience through Microsoft Teams, using Power Platform Approvals where needed.\nHand over the solution to {customer} IT with recommended next steps for pilot and production rollout.",
  scopeExclusions:
    "Production hardening, high-scale rollout and live production ServiceNow write access.\nAdditional business processes beyond the agreed Stage 1 proof of value.\nUnsupported or undocumented ServiceNow API functionality.\nStage 2 pilot, productionise and scale activities, which will be separately scoped.",
  successMeasuresText:
    "At least 40% autonomous resolution for in-scope requests.\nAt least 90% correct escalation routing when the agent cannot resolve.\nAt least 80% retrieval relevance for selected knowledge sources.\nStakeholders can experience the end-to-end Teams journey against a realistic dev environment.",
  dependenciesText:
    "Dev ServiceNow instance with REST API access, populated with representative tickets, CMDB and knowledge base data.\nConfluence read access to two or three ETS knowledge spaces.\nAWS sandbox account for hosting and Bedrock AgentCore enablement.\nTeams channel/app access and identity inputs from HR/IdP, which may be mocked if required.\nService Desk SME, technical lead/product owner and timely security/governance decisions.",
  changeControlText:
    "Any material change to scope, assumptions, timeline, deliverables, environments, integrations or acceptance criteria will be documented and agreed by both parties before the additional work is performed.",
  securityText:
    "The Stage 1 prototype is expected to run in non-production environments using dev or representative data. Production security review, DPIA support, live ServiceNow write access, SSO hardening, audit requirements and operational support are Stage 2 activities unless expressly added to this SOW.",
  commercialMilestones: []
};

let state = structuredClone(sample);
let sectionState = Object.fromEntries(optionalSections.map((item) => [item.id, item.defaultStatus]));

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value, weekOffset = 0) {
  if (!value) return "TBC";
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + weekOffset * 7);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function bindInputs() {
  [
    "opportunityNumber",
    "customer",
    "project",
    "subtitle",
    "supplier",
    "author",
    "version",
    "versionComment",
    "price",
    "startDate",
    "duration"
  ].forEach((id) => {
    $(`#${id}`).addEventListener("input", () => {
      state[id] = id === "duration" ? Number($(`#${id}`).value) : $(`#${id}`).value;
      renderAll();
    });
  });

  $("#deckUpload").addEventListener("change", (event) => updateFilename(event, "#deckName"));
  $("#sowUpload").addEventListener("change", (event) => updateFilename(event, "#sowName"));

  $("#analyseNotes").addEventListener("click", () => {
    const notes = $("#sourceNotes").value.trim();
    if (notes) {
      applyDeckAnalysis(notes);
    }
    renderAll();
  });

  $("#loadSample").addEventListener("click", () => {
    state = structuredClone(sample);
    syncForm();
    renderAll();
  });

  $("#resetSections").addEventListener("click", () => {
    sectionState = Object.fromEntries(optionalSections.map((item) => [item.id, item.defaultStatus]));
    renderSections();
    renderPreview();
  });

  $("#addPhase").addEventListener("click", () => {
    state.phases.push({ name: "New Phase", sprint: `Sprint ${state.phases.length}`, start: 1, weeks: 1, milestone: "Milestone" });
    renderAll();
  });

  $("#addCommercialMilestone").addEventListener("click", () => {
    state.commercialMilestones.push({ title: "", amount: "" });
    renderAll();
  });

  $("#saveCurrentSow").addEventListener("click", saveCurrentSow);
  $("#refreshSavedSows").addEventListener("click", loadSavedSows);

  $("#printSow").addEventListener("click", () => {
    showPanel("preview");
    window.setTimeout(() => window.print(), 100);
  });

  $("#downloadHtml").addEventListener("click", () => downloadHtml("html"));
  $("#downloadDocx").addEventListener("click", () => exportDocument("docx"));
  $("#downloadPdf").addEventListener("click", () => exportDocument("pdf"));

  $$(".step").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.panel));
  });

  waitForCoverAssets().then(() => {
    coverAssetsReady = true;
    renderPreview();
  });

  loadSavedSows();
}

function waitForCoverAssets() {
  const images = [document.querySelector(".cover-logo-preload")].filter(Boolean);
  return Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

async function updateFilename(event, selector) {
  const file = event.target.files?.[0];
  if (!file) return;
  $(selector).textContent = file.name;
  if (file.type.startsWith("text/") || /\.(txt|md)$/i.test(file.name)) {
    $("#sourceNotes").value = (await file.text()).slice(0, 12000);
    return;
  }

  const body = new FormData();
  body.append("file", file);
  const previous = $("#sourceNotes").placeholder;
  $("#sourceNotes").placeholder = `Extracting ${file.name}...`;
  try {
    const response = await fetch("/api/analyse", { method: "POST", body });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || "Upload analysis failed");
    $("#sourceNotes").value = result.text.slice(0, 16000);
    if (selector === "#deckName") {
      applyDeckAnalysis(result.text, file.name);
      syncForm();
      renderAll();
    }
  } catch (error) {
    $("#sourceNotes").value = `Could not automatically extract ${file.name}.\n\n${error.message}\n\nPaste extracted notes here and click Refresh Draft From Inputs.`;
  } finally {
    $("#sourceNotes").placeholder = previous;
  }
}

function extractLines(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-•\d.)\s]+/, "").trim())
    .filter(Boolean)
    .filter((line) => !/^--- SLIDE \d+ ---$/i.test(line));
}

function inferFromDeck(text, filename = "") {
  const lines = extractLines(text);
  const fileBase = filename.replace(/\.[^.]+$/, "");
  const fileParts = fileBase.split(/\s+-\s+|\s+–\s+/).map((part) => part.trim()).filter(Boolean);
  const opportunityNumber = (filename.match(/\b[A-Z]{2,}\d{2,}\b/i) || text.match(/\b[A-Z]{2,}\d{2,}\b/i) || [state.opportunityNumber])[0];
  const banned = /^(cloudinteract|statement of work|agenda|contents|thank you|confidential)$/i;
  const customer =
    (fileParts.length > 1 ? fileParts[1].replace(/\b(ai|agent|poc|prototype|solution|deck|v\d+)\b.*$/i, "").trim() : "") ||
    lines.find((line) => /^[A-Z][A-Za-z0-9&.' -]{2,40}$/.test(line) && !banned.test(line)) ||
    state.customer;
  const firstTitle = lines.find((line) => line.length > 8 && line.length < 90 && /(agent|poc|prototype|solution|automation|platform|service|workflow|transformation|outbound|inbound|knowledge)/i.test(line));
  const project =
    (fileParts.length > 2 ? fileParts.slice(2).join(" - ") : "") ||
    firstTitle ||
    state.project;
  const useful = lines.filter((line) => line.length > 35 && !/^(agenda|contents|thank)/i.test(line));
  return {
    opportunityNumber,
    customer,
    project: project.replace(/\bv\d+$/i, "").trim(),
    overview: useful.slice(0, 3).join(" "),
    scope: useful.slice(3, 8),
    success: useful.filter((line) => /(success|measure|target|kpi|outcome|reduce|increase|improve|accuracy|resolution|routing)/i.test(line)).slice(0, 5),
    dependencies: useful.filter((line) => /(access|dependency|serviceNow|aws|teams|data|security|sme|approval|environment)/i.test(line)).slice(0, 5)
  };
}

function applyDeckAnalysis(text, filename = "") {
  const draft = inferFromDeck(text, filename);
  state.opportunityNumber = draft.opportunityNumber || state.opportunityNumber;
  state.customer = draft.customer || state.customer;
  state.project = draft.project || state.project;
  if (draft.overview) {
    state.backgroundOverview = draft.overview;
  }
  if (draft.scope.length) {
    state.scopeIncluded = draft.scope.join("\n");
  }
  if (draft.success.length) {
    state.successMeasuresText = draft.success.join("\n");
  }
  if (draft.dependencies.length) {
    state.dependenciesText = draft.dependencies.join("\n");
  }
}

function syncForm() {
  [
    "opportunityNumber",
    "customer",
    "project",
    "subtitle",
    "supplier",
    "author",
    "version",
    "versionComment",
    "price",
    "startDate",
    "duration",
    ...mandatoryContent.map((item) => item.id)
  ].forEach((id) => {
    const input = $(`#${id}`);
    if (input) input.value = state[id];
  });
}

function commercialRows() {
  const rows = (state.commercialMilestones || [])
    .map((row) => ({
      title: String(row.title || "").trim(),
      amount: String(row.amount || "").trim()
    }))
    .filter((row) => row.title || row.amount);
  return rows.length ? rows : [{ title: "TBD", amount: "TBD" }];
}

async function loadSavedSows() {
  const target = $("#savedSows");
  if (!target) return;
  target.innerHTML = `<div class="empty-commercials">Loading saved SOWs...</div>`;
  try {
    const response = await fetch("/api/sows");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not load saved SOWs");
    renderSavedSows(result.items || []);
  } catch (error) {
    target.innerHTML = `<div class="empty-commercials">${escapeHtml(error.message)}</div>`;
  }
}

function renderSavedSows(items) {
  $("#savedSows").innerHTML = items.length
    ? items
        .map(
          (item) => `
            <div class="saved-card">
              <div>
                <strong>${escapeHtml(item.customer || "Untitled client")}</strong>
                <span>${escapeHtml(item.project || "Untitled SOW")}</span>
                <small>${escapeHtml(item.opportunityNumber || "No opportunity number")} · ${escapeHtml(item.updatedAt || "")}</small>
              </div>
              <div class="saved-actions">
                <button class="ghost-button" type="button" data-load-sow="${item.id}">Load</button>
                <button class="ghost-button" type="button" data-delete-sow="${item.id}">Delete</button>
              </div>
            </div>`
        )
        .join("")
    : `<div class="empty-commercials">No saved SOWs yet.</div>`;

  $$("[data-load-sow]").forEach((button) => {
    button.addEventListener("click", () => loadSavedSow(button.dataset.loadSow));
  });
  $$("[data-delete-sow]").forEach((button) => {
    button.addEventListener("click", () => deleteSavedSow(button.dataset.deleteSow));
  });
}

async function saveCurrentSow() {
  const response = await fetch("/api/sows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exportPayload())
  });
  if (!response.ok) {
    alert("Could not save SOW.");
    return;
  }
  await loadSavedSows();
}

async function loadSavedSow(id) {
  const response = await fetch(`/api/sows/${id}`);
  const result = await response.json();
  if (!response.ok || !result.item) {
    alert("Could not load saved SOW.");
    return;
  }
  state = { ...structuredClone(sample), ...result.item.data };
  sectionState = result.item.data.optionalSections || sectionState;
  syncForm();
  renderAll();
  showPanel("preview");
}

async function deleteSavedSow(id) {
  await fetch(`/api/sows/${id}`, { method: "DELETE" });
  await loadSavedSows();
}

function showPanel(id) {
  $$(".panel").forEach((panel) => panel.classList.toggle("is-visible", panel.id === id));
  $$(".step").forEach((button) => button.classList.toggle("is-active", button.dataset.panel === id));
}

function renderSections() {
  $("#sectionList").innerHTML = optionalSections
    .map((item) => {
      const current = sectionState[item.id];
      return `
        <div class="section-card">
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.question)}</p>
          </div>
          <div class="radio-group" role="radiogroup" aria-label="${escapeHtml(item.title)}">
            ${["include", "optional", "exclude"]
              .map(
                (status) => `
                  <label>
                    <input type="radio" name="${item.id}" value="${status}" ${current === status ? "checked" : ""} />
                    ${status[0].toUpperCase() + status.slice(1)}
                  </label>`
              )
              .join("")}
          </div>
        </div>`;
    })
    .join("");

  $$("#sectionList input").forEach((input) => {
    input.addEventListener("change", () => {
      sectionState[input.name] = input.value;
      renderPreview();
    });
  });

  $("#mandatoryEditor").innerHTML = mandatoryContent
    .map(
      (item) => `
        <div class="mandatory-card">
          <div class="mandatory-card-header">
            <label for="${item.id}">${escapeHtml(item.title)}</label>
            <button class="ghost-button improve-button" type="button" data-improve="${item.id}">Improve with AI</button>
          </div>
          <textarea id="${item.id}" rows="${item.rows}">${escapeHtml(state[item.id] || "")}</textarea>
        </div>`
    )
    .join("");

  $$("#mandatoryEditor textarea").forEach((input) => {
    input.addEventListener("input", () => {
      state[input.id] = input.value;
      renderPreview();
    });
  });

  $$("#mandatoryEditor .improve-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.improve;
      const input = $(`#${id}`);
      const original = button.textContent;
      button.textContent = "Improving...";
      button.disabled = true;
      input.value = await improveText(input.value);
      state[id] = input.value;
      button.textContent = original;
      button.disabled = false;
      renderPreview();
    });
  });
}

function renderCommercialEditor() {
  const rows = state.commercialMilestones || [];
  $("#commercialMilestones").innerHTML = rows.length
    ? rows
        .map(
          (row, index) => `
            <div class="commercial-row">
              <label class="field">
                <span>Milestone title</span>
                <input data-commercial="${index}" data-key="title" value="${escapeHtml(row.title || "")}" placeholder="e.g. Contract signature" />
              </label>
              <label class="field">
                <span>Amount</span>
                <input data-commercial="${index}" data-key="amount" value="${escapeHtml(row.amount || "")}" placeholder="e.g. £5,000" />
              </label>
              <button class="ghost-button remove-commercial" type="button" data-remove-commercial="${index}">Remove</button>
            </div>`
        )
        .join("")
    : `<div class="empty-commercials">No commercial milestones added. The SOW will show TBD.</div>`;

  $$("#commercialMilestones input").forEach((input) => {
    input.addEventListener("input", () => {
      const row = state.commercialMilestones[Number(input.dataset.commercial)];
      row[input.dataset.key] = input.value;
      renderPreview();
    });
  });

  $$("#commercialMilestones .remove-commercial").forEach((button) => {
    button.addEventListener("click", () => {
      state.commercialMilestones.splice(Number(button.dataset.removeCommercial), 1);
      renderAll();
    });
  });
}

function tidyText(value) {
  return String(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/\s+/g, " "))
    .join("\n");
}

async function improveText(value) {
  try {
    const response = await fetch("/api/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value })
    });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error || "Improve failed");
    return result.text || tidyText(value);
  } catch {
    return tidyText(value);
  }
}

function renderPhaseEditor() {
  $("#phaseEditor").innerHTML = state.phases
    .map(
      (phase, index) => `
        <div class="phase-row">
          <div class="row-controls">
            <label class="field"><span>Phase</span><input data-phase="${index}" data-key="name" value="${escapeHtml(phase.name)}" /></label>
            <label class="field"><span>Sprint</span><input data-phase="${index}" data-key="sprint" value="${escapeHtml(phase.sprint)}" /></label>
            <label class="field"><span>Start week</span><input data-phase="${index}" data-key="start" type="number" min="1" max="10" value="${phase.start}" /></label>
            <label class="field"><span>Weeks</span><input data-phase="${index}" data-key="weeks" type="number" min="1" max="10" value="${phase.weeks}" /></label>
          </div>
          <label class="field"><span>Milestone</span><input data-phase="${index}" data-key="milestone" value="${escapeHtml(phase.milestone)}" /></label>
        </div>`
    )
    .join("");

  $$("#phaseEditor input").forEach((input) => {
    input.addEventListener("input", () => {
      const phase = state.phases[Number(input.dataset.phase)];
      const key = input.dataset.key;
      phase[key] = ["start", "weeks"].includes(key) ? Math.max(1, Number(input.value)) : input.value;
      renderPlan();
      renderPreview();
    });
  });
}

function renderPlan(target = "#planVisual", compact = false) {
  const weeks = Array.from({ length: 10 }, (_, index) => index + 1);
  const header = `
    <div class="plan-row">
      <div class="plan-cell plan-header">PHASE</div>
      ${weeks.map((week) => `<div class="plan-cell plan-header">WEEK ${week}</div>`).join("")}
    </div>`;

  const rows = state.phases
    .map((phase, index) => {
      const colour = colours[index % colours.length];
      const cells = weeks
        .map((week) => {
          const isStart = week === Number(phase.start);
          const isInRange = week >= phase.start && week < phase.start + phase.weeks;
          if (!isInRange) return `<div class="plan-cell"></div>`;
          if (!isStart) return `<div class="plan-cell"></div>`;
          const span = Math.min(phase.weeks, 11 - phase.start);
          return `<div class="plan-cell"><div class="bar" style="background:${colour}; width: calc(${span * 100}% + ${span - 1}px);">${phase.weeks} ${phase.weeks === 1 ? "week" : "weeks"}</div></div>`;
        })
        .join("");

      return `
        <div class="plan-row">
          <div class="plan-cell phase-label">
            <div class="phase-icon" style="background:${colour}">${icons[index % icons.length]}</div>
            <div>
              <div class="phase-title">${escapeHtml(phase.name)}</div>
              <div class="phase-sprint" style="color:${colour}">${escapeHtml(phase.sprint)}</div>
              <div class="phase-duration">${phase.weeks} ${phase.weeks === 1 ? "Week" : "Weeks"}</div>
            </div>
          </div>
          ${cells}
        </div>`;
    })
    .join("");

  const milestones = state.phases
    .map((phase, index) => {
      const colour = colours[index % colours.length];
      const label = index === 0 ? "Kick-off" : phase.name;
      return `
        <div class="milestone">
          <div class="milestone-icon" style="background:${colour}">${icons[index % icons.length]}</div>
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(phase.milestone)}</span>
        </div>`;
    })
    .join("");

  $(target).innerHTML = `<div class="plan-grid ${compact ? "compact" : ""}">${header}${rows}</div><div class="milestones">${milestones}</div>`;
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => ctx.fillText(item, x, y + index * lineHeight));
}

function generatePoapJpegDataUrl() {
  const canvas = document.createElement("canvas");
  canvas.width = 1800;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  const weeks = Array.from({ length: 10 }, (_, index) => index + 1);
  const left = 24;
  const top = 28;
  const labelWidth = 260;
  const weekWidth = 151;
  const headerHeight = 78;
  const rowHeight = 124;
  const gridWidth = labelWidth + weekWidth * 10;
  const gridHeight = headerHeight + rowHeight * state.phases.length;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#dfe4ea";
  ctx.lineWidth = 2;
  roundRect(ctx, left, top, gridWidth, gridHeight, 18, "#ffffff", "#dfe4ea");

  ctx.font = "800 24px Arial";
  ctx.fillStyle = "#111827";
  ctx.textAlign = "center";
  ctx.fillText("PHASE", left + labelWidth / 2, top + 47);
  weeks.forEach((week, index) => ctx.fillText(`WEEK ${week}`, left + labelWidth + index * weekWidth + weekWidth / 2, top + 47));

  ctx.strokeStyle = "#dfe4ea";
  for (let i = 1; i <= 10; i++) {
    const x = left + labelWidth + i * weekWidth;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + gridHeight);
    ctx.stroke();
  }
  for (let r = 0; r <= state.phases.length; r++) {
    const y = top + headerHeight + r * rowHeight;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + gridWidth, y);
    ctx.stroke();
  }

  ctx.textAlign = "left";
  state.phases.forEach((phase, index) => {
    const colour = colours[index % colours.length];
    const y = top + headerHeight + index * rowHeight;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(left + 52, y + 62, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText(icons[index % icons.length], left + 52, y + 70);
    ctx.textAlign = "left";
    ctx.fillStyle = "#111827";
    ctx.font = "800 24px Arial";
    wrapCanvasText(ctx, phase.name, left + 96, y + 42, 132, 25, 2);
    ctx.fillStyle = colour;
    ctx.font = "800 18px Arial";
    ctx.fillText(phase.sprint, left + 96, y + 82);
    ctx.fillStyle = "#111827";
    ctx.font = "18px Arial";
    ctx.fillText(`${phase.weeks} ${phase.weeks === 1 ? "Week" : "Weeks"}`, left + 96, y + 106);

    const span = Math.min(phase.weeks, 11 - phase.start);
    const barX = left + labelWidth + (phase.start - 1) * weekWidth + 8;
    const barY = y + 42;
    const barW = span * weekWidth - 16;
    roundRect(ctx, barX, barY, barW, 52, 13, colour, null);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${phase.weeks} ${phase.weeks === 1 ? "week" : "weeks"}`, barX + barW / 2, barY + 34);
    ctx.textAlign = "left";
  });

  const milestoneTop = top + gridHeight + 58;
  const milestoneGap = gridWidth / state.phases.length;
  state.phases.forEach((phase, index) => {
    const x = left + index * milestoneGap + milestoneGap / 2;
    const colour = colours[index % colours.length];
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, milestoneTop, 31, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 21px Arial";
    ctx.textAlign = "center";
    ctx.fillText(icons[index % icons.length], x, milestoneTop + 7);
    if (index < state.phases.length - 1) {
      ctx.fillStyle = "#8f98a5";
      ctx.font = "42px Arial";
      ctx.fillText("›", x + milestoneGap / 2, milestoneTop + 13);
    }
    ctx.fillStyle = "#111827";
    ctx.font = "800 18px Arial";
    wrapCanvasText(ctx, index === 0 ? "Kick-off" : phase.name, x - 70, milestoneTop + 62, 140, 20, 2);
    ctx.fillStyle = "#4b5563";
    ctx.font = "17px Arial";
    wrapCanvasText(ctx, phase.milestone, x - 74, milestoneTop + 108, 148, 21, 3);
  });
  return canvas.toDataURL("image/jpeg", 0.92);
}

function generateCoverJpegDataUrl() {
  const canvas = document.createElement("canvas");
  canvas.width = 1284;
  canvas.height = 1800;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
  gradient.addColorStop(0, "#f20b6f");
  gradient.addColorStop(0.55, "#fb5c58");
  gradient.addColorStop(1, "#ff8b3d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const logo = document.querySelector(".cover-logo-preload");
  if (logo?.complete && logo.naturalWidth) {
    ctx.drawImage(logo, 116, 140, 430, 265);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 74px Arial";
    ctx.fillText("Cloud", 300, 265);
    ctx.font = "36px Arial";
    ctx.fillText("Interact", 306, 318);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "92px Arial";
  wrapCanvasText(ctx, coverProjectName(), 28, 960, 900, 118, 4);
  ctx.font = "34px Arial";
  ctx.fillText(state.subtitle || "Statement of Work", 34, 1355);
  return canvas.toDataURL("image/jpeg", 0.94);
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function isIncluded(id) {
  return !Object.prototype.hasOwnProperty.call(sectionState, id) || sectionState[id] === "include";
}

function exportPayload() {
  return {
    ...state,
    optionalSections: sectionState,
    generatedAt: new Date().toISOString()
  };
}

function documentName() {
  const customer = state.customer.trim();
  const project = state.project.trim();
  const prefix = project.toLowerCase().startsWith(customer.toLowerCase()) ? "" : `${customer} - `;
  return `${prefix}${project} - CloudInteract SOW`;
}

function coverProjectName() {
  const customer = state.customer.trim();
  const project = state.project.trim();
  return project.toLowerCase().startsWith(customer.toLowerCase()) ? project : `${customer} - ${project}`;
}

function documentFileBase() {
  return [state.opportunityNumber, state.customer, state.project]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(" - ")
    .replace(/[^\w£]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dynamicText(value) {
  return String(value || "")
    .replaceAll("{customer}", state.customer || "Client")
    .replaceAll("{supplier}", state.supplier || "CloudInteract")
    .replace(/\bInforma\b/g, state.customer || "Client");
}

function lines(value) {
  return dynamicText(value)
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function paragraphs(value) {
  return lines(value).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function bulletList(value) {
  return `<ul>${lines(value).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function tocItems() {
  const items = [
    ["1", "Agreement"],
    ["2", "Background"],
    ["3", "Scope"],
    ["4", "Project Plan"],
    ["5", "Deliverables And Acceptance Criteria"],
    ["6", "Success Metrics"],
    ["7", "Dependencies"],
    ["8", "Change Control"],
    ["9", "Data Protection, Security And AI Governance"]
  ];
  [
    ["ipDetail", "10", "Intellectual Property And Reuse"],
    ["confidentiality", "11", "Confidentiality"],
    ["assurance", "12", "Assurance And Oversight"],
    ["stage2", "13", "Stage 2 Roadmap"],
    ["legalBoilerplate", "14", "Extended Legal Boilerplate"]
  ].forEach(([key, number, title]) => {
    if (isIncluded(key)) items.push([number, title]);
  });
  items.push(["", "Commercials"], ["", "Signature"]);
  return items;
}

function renderPreview() {
  const optional = optionalSections.filter((item) => sectionState[item.id] === "optional");
  const poapImage = generatePoapJpegDataUrl();
  const html = `
    <section class="sow-page cover-page">
      <img class="cover-image" src="${generateCoverJpegDataUrl()}" alt="Statement of Work cover page" />
    </section>

    <section class="sow-page content-page preamble-page">
    <section class="document-details">
      <h2>Document Details</h2>
      <table>
        <tr><th>Client</th><td>${escapeHtml(state.customer)}</td></tr>
        <tr><th>Date Created</th><td>${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</td></tr>
        <tr><th>Document Type</th><td>Statement of Work (SOW)</td></tr>
        <tr><th>Document Name</th><td>${escapeHtml(state.project)}</td></tr>
        <tr><th>Author</th><td>${escapeHtml(state.author || state.supplier || "CloudInteract")}</td></tr>
      </table>
    </section>

    <section class="version-history">
      <h2>Document Revision History</h2>
      <table>
        <tr><th>Version</th><th>Date Modified</th><th>Description</th><th>Modified By</th></tr>
        <tr>
          <td>${escapeHtml(state.version || "v0.1")}</td>
          <td>${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</td>
          <td>${escapeHtml(state.versionComment || "First draft")}</td>
          <td>${escapeHtml(state.author || state.supplier || "CloudInteract")}</td>
        </tr>
      </table>
    </section>

    <section class="sow-front-matter">
      <h2>Proprietary Notice</h2>
      ${paragraphs(state.proprietaryNotice)}
    </section>
    </section>

    <section class="sow-page content-page toc-page">
      <h2>Table of Contents</h2>
      <table class="toc-table">
        ${tocItems()
          .map(([number, title]) => `
            <tr>
              <th>${escapeHtml(number)}</th>
              <td>${escapeHtml(title)}</td>
            </tr>`)
          .join("")}
      </table>
    </section>

    <section class="sow-page content-page">
      <h2>1 Agreement</h2>
      ${paragraphs(state.agreementText)}

      <h2>2 Background</h2>
      <h3>2.1 Customer Overview</h3>
      ${paragraphs(state.backgroundOverview)}
      <h3>2.2 Customer Requirements</h3>
      ${paragraphs(state.backgroundRequirements)}

      <h2>3 Scope</h2>
      <h3>3.1 Included</h3>
      ${bulletList(state.scopeIncluded)}
      <h3>3.2 Boundaries And Exclusions</h3>
      ${bulletList(state.scopeExclusions)}

      <h2>4 Project Plan</h2>
      <h3>4.1 Plan On A Page</h3>
      <p>The plan below is indicative and assumes timely access, data, stakeholder availability and governance decisions.</p>
      <img class="poap-jpeg" src="${poapImage}" alt="Plan on a page timeline" />

      <h2>5 Deliverables And Acceptance Criteria</h2>
      <table class="bordered-table">
        <tr><th>Deliverable</th><th>Acceptance basis</th></tr>
        <tr><td>Working reasoning-agent prototype in ${escapeHtml(dynamicText("{customer}"))} AWS sandbox</td><td>Demonstrated against the selected software-request journey using dev ServiceNow and representative knowledge sources.</td></tr>
        <tr><td>Microsoft Teams colleague experience</td><td>Stakeholders can request software in plain language and receive resolution, approval routing or escalation updates in Teams.</td></tr>
        <tr><td>ServiceNow and knowledge integrations</td><td>Prototype can check entitlement, duplicate requests and route/document work through supported public APIs.</td></tr>
        <tr><td>Handover pack and Stage 2 recommendations</td><td>${escapeHtml(dynamicText("{customer}"))} IT receives architecture notes, run considerations, backlog and recommended pilot/production next steps.</td></tr>
      </table>
      <h2>6 Success Metrics</h2>
      ${bulletList(state.successMeasuresText)}

      <h2>7 Dependencies</h2>
      ${bulletList(state.dependenciesText)}

      <h2>8 Change Control</h2>
      ${paragraphs(state.changeControlText)}

      <h2>9 Data Protection, Security And AI Governance</h2>
      ${paragraphs(state.securityText)}

    ${isIncluded("ipDetail") ? `
      <h2>10 Intellectual Property And Reuse</h2>
      <p>Unless otherwise agreed in signed commercial terms, the customer owns customer-specific outputs and data supplied by the customer. CloudInteract retains ownership of pre-existing tools, methods, know-how, templates and reusable accelerators used to deliver the work.</p>` : ""}

    ${isIncluded("confidentiality") ? `
      <h2>11 Confidentiality</h2>
      <p>Each party will protect confidential information disclosed in connection with this SOW. Where a separate NDA or master agreement exists, that agreement will take precedence over this summary wording.</p>` : ""}

    ${isIncluded("assurance") ? `
      <h2>12 Assurance And Oversight</h2>
      <p>The prototype will include outcome verification, human review for uncertain or failed cases, audit logging for agent decisions and visibility of agreed success metrics. Any standing auto-approval rule must be agreed before use.</p>` : ""}

    ${isIncluded("stage2") ? `
      <h2>13 Stage 2 Roadmap</h2>
      <p>Following Stage 1, the recommended path is a controlled pilot with a friendly cohort, then production hardening, phased rollout by segment, additional channels and expansion into further use cases.</p>` : ""}

    ${isIncluded("legalBoilerplate") ? `
      <h2>14 Extended Legal Boilerplate</h2>
      <p>Final legal terms should confirm warranty, liability, assignment, third-party rights, counterparts, governing law and jurisdiction, either in this SOW or in the governing master services agreement.</p>` : ""}

    <h2>Commercials</h2>
    <table class="bordered-table">
      <tr><th>Milestone</th><th>Amount</th></tr>
      ${commercialRows()
        .map((row) => `<tr><td>${escapeHtml(row.title)}</td><td>${escapeHtml(row.amount)}</td></tr>`)
        .join("")}
    </table>

    <h2>Signature</h2>
    <table class="bordered-table signature-table">
      <tr><th>For ${escapeHtml(state.customer)}</th><th>For ${escapeHtml(state.supplier)}</th></tr>
      <tr><td>Name:<br><br>Title:<br><br>Date:</td><td>Name:<br><br>Title:<br><br>Date:</td></tr>
    </table>
    <footer class="doc-footer">CloudInteract Confidential · ${escapeHtml(state.customer)} · ${escapeHtml(state.project)}</footer>
    </section>
  `;

  $("#sowPreview").innerHTML = html;
}

function downloadHtml() {
  const content = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(state.customer)} SOW</title><link rel="stylesheet" href="styles.css"></head><body><main><article class="sow-document">${$("#sowPreview").innerHTML}</article></main></body></html>`;
  const blob = new Blob([content], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${documentFileBase()}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportDocument(format) {
  const response = await fetch(`/api/export/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exportPayload())
  });
  if (!response.ok) {
    alert(`Could not export ${format.toUpperCase()}.`);
    return;
  }
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${documentFileBase()}.${format}`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderAll() {
  renderSections();
  renderCommercialEditor();
  renderPhaseEditor();
  renderPlan();
  renderPreview();
}

bindInputs();
syncForm();
renderAll();
