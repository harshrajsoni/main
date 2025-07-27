// Frontend/src/pages/recruiterDashboard/ScheduledCallsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchRecruiterRequestsThunk } from '../../store/slice/videoCallRequestSlice';
import VideoCall from '../../components/VideoCall';

const ScheduledCallsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { requests: videoRequests, loading } = useSelector(state => state.videoCallRequests);
    const { user } = useSelector(state => state.user);
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        dispatch(fetchRecruiterRequestsThunk());
    }, [dispatch]);

    // Filter for scheduled and active calls
    const scheduledCalls = videoRequests.filter(r => r.status === 'scheduled' || r.status === 'active');

    const joinCall = async (callId) => {
        try {
            const response = await fetch('/api/request-video-call/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ requestId: callId })
            });
            const data = await response.json();
            if (response.ok) {
                setActiveCall({
                    roomId: data.roomId,
                    callId: callId
                });
            } else {
                alert('Failed to join call: ' + data.message);
            }
        } catch (error) {
            console.error('Error joining call:', error);
            alert('Failed to join call');
        }
    };

    const leaveCall = () => {
        setActiveCall(null);
        // Refresh the video call list when returning from a call
        dispatch(fetchRecruiterRequestsThunk());
    };

    if (activeCall) {
        return (
            <VideoCall
                roomId={activeCall.roomId}
                userId={user?._id}
                userType="recruiter"
                onLeave={leaveCall}
            />
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/recruiter-dashboard')}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        marginRight: '1rem',
                        color: '#666'
                    }}
                >
                    ←
                </button>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>
                    📹 Scheduled Video Calls
                </h1>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading scheduled calls...
                </div>
            )}

            {!loading && scheduledCalls.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    color: '#666'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h3>No Scheduled Video Calls</h3>
                    <p>You don't have any scheduled video calls yet.</p>
                </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {scheduledCalls.map(call => (
                    <div key={call._id} style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'box-shadow 0.2s'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600, color: '#333' }}>
                                    {call.collegeId?.collegeName || call.collegeId?.name || 'College'}
                                </h3>
                                <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.95rem' }}>
                                    {call.collegeId?.email}
                                </p>
                            </div>
                            <div style={{
                                background: '#e8f5e9',
                                color: '#388e3c',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                Scheduled
                            </div>
                        </div>

                        {call.scheduledTime && (
                            <div style={{ 
                                background: '#f0f7ff',
                                border: '1px solid #e3f2fd',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🕒</span>
                                    <strong>Scheduled Time:</strong>
                                    <span style={{ color: '#1976d2', fontWeight: 600 }}>
                                        {new Date(call.scheduledTime).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {call.studentIds && call.studentIds.length > 0 && (
                            <div>
                                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', color: '#555' }}>
                                    Selected Students ({call.studentIds.length}):
                                </h4>
                                <div style={{ display: 'grid', gap: '0.75rem' }}>
                                    {call.studentIds.map(student => (
                                        <div key={student._id} style={{
                                            background: '#fafafa',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: '#e3e3e3',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                color: '#555'
                                            }}>
                                                {student.name ? student.name[0].toUpperCase() : 'S'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                                    {student.name}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                    {student.rollNumber} • {student.course}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                    {student.email}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ 
                            marginTop: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #f0f0f0',
                            fontSize: '0.85rem',
                            color: '#888'
                        }}>
                            Request created: {new Date(call.createdAt).toLocaleString()}
                        </div>
                        <div style={{ 
                            marginTop: '1.5rem',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem'
                        }}>
                            <button
                                onClick={() => joinCall(call._id)}
                                style={{
                                    background: '#4caf50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#45a049'}
                                onMouseOut={e => e.currentTarget.style.background = '#4caf50'}
                            >
                                🎥 Join Video Call
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduledCallsPage;
