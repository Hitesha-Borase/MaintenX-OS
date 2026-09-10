import React from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            padding: "40px 20px",
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              padding: "18px",
              borderRadius: "50%",
              backgroundColor: "rgba(220, 38, 38, 0.12)",
              color: "#DC2626",
              marginBottom: "16px"
            }}
          >
            <AlertOctagon size={44} />
          </div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
            Something went wrong rendering this page
          </h2>

          <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "520px", lineHeight: 1.6, marginBottom: "20px" }}>
            An unexpected error occurred while loading this section. You can reload this view or navigate back to the dashboard.
          </p>

          {this.state.error && (
            <div
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "rgba(220, 38, 38, 0.06)",
                border: "1px solid rgba(220, 38, 38, 0.2)",
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono, monospace)",
                color: "#DC2626",
                textAlign: "left",
                marginBottom: "24px",
                overflowX: "auto",
                whiteSpace: "pre-wrap"
              }}
            >
              {this.state.error?.toString()}
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={this.handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 18px",
                backgroundColor: "var(--color-primary, #C89547)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              <RotateCcw size={15} />
              Reload Page
            </button>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.href = "/dashboard";
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 18px",
                backgroundColor: "var(--bg-card-subtle, #F1ECE4)",
                color: "var(--text-primary, #261603)",
                border: "1px solid var(--border-subtle, #E6DEC9)",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              <Home size={15} />
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
