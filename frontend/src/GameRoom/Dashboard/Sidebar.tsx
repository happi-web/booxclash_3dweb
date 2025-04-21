import { useState } from "react";
import Profile from "./Profile";
import HandsOnLearning from "./HandsOnLearning";
import Games from "./Games";
import Subscription from "./Subscription";
import Statistics from "./Statistics";

const menuItems = [
  "Profile",
  "Hands On Learning",
  "Games",
  "Subscription",
  "Stats",
  "Logout"
];

export default function Sidebar() {
  const [selectedItem, setSelectedItem] = useState("Profile");

  const renderComponent = () => {
    switch (selectedItem) {
      case "Profile":
        return <Profile />;
      case "Hands On Learning":
        return <HandsOnLearning />;
      case "Games":
        return <Games />;
      case "Subscription":
        return <Subscription />;
      case "Stats":
        return <Statistics />;
      case "Logout":
        // You could redirect or handle logout logic here
        return <div>Logging out...</div>;
      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Student Dashboard</h2>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item}
              onClick={() => setSelectedItem(item)}
              className={`mb-3 cursor-pointer hover:text-blue-600 transition ${
                selectedItem === item ? "text-blue-700 font-semibold" : ""
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-gray-100">{renderComponent()}</div>
    </div>
  );
}
