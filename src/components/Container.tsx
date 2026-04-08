import { Navbar } from "./Navbar";
import { NotificationModal } from "./NotificationModal";

export function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <Navbar />
      <NotificationModal />
      <div className="container-content">{children}</div>
    </div>
  );
}
