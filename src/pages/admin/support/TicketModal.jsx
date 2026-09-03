import React, { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Send, CheckCircle, MessageSquare } from "lucide-react";
import { Badge } from "../../../components/common/Badge";

export function TicketModal({ isOpen, onClose, ticket = null, onResolve }) {
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([
    { sender: "User", text: "Please help, I have an issue with this." }
  ]);

  // Reset when opening a new ticket
  React.useEffect(() => {
    if (ticket) {
      setReply("");
      setMessages([{ sender: "User", text: `Details for: ${ticket.subject}` }]);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSendReply = () => {
    if (!reply.trim()) return;
    setMessages(prev => [...prev, { sender: "Master Admin", text: reply }]);
    setReply("");
  };

  const handleResolveClick = () => {
    onResolve(ticket.id);
    onClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "#EF4444";
      case "Medium": return "#F59E0B";
      case "Low": return "#10B981";
      default: return "var(--text-secondary)";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ticket: ${ticket.id}`}
      subtitle={`Support request from ${ticket.company}`}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {ticket.status !== "Resolved" && (
            <Button variant="success" icon={CheckCircle} onClick={handleResolveClick}>
              Mark as Resolved
            </Button>
          )}
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Ticket Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", backgroundColor: "var(--bg-main)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>{ticket.subject}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Opened on {ticket.date}</div>
            </div>
            <Badge variant={ticket.status === "Resolved" ? "emerald" : ticket.status === "Open" ? "warning" : "primary"}>
              {ticket.status}
            </Badge>
          </div>
          
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", paddingTop: "12px", borderTop: "1px dashed var(--border-color)" }}>
            <div style={{ fontSize: "13px" }}>
              <span style={{ color: "var(--text-muted)", marginRight: "6px" }}>Priority:</span>
              <span style={{ fontWeight: 600, color: getPriorityColor(ticket.priority) }}>{ticket.priority}</span>
            </div>
            <div style={{ fontSize: "13px" }}>
              <span style={{ color: "var(--text-muted)", marginRight: "6px" }}>Status:</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ticket.status}</span>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", padding: "8px" }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: msg.sender === "Master Admin" ? "flex-end" : "flex-start"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>{msg.sender}</div>
              <div style={{ 
                padding: "12px 16px", 
                borderRadius: "12px", 
                backgroundColor: msg.sender === "Master Admin" ? "var(--accent-cyan)" : "var(--bg-card-subtle)",
                color: msg.sender === "Master Admin" ? "#fff" : "var(--text-primary)",
                maxWidth: "85%",
                fontSize: "14px",
                lineHeight: "1.5"
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Box */}
        {ticket.status !== "Resolved" && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginTop: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase" }}>
                <MessageSquare size={12} style={{ marginRight: "4px", display: "inline" }} />
                Reply to Tenant
              </label>
              <textarea 
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your response here..."
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-body)", resize: "none", minHeight: "80px", color: "var(--text-primary)" }}
              />
            </div>
            <Button variant="primary" icon={Send} onClick={handleSendReply} style={{ height: "42px" }}>Send</Button>
          </div>
        )}

      </div>
    </Modal>
  );
}
