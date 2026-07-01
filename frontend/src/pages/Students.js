import React, { useState, useEffect } from 'react';
import { getStudents, getClasses, createStudent, createClass, createGuardian } from '../api/api';

function Students() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [studentName, setStudentName] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [guardianPhone, setGuardianPhone] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');

    const [className, setClassName] = useState('');
    const [classTerm, setClassTerm] = useState('');

    const [message, setMessage] = useState('');

    // Load students and classes when page opens
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                getStudents(),
                getClasses()
            ]);
            setStudents(studentsRes.data);
            setClasses(classesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Add a new class
    const handleAddClass = async (e) => {
        e.preventDefault();
        try {
            await createClass({ name: className, term: classTerm });
            setClassName('');
            setClassTerm('');
            setMessage('Class added successfully!');
            loadData();
        } catch (err) {
            setMessage('Error adding class.');
        }
    };

    // Add a new student + guardian
    const handleAddStudent = async (e) => {
        e.preventDefault();
        try {
            const studentRes = await createStudent({
                full_name: studentName,
                student_class_id: selectedClass,
            });
            await createGuardian({
                student: studentRes.data.id,
                full_name: guardianName,
                phone: guardianPhone,
                email: guardianEmail,
            });
            setStudentName('');
            setSelectedClass('');
            setGuardianName('');
            setGuardianPhone('');
            setGuardianEmail('');
            setMessage('Student and guardian added successfully!');
            loadData();
        } catch (err) {
            setMessage('Error adding student.');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2 style={{ color: '#1F6BB0' }}>Students</h2>

            {message && (
                <p style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '6px' }}>
                    {message}
                </p>
            )}

            {/* Add Class Form */}
            <div style={cardStyle}>
                <h3>Add a Class</h3>
                <form onSubmit={handleAddClass} style={formStyle}>
                    <input
                        style={inputStyle}
                        placeholder="Class name (e.g. Grade 7B)"
                        value={className}
                        onChange={e => setClassName(e.target.value)}
                        required
                    />
                    <input
                        style={inputStyle}
                        placeholder="Term (e.g. Term 2 2025/26)"
                        value={classTerm}
                        onChange={e => setClassTerm(e.target.value)}
                        required
                    />
                    <button style={buttonStyle} type="submit">Add Class</button>
                </form>
            </div>

            {/* Add Student Form */}
            <div style={cardStyle}>
                <h3>Add a Student</h3>
                <form onSubmit={handleAddStudent} style={formStyle}>
                    <input
                        style={inputStyle}
                        placeholder="Student full name"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        required
                    />
                    <select
                        style={inputStyle}
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        required
                    >
                        <option value="">Select a class</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.term}</option>
                        ))}
                    </select>

                    <h4 style={{ margin: '10px 0 4px' }}>Parent / Guardian</h4>
                    <input
                        style={inputStyle}
                        placeholder="Guardian full name"
                        value={guardianName}
                        onChange={e => setGuardianName(e.target.value)}
                        required
                    />
                    <input
                        style={inputStyle}
                        placeholder="Guardian phone number"
                        value={guardianPhone}
                        onChange={e => setGuardianPhone(e.target.value)}
                        required
                    />
                    <input
                        style={inputStyle}
                        placeholder="Guardian email (optional)"
                        value={guardianEmail}
                        onChange={e => setGuardianEmail(e.target.value)}
                    />
                    <button style={buttonStyle} type="submit">Add Student</button>
                </form>
            </div>

            {/* Students List */}
            <div style={cardStyle}>
                <h3>All Students ({students.length})</h3>
                {students.length === 0 ? (
                    <p style={{ color: '#888' }}>No students added yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#1F6BB0', color: 'white' }}>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Class</th>
                                <th style={thStyle}>Guardian</th>
                                <th style={thStyle}>Guardian Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, i) => (
                                <tr key={s.id} style={{ background: i % 2 === 0 ? '#f5f5f5' : 'white' }}>
                                    <td style={tdStyle}>{s.full_name}</td>
                                    <td style={tdStyle}>{s.student_class ? `${s.student_class.name} - ${s.student_class.term}` : '—'}</td>
                                    <td style={tdStyle}>{s.guardians.length > 0 ? s.guardians[0].full_name : '—'}</td>
                                    <td style={tdStyle}>{s.guardians.length > 0 ? s.guardians[0].phone : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// Styles
const cardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '1.5rem',
    marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' };
const buttonStyle = {
    padding: '10px', background: '#1F6BB0', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
};
const thStyle = { padding: '10px', textAlign: 'left' };
const tdStyle = { padding: '10px', borderTop: '1px solid #eee' };

export default Students;