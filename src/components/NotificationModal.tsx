import { useNotifications } from "src/context";
import { TOKENS } from "src/styles/tokens";
import { Modal } from "./Modal";

export function NotificationModal() {
  const { isOpen, notifications, closeNotifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <Modal
      onClose={closeNotifications}
      style={{
        width: "90%",
        maxWidth: "420px",
        maxHeight: "70vh",
        overflowY: "auto",
        gap: TOKENS.SPACE_2,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, color: TOKENS.INK }}>Notifications</h3>
        <button
          onClick={closeNotifications}
          style={{
            background: "none",
            border: "none",
            color: TOKENS.INK_FADED,
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
          }}
        >
          &#10005;
        </button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ color: TOKENS.INK_GHOST, textAlign: "center", margin: TOKENS.SPACE_2, fontStyle: "italic" }}>
          No notifications
        </p>
      ) : (
        notifications.map((n, i) => (
          <div
            key={i}
            style={{
              background: TOKENS.BG_LIGHTER,
              border: TOKENS.BORDER,
              borderRadius: TOKENS.RADIUS,
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "1.4rem" }}>{n.level}</span>
            <span style={{ color: TOKENS.INK }}>{n.message}</span>
          </div>
        ))
      )}
    </Modal>
  );
}
