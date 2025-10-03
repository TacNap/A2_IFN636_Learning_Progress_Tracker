import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import './Certificates.css';

const Certificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date not available';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
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
            setCertificates(prev => prev.filter(cert => cert._id !== certificateId));
        } catch (error) {
            console.error('Error deleting certificate:', error);
            alert('Failed to delete certificate. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="certificates-page">
                <div className="certificates-container">
                    <div className="certificates-loading">
                        Loading certificates...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="certificates-page">
                <div className="certificates-container">
                    <div className="certificates-error">
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="certificates-retry-btn"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="certificates-page">
            <div className="certificates-container">
                {certificates.length === 0 ? (
                    <div className="certificates-empty">
                        No certificates yet. Complete a module to earn your first certificate!
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default Certificates;