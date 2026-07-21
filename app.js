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

const sample = {
  customer: "Informa",
  project: "Knowledge Agent - Stage 1 Prototype",
  supplier: "CloudInteract",
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
  openQuestions: [
    "Should ServiceNow's native approval workflow own approvals, or should the AWS agent orchestrate them?",
    "Should ServiceNow raise the documenting ticket, or should the agent create it while ServiceNow remains the system of record?",
    "Which legal boilerplate is already covered by CloudInteract's standard MSA and therefore should not be repeated in every SOW?"
  ]
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
  ["customer", "project", "supplier", "price", "startDate", "duration"].forEach((id) => {
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
      state.overview = notes.split(/\n+/).slice(0, 3).join(" ");
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
}

function waitForCoverAssets() {
  const images = [document.querySelector(".cover-art-preload")].filter(Boolean);
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
  } catch (error) {
    $("#sourceNotes").value = `Could not automatically extract ${file.name}.\n\n${error.message}\n\nPaste extracted notes here and click Refresh Draft From Inputs.`;
  } finally {
    $("#sourceNotes").placeholder = previous;
  }
}

function syncForm() {
  ["customer", "project", "supplier", "price", "startDate", "duration"].forEach((id) => {
    $(`#${id}`).value = state[id];
  });
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
  return "gstt-template-assets/image2.png";
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

function renderPreview() {
  const optional = optionalSections.filter((item) => sectionState[item.id] === "optional");
  const poapImage = generatePoapJpegDataUrl();
  const html = `
    <section class="sow-page cover-page template-cover">
      <div class="cover-hero">
        <img src="${generateCoverJpegDataUrl()}" alt="" />
        <div class="cover-brand">Cloud<br /><span>Interact</span></div>
        <h1>${escapeHtml(coverProjectName())}</h1>
      </div>
      <div class="cover-meta">
        <h2>Document Revision History</h2>
        <table class="cover-details">
          <tbody>
            <tr><th>Client</th><td>${escapeHtml(state.customer)}</td></tr>
            <tr><th>Date Created</th><td>${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</td></tr>
            <tr><th>Document Type</th><td>Statement of Work (SOW)</td></tr>
            <tr><th>Document Name</th><td>${escapeHtml(documentName())}</td></tr>
            <tr><th>Author</th><td>${escapeHtml(state.supplier || "CloudInteract")}</td></tr>
          </tbody>
        </table>
        <table class="cover-revisions">
          <thead>
            <tr><th>Version</th><th>Date Modified</th><th>Description</th><th>Modified By</th></tr>
          </thead>
          <tbody>
            <tr><td>v0.1</td><td>${escapeHtml(formatDate(new Date().toISOString().slice(0, 10)))}</td><td>First draft</td><td>${escapeHtml(state.supplier || "CloudInteract")}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="sow-page content-page">
    <section class="sow-front-matter">
      <h2>Proprietary Notice</h2>
      <p>© Copyright 2026 CloudInteract Holdings. All rights reserved. CloudInteract Ltd Registered Office: 4 Parkside Court, Greenhough Road, Lichfield, Staffordshire, United Kingdom, WS13 7FE.</p>
      <p>The information contained in this Statement of Work is confidential to CloudInteract and the recipient. It must not be reproduced or disclosed except in connection with review and performance of this SOW.</p>
    </section>

      <h2>Agreement</h2>
      <p>This Statement of Work (“SOW”) is entered into between ${escapeHtml(state.supplier)} Ltd (“Service Provider”), and ${escapeHtml(state.customer)} (“Client”), pursuant to the applicable agreement between the parties.</p>

      <h2>Background</h2>
      <h3>Customer Overview</h3>
      <p>${escapeHtml(state.overview)}</p>
      <h3>Customer Requirements</h3>
      <p>The Stage 1 objective is to prove that one reasoning agent can give Informa colleagues a fast and consistent IT resolution experience, and can escalate cleanly to the service desk when autonomous resolution is not appropriate.</p>

      <h2>Scope</h2>
      <h3>Included</h3>
      <ul>${state.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <h3>Boundaries And Exclusions</h3>
      <ul>${state.exclusions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>

      <h2>Project Plan</h2>
      <h3>Plan On A Page</h3>
      <p>The plan below is indicative and assumes timely access, data, stakeholder availability and governance decisions.</p>
      <img class="poap-jpeg" src="${poapImage}" alt="Plan on a page timeline" />

      <h2>Workstreams And Deliverables</h2>
      <table>
        <tr><th>Deliverable</th><th>Acceptance basis</th></tr>
        <tr><td>Working reasoning-agent prototype in Informa AWS sandbox</td><td>Demonstrated against the selected software-request journey using dev ServiceNow and representative knowledge sources.</td></tr>
        <tr><td>Microsoft Teams colleague experience</td><td>Stakeholders can request software in plain language and receive resolution, approval routing or escalation updates in Teams.</td></tr>
        <tr><td>ServiceNow and knowledge integrations</td><td>Prototype can check entitlement, duplicate requests and route/document work through supported public APIs.</td></tr>
        <tr><td>Handover pack and Stage 2 recommendations</td><td>Informa IT receives architecture notes, run considerations, backlog and recommended pilot/production next steps.</td></tr>
      </table>
      <h3>Success Measures</h3>
      <ul>${state.success.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>

      <h2>Roles And Responsibilities</h2>
      <table>
        <tr><th>Party</th><th>Responsibilities</th></tr>
        ${state.roles.map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td></tr>`).join("")}
      </table>

      <h2>Dependencies</h2>
      <ul>${state.dependencies.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <h3>Open Questions To Confirm</h3>
      <ul>${state.openQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>

      <h2>Commercials</h2>
      <table>
        <tr><th>Fixed price</th><td>${escapeHtml(state.price)} for Stage 1 proof of value only.</td></tr>
        <tr><th>Payment profile</th><td>25% on start and 75% on delivery, subject to commercial review.</td></tr>
        <tr><th>Resource profile</th><td>Technical architect/engineer, project management and business analysis.</td></tr>
      </table>

      <h2>Change Control</h2>
      <p>Any material change to scope, assumptions, timeline, deliverables, environments, integrations or acceptance criteria will be documented and agreed by both parties before the additional work is performed.</p>

      <h2>Data Protection, Security And AI Governance</h2>
      <p>The Stage 1 prototype is expected to run in non-production environments using dev or representative data. Production security review, DPIA support, live ServiceNow write access, SSO hardening, audit requirements and operational support are Stage 2 activities unless expressly added to this SOW.</p>

    ${isIncluded("ipDetail") ? `
      <h2>11. Intellectual Property And Reuse</h2>
      <p>Unless otherwise agreed in signed commercial terms, the customer owns customer-specific outputs and data supplied by the customer. CloudInteract retains ownership of pre-existing tools, methods, know-how, templates and reusable accelerators used to deliver the work.</p>` : ""}

    ${isIncluded("confidentiality") ? `
      <h2>12. Confidentiality</h2>
      <p>Each party will protect confidential information disclosed in connection with this SOW. Where a separate NDA or master agreement exists, that agreement will take precedence over this summary wording.</p>` : ""}

    ${isIncluded("assurance") ? `
      <h2>13. Assurance And Oversight</h2>
      <p>The prototype will include outcome verification, human review for uncertain or failed cases, audit logging for agent decisions and visibility of agreed success metrics. Any standing auto-approval rule must be agreed before use.</p>` : ""}

    ${isIncluded("stage2") ? `
      <h2>14. Stage 2 Roadmap</h2>
      <p>Following Stage 1, the recommended path is a controlled pilot with a friendly cohort, then production hardening, phased rollout by segment, additional channels and expansion into further use cases.</p>` : ""}

    ${isIncluded("legalBoilerplate") ? `
      <h2>15. Extended Legal Boilerplate</h2>
      <p>Final legal terms should confirm warranty, liability, assignment, third-party rights, counterparts, governing law and jurisdiction, either in this SOW or in the governing master services agreement.</p>` : ""}

    ${optional.length ? `
      <h2>Items To Confirm Before Finalising</h2>
      <ul>${optional.map((item) => `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.question)}</li>`).join("")}</ul>` : ""}

    <h2>Signature</h2>
    <table>
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
  link.download = `${state.customer.replaceAll(/\W+/g, "-")}-SOW-draft.html`;
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
  link.download = `${state.customer.replaceAll(/\W+/g, "-")}-SOW-draft.${format}`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderAll() {
  renderSections();
  renderPhaseEditor();
  renderPlan();
  renderPreview();
}

bindInputs();
syncForm();
renderAll();
