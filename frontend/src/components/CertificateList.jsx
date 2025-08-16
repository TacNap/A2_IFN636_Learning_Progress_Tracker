import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { DownloadIcon, DeleteIcon } from '@heroicons/react/solid'; // adjust import if needed

const CertificateList = ({ certificates, setCertificates }) => {
    const { user } = useAuth();

    const handleDelete = async (certificateId) => {
        if (!confirm('Are you sure you want to delete this certificate?')) {
            return;
        }

        try {
            await axiosInstance.delete(`/certificates/${certificateId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setCertificates(certificates.filter(cert => cert._id !== certificateId));
        } catch (error) {
            alert('Failed to delete certificate');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (certificates.length === 0) {
        return (
            <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Certificates Yet</h3>
                <p className="text-gray-500">Complete modules to earn your first certificate</p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Certificates ({certificates.length})</h2>
                <p className="text-gray-600">Congratulations on completing the modules!</p>
            </div>

            {certificates.map((certificate) => (
                <div key={certificate._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">Good Job!</span>
                                <h3 className="font-bold text-lg text-gray-800">{certificate.moduleName}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Completed by:</span>
                                    <br />
                                    <span className="text-gray-800">{certificate.userName}</span>
                                </div>

                                <div>
                                    <span className="font-medium">Completion Date:</span>
                                    <br />
                                    <span className="text-gray-800">{formatDate(certificate.completedDate)}</span>
                                </div>

                                <div>
                                    <span className="font-medium">Lessons Completed:</span>
                                    <br />
                                    <span className="text-gray-800">{certificate.totalLessons} lessons</span>
                                </div>
                            </div>
                        </div>

                        <div className="ml-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Certified!
                            </span>
                        </div>
                    </div>

                    {certificate.moduleId && (
                        <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Module:</span> {certificate.moduleId.title}
                            </p>
                            {certificate.moduleId.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {certificate.moduleId.description}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                            title="Download Certificate"
                        >
                            <span className="mr-1"><DownloadIcon className="h-4 w-4" /></span>
                            Download
                        </button>

                        <button
                            onClick={() => handleDelete(certificate._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                        >
                            <span className="mr-1"><DeleteIcon className="h-4 w-4" /></span>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CertificateList;
