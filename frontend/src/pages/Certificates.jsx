import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import CertificateList from '../components/CertificateList';
import { useAuth } from '../context/AuthContext';

const Certificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if(loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-8">
                    <div className="text-gray-500 text-lg">Loading certificates...</div>
                </div>
            </div>
        );
    }

    if(error){
        return(
            <div className="container mx-auto p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button 
                       onClick={() => window.location.reload()}
                       className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return(
        <div className="container mx-auto p-6">
            <CertificateList 
                certificates={certificates} 
                setCertificates={setCertificates} 
            />
        </div>
    );
};

export default Certificates;