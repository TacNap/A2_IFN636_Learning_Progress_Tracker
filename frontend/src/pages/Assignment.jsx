import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentList from '../components/AssignmentList';
import { useAuth } from '../context/AuthContext';

const Assignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [editingAssignment, setEditingAssignment] = useState(null);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await axiosInstance.get('/api/assignments', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setAssignments(response.data);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            }
        };

        fetchAssignments();
    }, [user]);

    return (
        <div className="container mx-auto p-6">
            <AssignmentForm
                assignments={assignments}
                setAssignments={setAssignments}
                editingAssignment={editingAssignment}
                setEditingAssignment={setEditingAssignment}
            />
            <AssignmentList
                assignments={assignments}
                setAssignments={setAssignments}
                setEditingAssignment={setEditingAssignment}
            />
        </div>
    );
};

export default Assignments;