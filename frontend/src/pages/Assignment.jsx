import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../axiosConfig";
import AssignmentList from "../components/AssignmentList";
import NavigationPanel from "../components/NavigationPanel";
import { useAuth } from "../context/AuthContext";
import "./Assignment.css";
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";
import Navbar from "../components/Navbar";



const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);

  const dashboardPath = user?.profileType === 'educator' ? '/educator' : '/student';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: dashboardPath },
    { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules' },
    { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments', active: true },
    { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
  ];

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
    <div>
      <Navbar />
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
          <header className='assignment-create__header'>
          <div className='assignment-create__breadcrumb' aria-label='Breadcrumb'>
            <span>Home</span>
            <span aria-hidden='true'>&gt;</span>
            <span>Assignments</span>
            <span aria-hidden='true'>&gt;</span>
            <span className='assignment-create__breadcrumb-current'>Assignment</span>
          </div>
          <div className='assignment-create__heading'>
            <h1>Assignments</h1>
          </div>
        </header>
          <section className='assignment-create__form-area' aria-label='Assignment form'>
          <AssignmentList assignments={assignments} setAssignments={setAssignments} />
          </section>
        </div>
      </main>
    </div>
    </div>
  );
};

export default Assignments;
