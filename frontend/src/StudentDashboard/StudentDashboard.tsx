import Sidebar from "./Sidebar";
import "../index.css";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <Sidebar />
    </div>
  );
}
