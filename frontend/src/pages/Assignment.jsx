import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../axiosConfig";
import AssignmentList from "../components/AssignmentList";
import NavigationPanel from "../components/NavigationPanel";
import { useAuth } from "../context/AuthContext";
import "./Assignment.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "DB", to: "/student" },
  { id: "module", label: "Module", icon: "MD", to: "/modules" },
  { id: "assignment", label: "Assignment", icon: "AS", to: "/assignments", active: true },
  { id: "certificate", label: "Certificate", icon: "CF", to: "/certificates" },
];

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);

  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return "KK";
  }, [user]);

  const displayName = user?.name || "Ka Ki Yeung";
  const roleLabel = user?.profileType === "student" ? "Student" : "Educator";
  const welcomeMessage = user?.name ? "Welcome back, " + user.name : "Welcome back!";

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.token) {
        setAssignments([]);
        return;
      }

      try {
        const response = await axiosInstance.get("/api/assignments", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAssignments(response.data);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [user]);

  return (
    <div className="assignment-page">
      <NavigationPanel
        title="Navigation"
        welcomeMessage={welcomeMessage}
        initials={initials}
        userName={displayName}
        userRole={roleLabel}
        items={navItems}
      />
      <main className="assignment-page__content">
        <div className="assignment-page__inner">
          <AssignmentList assignments={assignments} setAssignments={setAssignments} />
        </div>
      </main>
    </div>
  );
};

export default Assignments;
