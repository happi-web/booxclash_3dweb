import { useState } from "react";
import StudentManagement from "./StudentManagement";
import ContentManagement from "./ContentManagement";
import Profile from "../StudentDashboard/Profile";
import VirtualLab from "./VirtualLab";

const adminMenu = [
  "Profile",
  "Students Management",
  "Content Management",
  "Virtual Lab",
  "Subscribers",
  "Analytics",
  "Settings",
  "Logout",
];

const AdminDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Profile");

  const renderContent = () => {
    switch (activeMenu) {
      case "Profile":
        return <Profile />;
      case "Students Management":
        return <StudentManagement/>;
      case "Content Management":
        return <ContentManagement/>;
      case "Virtual Lab":
          return <VirtualLab/>;
      case "Subscribers":
        return <div>Subscriber List and Plans</div>;
      case "Analytics":
        return <div>View Platform Analytics</div>;
      case "Settings":
        return <div>System Settings</div>;
      case "Logout":
        // Add logout logic here
        return <div>Logging out...</div>;
      default:
        return <div>Select a menu</div>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-3">
          {adminMenu.map((item) => (
            <li
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-700 transition ${
                activeMenu === item ? "bg-gray-700" : ""
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex-1 bg-gray-100 p-6">
        <h3 className="text-2xl font-semibold mb-4">{activeMenu}</h3>
        <div className="bg-white rounded p-4 shadow-md">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
