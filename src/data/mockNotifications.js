// Initial Notifications Dataset for Maintenance OS
export const INITIAL_NOTIFICATIONS = [
  {
    id: "NOTIF-001",
    title: "Critical Breakdown: Heat Exchanger HT-105",
    message: "Hydraulic pressure loss alarm triggered on Line 2. Gasket failure suspected.",
    type: "critical",
    category: "Breakdowns",
    timestamp: "10 mins ago",
    read: false,
    link: "/breakdowns/log",
    actionText: "View Breakdown"
  },
  {
    id: "NOTIF-002",
    title: "Overdue PM Checklist: Pasteurizer Monthly",
    message: "Checklist #CHK-HT-MONTHLY is 6 days overdue. Operating hours exceeded threshold.",
    type: "warning",
    category: "Preventive Maintenance",
    timestamp: "45 mins ago",
    read: false,
    link: "/preventive-maintenance/execution",
    actionText: "Execute PM"
  },
  {
    id: "NOTIF-003",
    title: "Calibration Due: Coriolis Flowmeter INS-FM-012",
    message: "6-month calibration interval expired on Rotary Filler 12-Head flow sensor.",
    type: "warning",
    category: "Calibration",
    timestamp: "2 hours ago",
    read: false,
    link: "/calibration/schedule",
    actionText: "Review Schedule"
  },
  {
    id: "NOTIF-004",
    title: "Low Stock Alert: EPDM Gaskets (1 pack remaining)",
    message: "Part GSK-EPDM-HT105 reached reorder point (min stock: 3).",
    type: "warning",
    category: "Spare Parts",
    timestamp: "4 hours ago",
    read: true,
    link: "/spare-parts/inventory",
    actionText: "Inventory"
  },
  {
    id: "NOTIF-005",
    title: "Work Order Assigned: Excessive Spindle Vibration",
    message: "WO-2026-0891 assigned to Senior Tech Marcus Vance on Line 1.",
    type: "info",
    category: "Work Orders",
    timestamp: "Yesterday",
    read: true,
    link: "/work-orders/open",
    actionText: "Open Work Order"
  },
  {
    id: "NOTIF-006",
    title: "IoT Sensor Anomaly: Motor Vibration Spike",
    message: "Rotary Labeler LB-204 vibration level elevated to 3.9 mm/s (Warning threshold: 3.5).",
    type: "critical",
    category: "Machine / IoT",
    timestamp: "Yesterday",
    read: true,
    link: "/machine-iot",
    actionText: "View Live IoT"
  }
];
