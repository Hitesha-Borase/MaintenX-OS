import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = docx.Document()
    
    # Page setup - 0.75 inch margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Styles
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Segoe UI'
    style_normal.font.size = Pt(10)
    style_normal.font.color.rgb = RGBColor(0x26, 0x16, 0x03)

    # Document Header Badge
    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_badge = p_badge.add_run("MAINTENX OS · MANUFACTURING OPERATIONS SAAS")
    run_badge.font.size = Pt(8.5)
    run_badge.font.bold = True
    run_badge.font.color.rgb = RGBColor(0xB2, 0x7E, 0x33)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("End-to-End Operational Workflow &\nClient Manual Testing Guide")
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x26, 0x16, 0x03)

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("A Complete Step-by-Step User Acceptance Testing (UAT) & Data Flow Manual")
    run_sub.font.size = Pt(11)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(0x6B, 0x5B, 0x4E)

    doc.add_paragraph()

    # Callout Box: Purpose
    table_purpose = doc.add_table(rows=1, cols=1)
    table_purpose.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_p = table_purpose.cell(0, 0)
    set_cell_background(cell_p, "FAF6F0")
    set_cell_margins(cell_p, top=140, bottom=140, left=200, right=200)
    
    cp_par = cell_p.paragraphs[0]
    r_p_bold = cp_par.add_run("🌟 Purpose of this Document: ")
    r_p_bold.bold = True
    r_p_bold.font.color.rgb = RGBColor(0xB2, 0x7E, 0x33)
    r_p_text = cp_par.add_run(
        "This manual details the exact numerical step-by-step workflow to test MaintenX OS. "
        "It specifies which dashboard to open first, which sidebar menu to access, what sample data to enter, "
        "and where that data automatically flows across connected factory modules (MES, CMMS, WMS, QMS, APS, and Executive Analytics)."
    )
    r_p_text.font.size = Pt(9.5)

    doc.add_paragraph()

    # Section 1: Fast Role Switching
    h1 = doc.add_heading(level=1)
    r_h1 = h1.add_run("1. Quick Role Perspective Switching (How to Test)")
    r_h1.font.color.rgb = RGBColor(0x26, 0x16, 0x03)
    r_h1.font.size = Pt(14)
    r_h1.font.bold = True

    p_switch = doc.add_paragraph()
    p_switch.add_run(
        "MaintenX OS features an instant role switcher so testers and clients can simulate every factory department without repeatedly logging out:\n"
        "• Top-Right Avatar: Click the circular user avatar icon located at the top-right corner of the application.\n"
        "• Switch Role Perspective: Scroll down in the dropdown menu to select any persona.\n"
        "• 1-Click Simulation: The application immediately reconfigures navigation, permissions, and dashboards to that role."
    )

    # Personas Table
    personas = [
        ("Step #", "Role Name", "Persona Name", "Default Login Email", "Starting Route", "Department / Responsibility"),
        ("0", "Master Admin", "Elena Vance", "master@maintenx.com", "/master/dashboard", "Multi-Tenant Platform & Billing"),
        ("1", "System Admin", "Alexander Vance", "admin@maintenx.com", "/admin/console", "System Config & Role Setup"),
        ("2", "Warehouse / Stores", "Carlos Mendez", "warehouse@maintenx.com", "/warehouse/dashboard", "Raw Materials, GRN, WMS & Shipping"),
        ("3", "Planner / Scheduler", "Elena Rostova", "planner@maintenx.com", "/planner/dashboard", "Demand, MRP, APS Scheduling & Orders"),
        ("4", "Operations Supervisor", "Sarah Jenkins", "supervisor@maintenx.com", "/supervisor/dashboard", "Shift Schedules, Staffing & Approvals"),
        ("5", "Line Lead", "Devang Patel", "linelead@maintenx.com", "/linelead/dashboard", "Hour-by-Hour (H/B) Tracking & Recovery"),
        ("6", "Quality / QA", "Dr. Rachel Thorne", "qa@maintenx.com", "/quality/dashboard", "Pre-Op, CCP Checks, Holds & Batch Release"),
        ("7", "Line Operator", "Marcus Chen", "operator@maintenx.com", "/operator/dashboard", "Touchscreen HMI, Hourly Counts & Stoppages"),
        ("8", "Maintenance", "Dave Miller", "maintenance@maintenx.com", "/maintenance", "CMMS, Breakdowns & Work Orders"),
        ("9", "CI / Kaizen Engineer", "Viktor Hayes", "ci@maintenx.com", "/ci/dashboard", "Loss Analysis, RCA 2.0 & CAPA"),
        ("10", "Plant Manager", "Arthur Sterling", "plant.manager@maintenx.com", "/command-center", "Factory OEE, Control Tower & Bottlenecks"),
        ("11", "Executive (COO)", "Victoria Sterling", "executive@maintenx.com", "/executive/dashboard", "Multi-Plant KPIs & Financial Variance")
    ]

    table_roles = doc.add_table(rows=len(personas), cols=6)
    table_roles.alignment = WD_TABLE_ALIGNMENT.CENTER

    for row_idx, row in enumerate(personas):
        for col_idx, text in enumerate(row):
            cell = table_roles.cell(row_idx, col_idx)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(text)
            if row_idx == 0:
                set_cell_background(cell, "EFEAE2")
                run.bold = True
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(0x26, 0x16, 0x03)
            else:
                set_cell_background(cell, "FFFFFF" if row_idx % 2 != 0 else "FAF6F0")
                run.font.size = Pt(8)

    doc.add_paragraph()

    # Section 2: Operational Steps
    h2 = doc.add_heading(level=1)
    r_h2 = h2.add_run("2. Detailed Step-by-Step Testing Walkthrough")
    r_h2.font.color.rgb = RGBColor(0x26, 0x16, 0x03)
    r_h2.font.size = Pt(14)
    r_h2.font.bold = True

    steps = [
        {
            "num": "STEP 1",
            "title": "Master Data & Foundation Setup (Factory Configuration)",
            "role": "Plant Manager or System Administrator",
            "menus": "Master Data ➔ Lines Master (/master-data/work-centers), Assets Master, SKUs Master, BOMs & Recipes",
            "action": (
                "1. Create Line: Code 'LINE-01', Name 'High-Speed Bottling Line 1', Capacity '500 units/hour'.\n"
                "2. Create Asset: 'Rotary Bottle Filler RF-01' assigned to LINE-01.\n"
                "3. Create SKUs: Finished Good 'SKU-JUC-500' (Fresh Orange Juice 500ml), and Raw Materials: PET Bottles (RM-BOT-500), Caps (RM-CAP-38), Orange Concentrate (RM-CONC-OR).\n"
                "4. Define BOM (Recipe): Link 1 bottle + 1 cap + 0.15L concentrate to 1 finished juice bottle."
            ),
            "flow": "This foundational data populates all dropdowns and calculations in Warehouse, Planning, and Operator interfaces."
        },
        {
            "num": "STEP 2",
            "title": "Warehouse Raw Material Receiving (GRN & Stock Inward)",
            "role": "Warehouse / Receiver (Carlos Mendez)",
            "menus": "Purchasing ➔ Purchasing & POs, Receiving ➔ Receive Material (/warehouse/receiving/receive), Inventory ➔ Raw Materials",
            "action": (
                "1. Open inward delivery for PET Bottles (RM-BOT-500).\n"
                "2. Enter Received Qty: 5,000 Units, Lot: VEND-LOT-2026-99, Bin Location: Rack A-02-B.\n"
                "3. Click 'Generate Goods Receipt Note (GRN)'.\n"
                "4. Repeat for Orange Concentrate (RM-CONC-OR): Inward 1,000 Liters into Tank TNK-01."
            ),
            "flow": "Raw material inventory increments immediately. The Planner's MRP engine now recognizes stock availability."
        },
        {
            "num": "STEP 3",
            "title": "Demand, MRP Explosion & APS Production Scheduling",
            "role": "Planner / Scheduler (Elena Rostova)",
            "menus": "Demand ➔ Customer Orders, MRP ➔ Net Requirements (/planner/mrp/net-requirements), APS / Scheduling ➔ APS Scheduler & Publish",
            "action": (
                "1. Review Customer Order ORD-9021 for 2,000 bottles of Fresh Orange Juice.\n"
                "2. Run MRP Engine: Automatically explodes the BOM recipe and validates warehouse raw materials.\n"
                "3. APS Visual Gantt Scheduler: Allocate batch to Line 1 for Shift 1.\n"
                "4. Click 'Publish Official Schedule' and release Production Order PRD-2026-001."
            ),
            "flow": "Work order dispatches directly to the Operations Supervisor and the Line Operator's terminal."
        },
        {
            "num": "STEP 4",
            "title": "Operations Supervisor Shift Planning & Operator Staffing",
            "role": "Operations Supervisor (Sarah Jenkins)",
            "menus": "Department Schedule (/supervisor/dept-schedule), Manage People ➔ Shift Management (/supervisor/labour/staffing)",
            "action": (
                "1. Inspect published production schedule on Line 1.\n"
                "2. Assign certified Operator Marcus Chen (Skill Tier 3) to Line 1.\n"
                "3. Confirm and lock the shift staffing roster."
            ),
            "flow": "Marcus Chen's personal HMI session receives the assigned job card."
        },
        {
            "num": "STEP 5",
            "title": "Quality Assurance Pre-Op Sanitation & Line Clearance",
            "role": "Quality / QA (Dr. Rachel Thorne)",
            "menus": "Pre-Op & Sanitation ➔ Pre-Op Checklist (/quality/sanitation/preop), Line Readiness",
            "action": (
                "1. Perform physical inspection of Line 1.\n"
                "2. Complete checklist: CIP cycle verified (Pass), ATP allergen swab negative (Pass), Safety guards checked (Pass).\n"
                "3. Submit Pre-Op Clearance."
            ),
            "flow": "Line status changes from 'Under Prep' to 'Ready for Production'. Operator is authorized to start machine."
        },
        {
            "num": "STEP 6",
            "title": "Line Operator Shop Floor Execution & Breakdown Incident",
            "role": "Line Operator (Marcus Chen)",
            "menus": "My Jobs (/operator/my-jobs), Production Entry (/operator/production-entry), Downtime & Loss ➔ Report Issue",
            "action": (
                "1. Start assigned Job Card PRD-2026-001.\n"
                "2. Log Hour 1 output: 480 Good Bottles, 12 Scrap Bottles (Defective cap seal).\n"
                "3. Simulate Breakdown: Click 'Report Issue' ➔ Select Rotary Filler RF-01 ➔ Reason: 'Motor Jammed & Overheated' ➔ Severity: High / Stoppage."
            ),
            "flow": "Hourly counts update Line Lead H/B board and Plant OEE; Breakdown immediately triggers High-Priority Maintenance CMMS Alert!"
        },
        {
            "num": "STEP 7",
            "title": "Maintenance CMMS Breakdown Response & Work Order Resolution",
            "role": "Maintenance (Dave Miller)",
            "menus": "CMMS Dashboard (/maintenance), Breakdowns (/maintenance/breakdowns), Work Orders (/maintenance/work-orders)",
            "action": (
                "1. Accept active emergency alert for Rotary Filler RF-01.\n"
                "2. Open corrective Work Order WO-MAINT-2026-041.\n"
                "3. Record repair: Cleared infeed bottle jam and replaced worn drive bearing (Bearing 6204-2RS).\n"
                "4. Log downtime: 25 minutes. Click 'Mark Work Order Completed & Close'."
            ),
            "flow": "Line status restores to Operational (Green). MTBF and MTTR metrics update dynamically."
        },
        {
            "num": "STEP 8",
            "title": "In-Process Quality Checks & Quarantine Hold",
            "role": "Quality / QA (Dr. Rachel Thorne)",
            "menus": "Quality Checks ➔ CCP Checks (/quality/checks/ccp), Quality Events ➔ Quality Holds (/quality/events/holds)",
            "action": (
                "1. Log CCP pasteurizer temperature: 83.4°C (Compliant / Pass).\n"
                "2. Place 200 bottles on Quarantine Hold due to cap torque variance during breakdown restart."
            ),
            "flow": "In WMS, this sub-lot is blocked from picking or shipping until final QA disposition."
        },
        {
            "num": "STEP 9",
            "title": "Hour-by-Hour (H/B) Review & Supervisor Shift Sign-Off",
            "role": "Line Lead (Devang Patel) ➔ Operations Supervisor (Sarah Jenkins)",
            "menus": "Line Lead H/B Management (/linelead/hb-management), Recovery Management, Supervisor Approvals (/supervisor/approvals)",
            "action": (
                "1. Line Lead documents variance (480 vs 500 target) and inputs recovery plan.\n"
                "2. Supervisor reviews shift handoff summary, downtime logs, and authorizes Shift Sign-Off."
            ),
            "flow": "Shift production locks into history; batch transitions to the QA Release Queue."
        },
        {
            "num": "STEP 10",
            "title": "Batch Quality Compliance & Final Release Disposition",
            "role": "Quality / QA (Dr. Rachel Thorne)",
            "menus": "Batch Quality ➔ Batch Review (/quality/batch/review), QA Release ➔ Release Queue, Disposition (/quality/disposition/release)",
            "action": (
                "1. Review electronic batch record (eBR), sensor telemetry, and re-torque clearance.\n"
                "2. Release quarantine hold and execute disposition: 'Release to Finished Goods' with digital approval signature."
            ),
            "flow": "Batch changes to 'Approved for Sale'. Finished stock automatically credits into Warehouse Finished Goods inventory."
        },
        {
            "num": "STEP 11",
            "title": "Finished Goods Putaway & Outbound Customer Dispatch",
            "role": "Warehouse / Receiver (Carlos Mendez)",
            "menus": "Inventory ➔ Finished Goods, Picking ➔ Pick Lists (/warehouse/picking/lists), Shipping ➔ Shipment Orders (/warehouse/shipping/orders)",
            "action": (
                "1. Generate Pick List for customer sales order ORD-9021.\n"
                "2. Palletize finished goods (Pallet PLT-2026-088).\n"
                "3. Assign carrier: BlueDart Logistics, Vehicle: MP-09-AB-1234, Dock: Bay 3.\n"
                "4. Click 'Dispatch Shipment'."
            ),
            "flow": "Order status updates to Fulfilled; tracking number generated; finished goods inventory decrements."
        },
        {
            "num": "STEP 12",
            "title": "Continuous Improvement, RCA 2.0 & CAPA",
            "role": "CI / Engineering (Viktor Hayes)",
            "menus": "Loss Analysis ➔ Downtime Loss (/ci/loss/downtime), RCA 2.0 ➔ Investigations (/ci/rca/investigations), CAPA ➔ Corrective Actions",
            "action": (
                "1. Analyze the 25-min downtime loss on Line 1.\n"
                "2. Open RCA investigation: Perform 5-Why root cause analysis.\n"
                "3. Issue CAPA: 'Add bi-weekly ultrasonic lubrication check to Line 1 PM schedule'.\n"
                "4. Log projected annual downtime cost savings: ₹1,80,000 / $2,200 in CI Projects Savings."
            ),
            "flow": "Feeds into Executive CI Savings metrics and plant reliability compliance audit."
        },
        {
            "num": "STEP 13",
            "title": "Plant Command Center & Corporate Executive Intelligence",
            "role": "Plant Manager (Arthur Sterling) & Executive (Victoria Sterling)",
            "menus": "Command Center (/command-center), Exception Control Tower, Executive Dashboard (/executive/dashboard)",
            "action": (
                "Review Live Operational & Financial Rollup (No data entry required):\n"
                "• Overall Plant OEE Gauge: Availability (impacted by 25-min breakdown), Performance (speed attainment), Quality (scrap).\n"
                "• Exception Control Tower: Real-time matrix of line statuses and work orders.\n"
                "• Executive Financial Intelligence: Cost per unit, scrap cost, and AI Briefing executive summary."
            ),
            "flow": "Provides complete transparency for plant leadership and enterprise executives."
        }
    ]

    for s in steps:
        h_step = doc.add_heading(level=2)
        r_step = h_step.add_run(f"{s['num']}: {s['title']}")
        r_step.font.color.rgb = RGBColor(0xB2, 0x7E, 0x33)
        r_step.font.size = Pt(12)
        r_step.font.bold = True

        p_meta = doc.add_paragraph()
        r_r_label = p_meta.add_run("• Role / Persona: ")
        r_r_label.bold = True
        p_meta.add_run(f"{s['role']}\n")
        r_m_label = p_meta.add_run("• Sidebar Menu: ")
        r_m_label.bold = True
        p_meta.add_run(f"{s['menus']}\n")
        r_a_label = p_meta.add_run("• Step Action (Inputs): \n")
        r_a_label.bold = True
        p_meta.add_run(f"{s['action']}\n")
        r_f_label = p_meta.add_run("• Where Data Goes Next (Flow): ")
        r_f_label.bold = True
        r_f_val = p_meta.add_run(s['flow'])
        r_f_val.font.italic = True

    # Section 3: Verification Matrix
    doc.add_page_break()
    h3 = doc.add_heading(level=1)
    r_h3 = h3.add_run("3. Client UAT Verification Sign-Off Checklist")
    r_h3.font.color.rgb = RGBColor(0x26, 0x16, 0x03)
    r_h3.font.size = Pt(14)
    r_h3.font.bold = True

    checkpoints = [
        ("Step", "Test Scenario", "Department / Role", "Expected Operational Outcome", "Status"),
        ("1", "Line & Recipe Setup", "Admin / Plant Head", "Data saves and populates across planning dropdowns", "Verified [  ]"),
        ("2", "Raw Material GRN", "Warehouse", "Stock balance increases in raw material inventory", "Verified [  ]"),
        ("3", "MRP & APS Scheduling", "Planner", "BOM explodes, no shortage detected, schedule published", "Verified [  ]"),
        ("4", "Shift Staffing", "Supervisor", "Operator assigned to line based on skill competency", "Verified [  ]"),
        ("5", "Pre-Op Sanitation", "Quality QA", "Line passes inspection; status changes to Ready", "Verified [  ]"),
        ("6", "Production Counts", "Line Operator", "Hourly good and scrap counts update Line Lead H/B", "Verified [  ]"),
        ("7", "Breakdown Alert", "Line Operator", "CMMS receives immediate emergency stoppage ticket", "Verified [  ]"),
        ("8", "Work Order Resolution", "Maintenance", "Bearing replaced, repair logged, line status operational", "Verified [  ]"),
        ("9", "Quality Hold Test", "Quality QA", "Defective sub-lot quarantined; locked in warehouse", "Verified [  ]"),
        ("10", "Hour-by-Hour Sign-Off", "Line Lead & Sup.", "Hourly target gap documented and shift handoff approved", "Verified [  ]"),
        ("11", "Batch Release", "Quality QA", "Hold cleared; batch dispositioned to Finished Goods", "Verified [  ]"),
        ("12", "Outbound Shipping", "Warehouse", "Pick list generated and truck dispatched with tracking", "Verified [  ]"),
        ("13", "RCA & CAPA", "CI Engineer", "5-Why analysis documented and preventive action assigned", "Verified [  ]"),
        ("14", "Real-Time Plant OEE", "Plant Manager", "Dynamic OEE reflects breakdown availability and scrap", "Verified [  ]"),
        ("15", "Executive Intelligence", "Executive COO", "Multi-plant benchmarking and AI briefing active", "Verified [  ]")
    ]

    table_check = doc.add_table(rows=len(checkpoints), cols=5)
    table_check.alignment = WD_TABLE_ALIGNMENT.CENTER

    for r_idx, r in enumerate(checkpoints):
        for c_idx, val in enumerate(r):
            cell = table_check.cell(r_idx, c_idx)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=50, bottom=50, left=70, right=70)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(val)
            if r_idx == 0:
                set_cell_background(cell, "EFEAE2")
                run.bold = True
                run.font.size = Pt(8.5)
                run.font.color.rgb = RGBColor(0x26, 0x16, 0x03)
            else:
                set_cell_background(cell, "FFFFFF" if r_idx % 2 != 0 else "FAF6F0")
                run.font.size = Pt(8)

    output_path = r"d:\kiaan\Maintenance-os\MaintenX-OS\MaintenX_OS_Client_Workflow_Testing_Guide.docx"
    doc.save(output_path)
    print(f"Successfully generated Word document: {output_path}")

if __name__ == "__main__":
    create_document()
