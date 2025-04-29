import { useState } from "react";
import Profile from "./Profile";
import "../index.css";
import HandsOnLearning from "./HandsOnLearning";
import Games from "./Games";
import Subscription from "./Subscription";
import StudentsLabHome from "./vsl/StudentsLabHome";
import TeacherLabHome from "../TeacherDashboard/TeacherLabHome";

type MenuItem = "Profile" | "Hands On Learning" | "Games" | "Subscription"|"Virtual Science Lab" | "Stats" | "Logout";

const menuItems: MenuItem[] = [
  "Profile",
  "Hands On Learning",
  "Games",
  "Virtual Science Lab",
  "Subscription",
  "Stats",
  "Logout",
];

const colors: Record<MenuItem, string> = {
  Profile: "text-purple-600",
  "Hands On Learning": "text-blue-600",
  Games: "text-orange-500",
  "Virtual Science Lab": "text-green-500",
  Subscription: "text-blue-500",
  Stats: "text-purple-500",
  Logout: "text-red-500",
};

export default function Sidebar() {
  const [selectedItem, setSelectedItem] = useState<MenuItem>("Profile");

  const renderComponent = () => {
    switch (selectedItem) {
      case "Profile":
        return <Profile />;
      case "Hands On Learning":
        return <HandsOnLearning />;
      case "Games":
        return <Games />;
      case "Virtual Science Lab":
          return <StudentsLabHome/>;
      case "Subscription":
        return <Subscription />;
      case "Stats":
        return <TeacherLabHome />;
      case "Logout":
        return <div className="text-lg font-semibold text-red-500">Logging out...</div>;
      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-blue/70 text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white text-black shadow-xl rounded-none md:rounded-tr-3xl md:rounded-br-3xl p-6">
        <h2 className="text-2xl font-extrabold mb-6 text-purple-700">🎮 My Fun Space</h2>
        <ul className="space-y-3">
          {menuItems.map((item) => (
            <li
              key={item}
              onClick={() => setSelectedItem(item)}
              className={`cursor-pointer px-4 py-2 rounded-xl transition-all duration-200 hover:bg-purple-100 hover:scale-105 ${
                selectedItem === item
                  ? `bg-purple-200 font-bold shadow-md ${colors[item]}`
                  : "text-gray-700"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      {/* Content Area */}
      <main className="flex-1  p-6 overflow-y-auto flex justify-center items-start">
        <div className="w-full max-w-4xl">{renderComponent()}</div>
      </main>
    </div>
  );
}
