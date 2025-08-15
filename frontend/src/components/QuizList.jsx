import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";

const QuizList = ({ quizzes, setQuizzes, setEditingQuiz }) => {
    const user = useAuth();

    const handleDelete = async (quizId) => { 
        try {
            await axiosInstance.delete(`/api/quizzes/${quizId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
        } catch (error) {
            console.error("Failed to delete quiz:", error);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85) return "bg-green-500";
        if (score >= 55) return "bg-yellow-500";
        if (score >= 35) return "bg-orange-500";
        return "bg-red-500";
    };

    const getScoreText = (score) => {
        if (score >= 85) return "Excellent";
        if (score >= 55) return "Good";
        if (score >= 35) return "Needs Improvement";
        return "Failed";
    };

    if (!quizzes) {
        return <div>No quizzes available</div>;
    }

    return (
    <div>
      {quizzes.map((quiz) => {
        const scoreColor = getScoreColor(quiz.score);
        const gradeLetter = getScoreText(quiz.score);
        
        return (
          <div key={quiz._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-lg">{quiz.title}</h2>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded text-white font-bold ${scoreColor}`}>
                  {quiz.score}%
                </span>
                <span className={`px-2 py-1 rounded text-white font-bold text-sm ${scoreColor}`}>
                  {gradeLetter}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{quiz.description}</p>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Score Progress</span>
                <span>{quiz.score}% / 100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${scoreColor}`}
                  style={{ width: `${quiz.score}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingQuiz(quiz)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(quiz._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
      
      {quizzes.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No quizzes yet. Add your first quiz above!</p>
        </div>
      )}
    </div>
  );
};

export default QuizList;