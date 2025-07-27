// Frontend/src/pages/studentDashboard/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentVideoCallsThunk, clearError } from '../../store/slice/studentVideoCallSlice';
import { getProfile, logoutUser } from '../../store/slice/userSlice';
import VideoCall from '../../components/VideoCall';

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);
    const { videoCalls, loading, error } = useSelector(state => state.studentVideoCalls);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeCall, setActiveCall] = useState(null);

    useEffect(() => {
        dispatch(getProfile());
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            dispatch(fetchStudentVideoCallsThunk());
        }
    }, [user, dispatch]);

    useEffect(() => {
        // Clear error when component unmounts
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleMenuClick = () => setMenuOpen(open => !open);

    const handleLogout = () => {
        setMenuOpen(false);
        dispatch(logoutUser());
        window.location.href = "/login";
    };

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
        dispatch(fetchStudentVideoCallsThunk());
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    if (activeCall) {
        return (
            <VideoCall
                roomId={activeCall.roomId}
                userId={user._id}
                userType="student"
                onLeave={leaveCall}
            />
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            {/* Three-dot menu button */}
            <div style={{
                position: 'absolute',
                top: '24px',
                right: '32px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px',
            }}>
                <button
                    style={{
                        background: '#f9f9f9',
                        border: '1px solid #ddd',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onClick={handleMenuClick}
                    aria-label="More options"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#222">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
                {menuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: '48px',
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        minWidth: '120px',
                        padding: '8px 0'
                    }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                padding: '10px 16px',
                                textAlign: 'left',
                                color: '#d32f2f',
                                fontWeight: 500,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                borderRadius: '8px',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#f9f9f9'}
                            onMouseOut={e => e.currentTarget.style.background = 'none'}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
                📹 My Video Calls
            </h1>

            {loading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading video calls...
                </div>
            )}

            {error && (
                <div style={{
                    color: '#d32f2f',
                    background: '#ffebee',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                }}>
                    Error: {error}
                </div>
            )}

            {!loading && !error && videoCalls.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    background: '#f9f9f9',
                    borderRadius: '12px',
                    color: '#666'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h3>No Video Calls</h3>
                    <p>You don't have any scheduled video calls yet.</p>
                </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {videoCalls.map(call => (
                    <div key={call._id} style={{
                        background: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 600, color: '#333' }}>
                                    {call.recruiterId?.companyName || 'Company'}
                                </h3>
                                <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.95rem' }}>
                                    Recruiter: {call.recruiterId?.name} ({call.recruiterId?.email})
                                </p>
                            </div>
                            <div style={{
                                background: call.status === 'scheduled' ? '#e8f5e9' : call.status === 'active' ? '#e3f2fd' : '#fff3e0',
                                color: call.status === 'scheduled' ? '#388e3c' : call.status === 'active' ? '#1976d2' : '#f57c00',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                            }}>
                                {call.status}
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

                        <div style={{
                            marginTop: '1rem',
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
                            {(call.status === 'scheduled' || call.status === 'active') && (
                                <button
                                    onClick={() => joinCall(call._id)}
                                    style={{
                                        background: '#4caf50',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#45a049'}
                                    onMouseOut={e => e.currentTarget.style.background = '#4caf50'}
                                >
                                    <span>📹</span>
                                    Join Video Call
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
