import { useAlertContext } from "@/contexts/AlertContext";

export default function Alert() {
  const { alertIsOpen, alertMessage, hideAlert } = useAlertContext();

  if (!alertIsOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center">
        {/* Modal */}
        <div className="bg-slate-50 p-6">
          <div>{alertMessage}</div>
          <button onClick={hideAlert}>Close</button>
        </div>
      </div>
    </>
  );
}
