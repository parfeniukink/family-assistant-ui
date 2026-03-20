import { useNotifications } from "src/context";
import { TOKENS } from "src/styles/tokens";

export function NotificationModal() {
  const { isOpen, notifications, closeNotifications } = useNotifications();

  if (!isOpen) return null;

  return (
    <div
      onClick={closeNotifications}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.6)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: TOKENS.BG_LIGHTER,
          border: TOKENS.BORDER,
          borderRadius: TOKENS.RADIUS,
          boxShadow: TOKENS.SHADOW,
          padding: TOKENS.SPACE_2,
          width: "90%",
          maxWidth: "420px",
          maxHeight: "70vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: TOKENS.SPACE_1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, color: TOKENS.WHITE }}>Notifications</h3>
          <button
            onClick={closeNotifications}
            style={{
              background: "none",
              border: "none",
              color: TOKENS.GRAY,
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {notifications.length === 0 ? (
          <p style={{ color: TOKENS.GRAY, textAlign: "center", margin: TOKENS.SPACE_1 }}>
            No notifications
          </p>
        ) : (
          notifications.map((n, i) => (
            <div
              key={i}
              style={{
                background: TOKENS.BG,
                border: TOKENS.BORDER,
                borderRadius: TOKENS.RADIUS,
                padding: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>{n.level}</span>
              <span style={{ color: TOKENS.WHITE }}>{n.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
