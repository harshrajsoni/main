import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCollegeRequestsThunk } from '../../store/slice/videoCallRequestSlice';
import { useNavigate } from 'react-router-dom';

const CollegeScheduledCallsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { requests: videoRequests, loading: videoLoading } = useSelector(state => state.videoCallRequests);

    useEffect(() => {
        dispatch(fetchCollegeRequestsThunk());
    }, [dispatch]);

    return (
        <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '40px 0' }}>
            <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, position: 'relative' }}>
                <button
                    onClick={() => navigate('/college-dashboard')}
                    style={{
                        position: 'absolute', left: 24, top: 24, background: 'none', border: 'none', color: '#1976d2', fontWeight: 600, fontSize: 16, cursor: 'pointer',
                    }}
                >
                    &larr; Back
                </button>
                <h2 style={{ textAlign: 'center', margin: 0, marginBottom: 28, fontWeight: 700, fontSize: '1.7rem' }}>
                    <span role="img" aria-label="video">📹</span> All Video Call Requests
                </h2>
                {videoLoading ? (
                    <div style={{ textAlign: 'center', padding: 24 }}>Loading...</div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {videoRequests.length === 0 && <li style={{ color: '#888', textAlign: 'center' }}>No video call requests.</li>}
                        {videoRequests.map(req => (
                            <li key={req._id} style={{
                                border: '1px solid #eee',
                                borderRadius: 10,
                                marginBottom: 14,
                                padding: '14px 18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                background: '#fafbfc',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                transition: 'box-shadow 0.2s',
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: '#e3e3e3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: 18, color: '#555'
                                }}>
                                    {req.recruiterId?.name ? req.recruiterId.name[0].toUpperCase() : 'R'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{req.recruiterId?.name || req.recruiterId}</div>
                                    <div style={{ fontSize: 13, color: '#888' }}>
                                        {req.recruiterId?.email && <span>{req.recruiterId.email}</span>}
                                    </div>
                                    <div style={{ marginTop: 4 }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 10px',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            background: req.status === 'pending' ? '#fff3e0'
                                                : req.status === 'accepted' ? '#e3f2fd'
                                                : '#e8f5e9',
                                            color: req.status === 'pending' ? '#ff9800'
                                                : req.status === 'accepted' ? '#1976d2'
                                                : '#388e3c',
                                            marginRight: 8
                                        }}>
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </span>
                                        {req.scheduledTime && (
                                            <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 500 }}>
                                                <span role="img" aria-label="clock">🕒</span> {new Date(req.scheduledTime).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div style={{ marginTop: 32, textAlign: 'center', color: '#888', fontSize: 15 }}>
                    <b>Test Requests</b> (coming soon...)
                </div>
            </div>
        </div>
    );
};

export default CollegeScheduledCallsPage; 