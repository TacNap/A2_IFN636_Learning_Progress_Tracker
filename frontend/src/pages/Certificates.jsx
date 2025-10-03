import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../axiosConfig';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import './Certificates.css';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/student'},
  { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules' },
  { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates', active: true },
];

const Certificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initials = useMemo(() => {
        if (user?.name) {
            return user.name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
        }
        return 'KK';
    }, [user]);

    const displayName = user?.name || 'Ka Ki Yeung';
    const roleLabel = user?.profileType === 'student' ? 'Student' : 'Educator';
    const welcomeMessage = user?.name ? `Welcome back, ${user.name}` : 'Welcome back!';

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date not available';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            return 'Date not available';
        }
    };

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/api/certificates', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setCertificates(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching certificates:', error);
                setError('Failed to fetch certificates');
            } finally {
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchCertificates();
        }
    }, [user]);

    const handleDownload = (certificate) => {
        const content = `Congratulations!

You have successfully completed the ${certificate.moduleName} module

Completed by ${certificate.userName || user.name} on ${formatDate(certificate.completionDate)}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${certificate.moduleName}_Certificate.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDelete = async (certificateId) => {
        if (!window.confirm('Are you sure you want to delete this certificate?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/api/certificates/${certificateId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setCertificates((prev) => prev.filter((cert) => cert._id !== certificateId));
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Failed to delete certificate. Please try again.');
        }
    };

    let mainContent;

    if (loading) {
        mainContent = (
            <div className="certificates-loading">
                Loading certificates...
            </div>
        );
    } else if (error) {
        mainContent = (
            <div className="certificates-error">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="certificates-retry-btn"
                >
                    Try Again
                </button>
            </div>
        );
    } else if (certificates.length === 0) {
        mainContent = (
            <div className="certificates-empty">
                No certificates yet. Complete a module to earn your first certificate!
            </div>
        );
    } else {
        mainContent = (
            <div className="certificate-card">
                <div className="certificate-header">
                    <h1>Your Certificates ({certificates.length})</h1>
                    <p>Congratulations on completing these modules!</p>
                </div>
                <div className="certificates-list">
                    {certificates.map((certificate) => (
                        <div key={certificate._id} className="certificate-content">
                            <h2>Congratulations!</h2>
                            <p>
                                You have successfully completed the{' '}
                                <span className="certificate-module-name">
                                    {certificate.moduleName}
                                </span>{' '}
                                module
                            </p>
                            <p>
                                completed by {certificate.userName || user.name} on{' '}
                                {formatDate(certificate.completionDate)}
                            </p>
                            <div className="certificate-actions">
                                <button
                                    onClick={() => handleDownload(certificate)}
                                    className="certificate-download-btn"
                                >
                                    Download TXT
                                </button>
                                <button
                                    onClick={() => handleDelete(certificate._id)}
                                    className="certificate-delete-btn"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="certificates-page">
            <NavigationPanel
                title="Navigation"
                welcomeMessage={welcomeMessage}
                initials={initials}
                userName={displayName}
                userRole={roleLabel}
                items={navItems}
            />
            <main className="certificates-page__content">
                
                <div className="certificates-container">
                    <header className='assignment-create__header'>
                    <div className='assignment-create__breadcrumb' aria-label='Breadcrumb'>
                        <span>Home</span>
                        <span aria-hidden='true'>&gt;</span>
                        <span className='assignment-create__breadcrumb-current'>Certificates</span>
                    </div>
                    <div className='assignment-create__heading'>
                    </div>
                    </header>
                    {mainContent}
                </div>
            </main>
        </div>
    );
};

export default Certificates;
