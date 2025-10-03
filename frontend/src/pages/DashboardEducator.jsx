import { useAuth } from '../context/AuthContext';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";
import Navbar from "../components/Navbar";


const DashboardEducator = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Educator Dashboard</h1>
      <p className="text-gray-700">
        Educator specific content will go here...
      </p>
    </div>
    </div>
  );
};

export default DashboardEducator;
