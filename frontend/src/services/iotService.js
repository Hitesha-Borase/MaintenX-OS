import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const iotService = {
  async getLatestTelemetry(assetCode) {
    const endpoint = assetCode ? `/iot/telemetry/latest?assetCode=${assetCode}` : "/iot/telemetry/latest";
    return apiClient.get(endpoint);
  },

  async getHistory(assetCode, limit = 50) {
    return apiClient.get(`/iot/telemetry/history/${assetCode}?limit=${limit}`);
  },

  async ingestTelemetry(payload) {
    return apiClient.post("/iot/telemetry/ingest", payload);
  },

  async getGateways() {
    return apiClient.get("/iot/gateways");
  },

  async startSimulator() {
    return apiClient.post("/iot/simulator/start");
  },

  async stopSimulator() {
    return apiClient.post("/iot/simulator/stop");
  },

  connectLiveStream(onMessage, onError) {
    const streamUrl = `${API_BASE_URL}/iot/telemetry/stream`;
    let eventSource;

    try {
      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (onMessage) onMessage(parsed);
        } catch (e) {
          console.warn("Failed to parse SSE telemetry packet:", e);
        }
      };

      eventSource.onerror = (err) => {
        if (onError) onError(err);
      };
    } catch (e) {
      console.warn("EventSource creation error:", e.message);
    }

    // Return cleanup unsubscribe function
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  },
};

export default iotService;
