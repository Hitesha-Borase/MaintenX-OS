import { IAIProvider, AICompletionResult } from "./aiProvider.interface.js";

export class MockAIProvider implements IAIProvider {
  name = "Mock/Simulator AI";

  async generateCompletion(query: string, systemContext: string): Promise<AICompletionResult> {
    const q = (query || "").toLowerCase();
    let reply = "";
    let tag = "Plant Intelligence Overview";
    let confidence = 0.92;

    if (q.includes("oee") || q.includes("efficiency") || q.includes("performance")) {
      tag = "OEE & Throughput Analysis";
      reply = `Line 1 (Bottling) is currently operating at 88.4% OEE with 94.2% Availability. Line 2 (Pasteurizer) is recovering at 84.1% OEE following thermal dwell calibration. Plant cumulative pacing attainment is 99.4% of schedule.`;
    } else if (q.includes("downtime") || q.includes("stoppage") || q.includes("alarm") || q.includes("jam")) {
      tag = "Downtime Breakdown & Root Cause";
      reply = `Shift A recorded 12 minutes of micro-stoppages on Packaging Line 1 caused by pouch infeed sensor alignment (resolved). Smokehouse #3 draft damper calibration is active. Cumulative stoppage cost impact is approximately $1,250.`;
    } else if (q.includes("order") || q.includes("batch") || q.includes("schedule") || q.includes("production")) {
      tag = "Production Order Attainment";
      reply = `Active run order PO-2026-01 (GCM Teriyaki Beef Jerky 80g) is 78.4% complete with 7,840 packs sealed. Current line throughput is pacing at 2,450 LBS/HR against 2,500 LBS/HR target. Projected run completion time is 16:15.`;
    } else if (q.includes("vibration") || q.includes("temperature") || q.includes("bearing") || q.includes("iot") || q.includes("sensor")) {
      tag = "Condition-Based Predictive Alert";
      reply = `IoT Edge Node IOT-01 reports Weiler Grinder auger drive bearing #2 spectral vibration at 2.45 mm/s RMS (below 3.0 mm/s warning threshold). Motor casing temperature is steady at 58.4°C. Routine lubrication scheduled for end-of-shift.`;
    } else if (q.includes("quality") || q.includes("ccp") || q.includes("spec") || q.includes("brix") || q.includes("ph")) {
      tag = "Quality & CCP Compliance";
      reply = `All Critical Control Points (CCPs) are verified in compliant state. Smokehouse thermal lethality core temp is holding at 74.5°C (Limit: Min 71.1°C CCP-1). Zero critical holds active.`;
    } else {
      reply = `Based on real-time operational context: Plant 1 - Meat Processing & Smokehouse Facility is running nominal across smokehouse and packaging lines with 0 critical P1 stoppages. Line 1 OEE is 88.4%, active order PO-2026-01 is on schedule, and telemetry indicates stable mechanical parameters across all connected OPC-UA/MQTT edge gateways.`;
    }

    return {
      reply,
      tag,
      confidence,
      sources: ["Operational Intelligence Engine", "PostgreSQL Telemetry DB", "Active Shift Context"],
      provider: "MaintenX Operational Intelligence (Simulator)",
      modelUsed: "Heuristic-Rule-Based-v1",
    };
  }
}
