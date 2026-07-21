#!/usr/bin/env python3
import cgi
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parent
TEMPLATE_DOCX = Path("/Users/adrianchatto/Downloads/Informa-SOW-draft (4).docx")
COVER_LOGO = ROOT / "gstt-template-assets" / "image1.png"
BRAND_PURPLE = "5B2EE6"
BRAND_BLUE = "0877EA"
BRAND_PINK = "EF0F64"
BRAND_ORANGE = "F57C00"
BRAND_GREEN = "0AA85A"
BRAND_INK = "17202A"
BRAND_LINE = "DFE4EA"
PHASE_COLOURS = [BRAND_PURPLE, BRAND_PINK, BRAND_ORANGE, BRAND_GREEN, "6B35D4", BRAND_BLUE, "0D7EEA"]


def extract_pptx(data):
    ns = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
    output = []
    with ZipFile(BytesIO(data)) as deck:
        slides = sorted(
            [name for name in deck.namelist() if name.startswith("ppt/slides/slide") and name.endswith(".xml")],
            key=lambda name: int(name.rsplit("slide", 1)[1].split(".xml")[0]),
        )
        for index, slide in enumerate(slides, 1):
            root = ET.fromstring(deck.read(slide))
            texts = [node.text.strip() for node in root.findall(".//a:t", ns) if node.text and node.text.strip()]
            if texts:
                output.append(f"--- SLIDE {index} ---\n" + "\n".join(texts))
    return "\n\n".join(output)


def extract_pdf(data):
    try:
        from pypdf import PdfReader
    except Exception:
        return "PDF uploaded. Install pypdf in this Python environment for PDF text extraction."

    reader = PdfReader(BytesIO(data))
    pages = []
    for index, page in enumerate(reader.pages, 1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append(f"--- PAGE {index} ---\n{text.strip()}")
    return "\n\n".join(pages)


def extract_text(filename, data):
    suffix = Path(filename).suffix.lower()
    if suffix == ".pptx":
        return extract_pptx(data)
    if suffix == ".pdf":
        return extract_pdf(data)
    if suffix in {".txt", ".md"}:
        return data.decode("utf-8", errors="replace")
    return f"{filename} uploaded. This prototype extracts .pptx, .pdf, .txt and .md files."


def safe_name(value):
    return re.sub(r"[^A-Za-z0-9]+", "-", value or "Customer").strip("-") or "Customer"


def optional_enabled(data, key):
    return data.get("optionalSections", {}).get(key) == "include"


def document_name(data):
    customer = (data.get("customer") or "").strip()
    project = (data.get("project") or "").strip()
    prefix = "" if project.lower().startswith(customer.lower()) else f"{customer} - "
    return f"{prefix}{project} - CloudInteract SOW"


def cover_project_name(data):
    customer = (data.get("customer") or "").strip()
    project = (data.get("project") or "").strip()
    return project if project.lower().startswith(customer.lower()) else f"{customer} - {project}"


def render_poap_jpeg(phases):
    from PIL import Image, ImageDraw, ImageFont

    width, height = 1800, 1080
    left, top = 24, 28
    label_width, week_width = 260, 151
    header_height, row_height = 78, 124
    grid_width = label_width + week_width * 10
    grid_height = header_height + row_height * len(phases)
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    def font(size, bold=False):
        candidates = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
        for candidate in candidates:
            try:
                return ImageFont.truetype(candidate, size)
            except Exception:
                pass
        return ImageFont.load_default()

    f_header = font(24, True)
    f_phase = font(24, True)
    f_small_bold = font(18, True)
    f_small = font(18)
    f_bar = font(22, True)
    f_mile = font(18, True)
    f_mile_small = font(17)

    def text_center(x, y, text, fill, fnt):
        bbox = draw.textbbox((0, 0), text, font=fnt)
        draw.text((x - (bbox[2] - bbox[0]) / 2, y - (bbox[3] - bbox[1]) / 2), text, fill=fill, font=fnt)

    def wrap_text(text, x, y, max_width, line_height, fnt, fill, max_lines=3, center=False):
        words = str(text).split()
        lines, line = [], ""
        for word in words:
            candidate = f"{line} {word}".strip()
            bbox = draw.textbbox((0, 0), candidate, font=fnt)
            if bbox[2] - bbox[0] > max_width and line:
                lines.append(line)
                line = word
            else:
                line = candidate
        if line:
            lines.append(line)
        for index, item in enumerate(lines[:max_lines]):
            tx = x
            if center:
                bbox = draw.textbbox((0, 0), item, font=fnt)
                tx = x + (max_width - (bbox[2] - bbox[0])) / 2
            draw.text((tx, y + index * line_height), item, fill=fill, font=fnt)

    draw.rounded_rectangle((left, top, left + grid_width, top + grid_height), radius=18, fill="white", outline="#dfe4ea", width=2)
    text_center(left + label_width / 2, top + 40, "PHASE", "#111827", f_header)
    for i in range(10):
        text_center(left + label_width + i * week_width + week_width / 2, top + 40, f"WEEK {i + 1}", "#111827", f_header)
    for i in range(1, 11):
        x = left + label_width + i * week_width
        draw.line((x, top, x, top + grid_height), fill="#dfe4ea", width=2)
    for r in range(len(phases) + 1):
        y = top + header_height + r * row_height
        draw.line((left, y, left + grid_width, y), fill="#dfe4ea", width=2)

    symbols = ["?", "✎", "⚙", "▥", "✓", "★", "◆"]
    for index, phase in enumerate(phases):
        colour = "#" + PHASE_COLOURS[index % len(PHASE_COLOURS)]
        y = top + header_height + index * row_height
        draw.ellipse((left + 20, y + 30, left + 84, y + 94), fill=colour)
        text_center(left + 52, y + 63, symbols[index % len(symbols)], "white", f_bar)
        wrap_text(phase.get("name", ""), left + 96, y + 26, 132, 25, f_phase, "#111827", 2)
        draw.text((left + 96, y + 72), phase.get("sprint", ""), fill=colour, font=f_small_bold)
        draw.text((left + 96, y + 96), f"{phase.get('weeks', '')} Weeks", fill="#111827", font=f_small)

        start = int(phase.get("start", 1))
        duration = int(phase.get("weeks", 1))
        span = min(duration, 11 - start)
        bar_x = left + label_width + (start - 1) * week_width + 8
        bar_y = y + 42
        bar_w = span * week_width - 16
        draw.rounded_rectangle((bar_x, bar_y, bar_x + bar_w, bar_y + 52), radius=13, fill=colour)
        text_center(bar_x + bar_w / 2, bar_y + 27, f"{duration} {'week' if duration == 1 else 'weeks'}", "white", f_bar)

    milestone_top = top + grid_height + 58
    milestone_gap = grid_width / max(len(phases), 1)
    for index, phase in enumerate(phases):
        colour = "#" + PHASE_COLOURS[index % len(PHASE_COLOURS)]
        x = left + index * milestone_gap + milestone_gap / 2
        draw.ellipse((x - 31, milestone_top - 31, x + 31, milestone_top + 31), fill=colour)
        text_center(x, milestone_top + 1, symbols[index % len(symbols)], "white", f_bar)
        if index < len(phases) - 1:
            text_center(x + milestone_gap / 2, milestone_top + 2, "›", "#8f98a5", font(42))
        wrap_text("Kick-off" if index == 0 else phase.get("name", ""), x - 70, milestone_top + 48, 140, 20, f_mile, "#111827", 2, center=True)
        wrap_text(phase.get("milestone", ""), x - 74, milestone_top + 94, 148, 21, f_mile_small, "#4b5563", 3, center=True)

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=92)
    return buffer.getvalue()


def render_cover_jpeg(data):
    from PIL import Image, ImageDraw, ImageFont

    width, height = 1284, 1800
    image = Image.new("RGB", (width, height), "#5B2EE6")
    draw = ImageDraw.Draw(image, "RGBA")

    def font(size, bold=False, serif=False):
        candidates = [
            "/System/Library/Fonts/Supplemental/Times New Roman.ttf" if serif else None,
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
        for candidate in [item for item in candidates if item]:
            try:
                return ImageFont.truetype(candidate, size)
            except Exception:
                pass
        return ImageFont.load_default()

    for y in range(height):
        t = y / max(height - 1, 1)
        if t < 0.46:
            local = t / 0.46
            start, end = (91, 46, 230), (239, 15, 100)
        else:
            local = (t - 0.46) / 0.54
            start, end = (239, 15, 100), (8, 119, 234)
        colour = tuple(int(start[i] + (end[i] - start[i]) * local) for i in range(3))
        draw.line((0, y, width, y), fill=colour)

    for i in range(16):
        x = 110 + i * 86
        y = 280 + int(__import__("math").sin(i) * 70)
        radius = 180 + (i % 4) * 35
        fill = (255, 255, 255, 42) if i % 2 else (17, 24, 39, 42)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)

    if COVER_LOGO.exists():
        logo = Image.open(COVER_LOGO).convert("RGBA")
        logo.thumbnail((285, 176), Image.LANCZOS)
        image.paste(logo, (112, 112), logo)
    else:
        draw.text((112, 138), "Cloud", fill="white", font=font(54, True))
        draw.text((116, 204), "Interact", fill="white", font=font(24))

    def wrap(text, x, y, max_width, line_height, fnt, fill, max_lines=5):
        words = str(text).split()
        lines, line = [], ""
        for word in words:
            candidate = f"{line} {word}".strip()
            bbox = draw.textbbox((0, 0), candidate, font=fnt)
            if bbox[2] - bbox[0] > max_width and line:
                lines.append(line)
                line = word
            else:
                line = candidate
        if line:
            lines.append(line)
        for index, item in enumerate(lines[:max_lines]):
            draw.text((x, y + index * line_height), item, fill=fill, font=fnt)

    draw.text((112, 648), "Statement of Work", fill="white", font=font(86, True))
    wrap(cover_project_name(data), 116, 840, 940, 68, font(54, serif=True), "white")
    draw.text((116, 1462), data.get("customer") or "Client", fill="white", font=font(28, True))
    draw.text((116, 1518), "21 Jul 2026", fill="white", font=font(24))
    draw.text((116, 1566), data.get("supplier") or "CloudInteract", fill="white", font=font(24))

    buffer = BytesIO()
    image.save(buffer, format="JPEG", quality=94)
    return buffer.getvalue()


def section_blocks(data):
    blocks = [
        ("Agreement", [
            ("p", f"This Statement of Work (“SOW”) is entered into between {data.get('supplier', 'CloudInteract')} Ltd (“Service Provider”), and {data.get('customer', '')} (“Client”), pursuant to the applicable agreement between the parties.")
        ]),
        ("Background", [
            ("h3", "Customer Overview"),
            ("p", data.get("overview", "")),
            ("h3", "Customer Requirements"),
            ("p", "The Stage 1 objective is to prove that one reasoning agent can give Informa colleagues a fast and consistent IT resolution experience, and can escalate cleanly to the service desk when autonomous resolution is not appropriate."),
        ]),
        ("Scope", [
            ("h3", "Included"),
            ("ul", data.get("scope", [])),
            ("h3", "Boundaries And Exclusions"),
            ("ul", data.get("exclusions", [])),
        ]),
        ("Deliverables And Acceptance Criteria", [
            ("table", [
                ["Deliverable", "Acceptance basis"],
                ["Working reasoning-agent prototype in Informa AWS sandbox", "Demonstrated against the selected software-request journey using dev ServiceNow and representative knowledge sources."],
                ["Microsoft Teams colleague experience", "Stakeholders can request software in plain language and receive resolution, approval routing or escalation updates in Teams."],
                ["ServiceNow and knowledge integrations", "Prototype can check entitlement, duplicate requests and route/document work through supported public APIs."],
                ["Handover pack and Stage 2 recommendations", "Informa IT receives architecture notes, run considerations, backlog and recommended pilot/production next steps."],
            ]),
            ("h3", "Success Measures"),
            ("ul", data.get("success", [])),
        ]),
        ("Plan On A Page", [("poap", data.get("phases", []))]),
        ("Roles And Responsibilities", [("table", [["Party", "Responsibilities"]] + data.get("roles", []))]),
        ("Dependencies", [
            ("ul", data.get("dependencies", [])),
            ("h3", "Open Questions To Confirm"),
            ("ul", data.get("openQuestions", [])),
        ]),
        ("Commercials", [("table", [
            ["Fixed price", f"{data.get('price', '')} for Stage 1 proof of value only."],
            ["Payment profile", "25% on start and 75% on delivery, subject to commercial review."],
            ["Resource profile", "Technical architect/engineer, project management and business analysis."],
        ])]),
        ("Change Control", [("p", "Any material change to scope, assumptions, timeline, deliverables, environments, integrations or acceptance criteria will be documented and agreed by both parties before the additional work is performed.")]),
        ("Data Protection, Security And AI Governance", [("p", "The Stage 1 prototype is expected to run in non-production environments using dev or representative data. Production security review, DPIA support, live ServiceNow write access, SSO hardening, audit requirements and operational support are Stage 2 activities unless expressly added to this SOW.")]),
    ]
    optional = [
        ("ipDetail", "Intellectual Property And Reuse", "Unless otherwise agreed in signed commercial terms, the customer owns customer-specific outputs and data supplied by the customer. CloudInteract retains ownership of pre-existing tools, methods, know-how, templates and reusable accelerators used to deliver the work."),
        ("confidentiality", "Confidentiality", "Each party will protect confidential information disclosed in connection with this SOW. Where a separate NDA or master agreement exists, that agreement will take precedence over this summary wording."),
        ("assurance", "Assurance And Oversight", "The prototype will include outcome verification, human review for uncertain or failed cases, audit logging for agent decisions and visibility of agreed success metrics. Any standing auto-approval rule must be agreed before use."),
        ("stage2", "Stage 2 Roadmap", "Following Stage 1, the recommended path is a controlled pilot with a friendly cohort, then production hardening, phased rollout by segment, additional channels and expansion into further use cases."),
        ("legalBoilerplate", "Extended Legal Boilerplate", "Final legal terms should confirm warranty, liability, assignment, third-party rights, counterparts, governing law and jurisdiction, either in this SOW or in the governing master services agreement."),
    ]
    for key, title, text in optional:
        if optional_enabled(data, key):
            blocks.append((title, [("p", text)]))
    blocks.append(("Signature", [("table", [[f"For {data.get('customer', '')}", f"For {data.get('supplier', '')}"], ["Name:\n\nTitle:\n\nDate:", "Name:\n\nTitle:\n\nDate:"]])]))
    return blocks


def build_docx(data):
    from docx import Document
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.shared import Inches, Pt, RGBColor

    doc = Document(str(TEMPLATE_DOCX)) if TEMPLATE_DOCX.exists() else Document()
    body = doc._body._element
    for child in list(body)[:-1]:
        body.remove(child)

    section = doc.sections[0]
    section.top_margin = Inches(0.7)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.7)
    section.right_margin = Inches(0.7)

    styles = doc.styles
    if "Normal" in [style.name for style in styles]:
        styles["Normal"].font.name = "Arial"
        styles["Normal"].font.size = Pt(10)
    for style_name, size in [("Heading 1", 17), ("Heading 2", 13), ("Heading 3", 11)]:
        if style_name not in [style.name for style in styles]:
            continue
        style = styles[style_name]
        style.font.name = "Arial"
        style.font.bold = True
        style.font.color.rgb = RGBColor(23, 32, 42)
        style.font.size = Pt(size)

    def shade(cell, fill):
        tc_pr = cell._tc.get_or_add_tcPr()
        shd = OxmlElement("w:shd")
        shd.set(qn("w:fill"), fill)
        tc_pr.append(shd)

    def remove_table_borders(table):
        tbl_pr = table._tbl.tblPr
        borders = tbl_pr.first_child_found_in("w:tblBorders")
        if borders is None:
            borders = OxmlElement("w:tblBorders")
            tbl_pr.append(borders)
        for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
            tag = f"w:{edge}"
            element = borders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                borders.append(element)
            element.set(qn("w:val"), "nil")

    def format_table(table):
        remove_table_borders(table)
        table.alignment = WD_TABLE_ALIGNMENT.LEFT

    doc.add_picture(BytesIO(render_cover_jpeg(data)), width=Inches(7.05))

    doc.add_page_break()
    doc.add_heading("Proprietary Notice", level=1)
    doc.add_paragraph("© Copyright 2026 CloudInteract Holdings All rights reserved. CloudInteract Ltd Registered Office: 4 Parkside Court, Greenhough Road, Lichfield, Staffordshire, United Kingdom, WS13 7FE.")
    doc.add_paragraph("The information and data contained or referenced in this Statement of Work document constitute confidential information of CloudInteract Holdings or its affiliates or subsidiaries.")

    for idx, (title, items) in enumerate(section_blocks(data), 1):
        doc.add_heading(title, level=1)
        for kind, value in items:
            if kind == "p":
                doc.add_paragraph(value)
            elif kind == "h3":
                doc.add_heading(value, level=3)
            elif kind == "ul":
                for item in value:
                    doc.add_paragraph(str(item), style="List Paragraph")
            elif kind == "table":
                if not value:
                    continue
                table = doc.add_table(rows=len(value), cols=max(len(row) for row in value))
                format_table(table)
                for r, row in enumerate(value):
                    for c, cell_value in enumerate(row):
                        cell = table.cell(r, c)
                        cell.text = str(cell_value)
                        if r == 0:
                            for paragraph in cell.paragraphs:
                                for run in paragraph.runs:
                                    run.bold = True
            elif kind == "poap":
                image_bytes = render_poap_jpeg(value)
                doc.add_picture(BytesIO(image_bytes), width=Inches(7.0))

    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


def add_docx_plan(doc, phases, shade):
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.shared import Inches

    weeks = list(range(1, 11))
    table = doc.add_table(rows=len(phases) + 1, cols=11)
    try:
        table.style = "Table Grid"
    except KeyError:
        pass
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    table.cell(0, 0).text = "Phase"
    shade(table.cell(0, 0), "F6F8FB")
    for i, week in enumerate(weeks, 1):
        table.cell(0, i).text = f"W{week}"
        shade(table.cell(0, i), "F6F8FB")
    for r, phase in enumerate(phases, 1):
        table.cell(r, 0).text = f"{phase.get('name', '')}\n{phase.get('sprint', '')}\n{phase.get('weeks', '')} weeks"
        colour = PHASE_COLOURS[(r - 1) % len(PHASE_COLOURS)]
        start = int(phase.get("start", 1))
        duration = int(phase.get("weeks", 1))
        for week in weeks:
            cell = table.cell(r, week)
            if start <= week < start + duration:
                cell.text = f"{duration} week" + ("" if duration == 1 else "s") if week == start else ""
                shade(cell, colour)
            else:
                cell.text = ""
    doc.add_paragraph("Milestones: " + " | ".join([f"{p.get('name', '')}: {p.get('milestone', '')}" for p in phases]))


def build_pdf(data):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import Image, PageBreak, SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=14 * mm, leftMargin=14 * mm, topMargin=14 * mm, bottomMargin=14 * mm)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Brand", parent=styles["Normal"], textColor=colors.HexColor("#5B2EE6"), fontName="Helvetica-Bold", fontSize=14, spaceAfter=14))
    styles.add(ParagraphStyle(name="Small", parent=styles["Normal"], fontSize=8, leading=10))
    story = [
        Image(BytesIO(render_cover_jpeg(data)), width=182 * mm, height=255 * mm),
        PageBreak(),
    ]
    story.append(Paragraph("Proprietary Notice", styles["Heading2"]))
    story.append(Paragraph("© Copyright 2026 CloudInteract Holdings All rights reserved. CloudInteract Ltd Registered Office: 4 Parkside Court, Greenhough Road, Lichfield, Staffordshire, United Kingdom, WS13 7FE.", styles["BodyText"]))
    story.append(Paragraph("The information and data contained or referenced in this Statement of Work document constitute confidential information of CloudInteract Holdings or its affiliates or subsidiaries.", styles["BodyText"]))

    for title, items in section_blocks(data):
        story.append(Spacer(1, 8))
        story.append(Paragraph(title, styles["Heading2"]))
        for kind, value in items:
            if kind == "p":
                story.append(Paragraph(value, styles["BodyText"]))
            elif kind == "h3":
                story.append(Paragraph(value, styles["Heading3"]))
            elif kind == "ul":
                for item in value:
                    story.append(Paragraph(str(item), styles["Bullet"]))
            elif kind == "table":
                story.append(make_pdf_table(value, None))
            elif kind == "poap":
                poap = Image(BytesIO(render_poap_jpeg(value)), width=180 * mm, height=108 * mm)
                story.append(poap)

    doc.build(story, onFirstPage=lambda canvas, doc: None, onLaterPages=pdf_footer)
    return buffer.getvalue()


def make_pdf_table(rows, widths):
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import Table, TableStyle

    if not widths:
        column_count = max(len(row) for row in rows)
        widths = [170 * mm / column_count] * column_count
    table = Table(rows, colWidths=widths, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#EEF1F5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("LEADING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def make_pdf_plan(phases):
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import Table, TableStyle

    rows = [["Phase"] + [f"W{i}" for i in range(1, 11)]]
    styles = [
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#DFE4EA")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F6F8FB")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 6.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for r, phase in enumerate(phases, 1):
        duration = int(phase.get("weeks", 1))
        start = int(phase.get("start", 1))
        rows.append([f"{phase.get('name', '')}\n{phase.get('sprint', '')}"] + [""] * 10)
        colour = colors.HexColor("#" + PHASE_COLOURS[(r - 1) % len(PHASE_COLOURS)])
        for week in range(start, min(11, start + duration)):
            rows[r][week] = f"{duration}w" if week == start else ""
            styles.append(("BACKGROUND", (week, r), (week, r), colour))
            styles.append(("TEXTCOLOR", (week, r), (week, r), colors.white))
    table = Table(rows, colWidths=[35 * mm] + [13.5 * mm] * 10, rowHeights=[8 * mm] + [12 * mm] * len(phases), hAlign="LEFT")
    table.setStyle(TableStyle(styles))
    return table


def pdf_footer(canvas, doc):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm

    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor("#5B2EE6"))
    canvas.setLineWidth(1)
    canvas.line(14 * mm, 282 * mm, 196 * mm, 282 * mm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#687385"))
    canvas.drawString(14 * mm, 8 * mm, "CloudInteract Confidential")
    canvas.drawRightString(196 * mm, 8 * mm, f"Page {doc.page}")
    canvas.restoreState()


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        parsed = urlparse(path).path.lstrip("/")
        return str((ROOT / parsed).resolve())

    def do_POST(self):
        if self.path.startswith("/api/export/"):
            self.handle_export()
            return

        if self.path != "/api/analyse":
            self.send_error(404)
            return

        form = cgi.FieldStorage(fp=self.rfile, headers=self.headers, environ={"REQUEST_METHOD": "POST"})
        file_item = form["file"] if "file" in form else None
        if file_item is None or not getattr(file_item, "filename", ""):
            self.send_error(400, "Missing file")
            return

        data = file_item.file.read()
        try:
            text = extract_text(file_item.filename, data)
            payload = {"filename": file_item.filename, "text": text}
            self.send_response(200)
        except Exception as exc:
            payload = {"filename": file_item.filename, "error": str(exc)}
            self.send_response(500)

        body = json.dumps(payload).encode("utf-8")
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_export(self):
        format_name = self.path.rsplit("/", 1)[-1]
        length = int(self.headers.get("Content-Length", "0"))
        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            if format_name == "docx":
                body = build_docx(data)
                content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                extension = "docx"
            elif format_name == "pdf":
                body = build_pdf(data)
                content_type = "application/pdf"
                extension = "pdf"
            else:
                self.send_error(404)
                return
        except Exception as exc:
            payload = json.dumps({"error": str(exc)}).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        filename = f"{safe_name(data.get('customer', 'Customer'))}-SOW-draft.{extension}"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 5173), Handler)
    print("SOW Builder running at http://127.0.0.1:5173")
    server.serve_forever()
