import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const CertificateList = ({ certificates, setCertificates }) => {
  const { user } = useAuth();

  const handleDelete = async (certificateId) => {
    try {
      await axiosInstance.delete(`/api/certificates/${certificateId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCertificates(certificates.filter((cert) => cert._id !== certificateId));
    } catch (error) {
      console.error('Failed to delete certificate', error);
    }
  };


  const handleDownload = (certificate) => {
    // Create simple text content
    const textContent = `
CERTIFICATE OF COMPLETION

This certifies that ${certificate.userName} has successfully completed the ${certificate.moduleName} module.

Completed: ${certificate.totalLessons} lessons
Date: ${formatDate(certificate.completionDate)}

Online Learning Progress Tracker
    `;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificate.moduleName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!certificates) {
    return <div>Loading certificates...</div>;
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Certificates Yet</h3>
        <p className="text-gray-500">Complete modules to earn your first certificate!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Your Certificates ({certificates.length})
        </h2>
        <p className="text-gray-600">Congratulations on completing these modules!</p>
      </div>

      {certificates.map((certificate) => (
        <div key={certificate._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <div className="text-center p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Congratulations!
            </h3>
            <p className="text-lg text-gray-700 mb-4">
              You have successfully completed the <strong>{certificate.moduleName}</strong> module.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Completed by {certificate.userName} on {formatDate(certificate.completionDate)}
            </p>
          </div>

          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleDownload(certificate)}
              className="bg-[#005691] text-white px-4 py-2 rounded hover:bg-[#004080]"
            >
              Download TXT
            </button>
            <button
              onClick={() => handleDelete(certificate._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CertificateList;