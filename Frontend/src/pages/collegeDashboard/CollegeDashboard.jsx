import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecruitersThunk } from '../../store/slice/fetchRecruiterSlice';
import { fetchConversationsThunk } from '../../store/slice/conversationSlice';
import { getMessageThunk, sendMessageThunk } from '../../store/slice/messageSlice';
import { getProfile } from "../../store/slice/userSlice"; // adjust path as needed
import { createConversationThunk } from '../../store/slice/conversationSlice'; // Added for new conversation creation
import { logoutUser } from "../../store/slice/userSlice"; // adjust path if needed
import { fetchCollegeRequestsThunk, acceptVideoCallRequestThunk, scheduleVideoCallThunk } from '../../store/slice/videoCallRequestSlice';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const stripAllQuotes = str => str.replace(/"/g, '');

const CollegeDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we're on a nested route
    const isNestedRoute = location.pathname !== '/college-dashboard';

    // Recruiters state (Redux)
    const { recruiters,
        loading: recruitersLoading,
        error: recruitersError
    } = useSelector(state => state.recruiters);

    // Conversations state (Redux)
    const { conversations,
        loading: conversationsLoading,
        error: conversationsError
    } = useSelector(state => state.conversations);

    // Messages state (Redux)
    const { messages,
        loading: messagesLoading,
        error: messagesError
    } = useSelector(state => state.messages);

    // User state (Redux)
    const { user,
        loading: userLoading
    } = useSelector(state => state.user);

    // Video call requests state
    const { requests: videoRequests, loading: videoLoading } = useSelector(state => state.videoCallRequests);

    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [selectedRecruiterId, setSelectedRecruiterId] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [scheduleModal, setScheduleModal] = useState({ open: false, requestId: null });
    const [scheduleTime, setScheduleTime] = useState('');

    useEffect(() => {
        dispatch(fetchRecruitersThunk());
        dispatch(fetchConversationsThunk());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getProfile());
    }, [dispatch]);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (selectedConversationId) {
            dispatch(getMessageThunk(selectedConversationId));
        }
    }, [dispatch, selectedConversationId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Fetch video call requests on mount
    useEffect(() => {
        dispatch(fetchCollegeRequestsThunk());
    }, [dispatch]);

    // Defensive helper to get recruiter name from conversation
    const getRecruiterName = (conv) => {
        const recruiter = conv?.participants?.find(
            p => p?.participantModel === "Recruiter"
        );
        return recruiter?.participantId?.name || "Unknown Recruiter";
    };

    const selectedConversation = conversations.find(conv => conv._id === selectedConversationId);

    // Handler for sending a message
    const handleSendMessage = () => {
        if (!user) return;

        // For college members, use collegeId as senderId, otherwise use user's own id
        const senderId = user.collegeId || user._id || user.id;
        const senderModel = user.userType.charAt(0).toUpperCase() + user.userType.slice(1); // Capitalize first letter


        dispatch(sendMessageThunk({
            conversationId: selectedConversationId,
            senderId: senderId,
            senderModel: senderModel,
            message: newMessage
        }));
        setNewMessage("");
    };

    const recruiterObj = (recruiters || []).find(
        r => r && r._id && r._id === selectedRecruiterId
    );
    const recruiterName = recruiterObj?.name || "this recruiter";

    const handleRecruiterClick = async (recruiter) => {
        if (!user) return;

        // Check if a conversation with this recruiter already exists
        const existingConv = conversations.find(conv =>
            conv.participants.some(
                p => p.participantModel === 'Recruiter' &&
                    String(p.participantId._id || p.participantId) === String(recruiter._id)
            )
        );
        if (existingConv) {
            setSelectedConversationId(existingConv._id);
            return;
        }
        // Otherwise, create a new conversation
        const participants = [
            { participantId: user.collegeId || user._id || user.id, participantModel: 'College', role: user.role || 'admin' },
            { participantId: recruiter._id, participantModel: 'Recruiter' }
        ];
        const resultAction = await dispatch(createConversationThunk(participants));
        if (createConversationThunk.fulfilled.match(resultAction)) {
            const newConv = resultAction.payload;
            setSelectedConversationId(newConv._id);
        }
    };

    const handleMenuClick = () => setMenuOpen(open => !open);

    const handleLogout = () => {
        setMenuOpen(false);
        dispatch(logoutUser());
        window.location.href = "/login"; // Optional: redirect to login page
    };

    if (userLoading) return <div>Loading...</div>;
    if (!user) return <div>Please log in.</div>;

    // If we're on a nested route, render the nested component
    if (isNestedRoute) {
        return <Outlet />;
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Top right controls */}
            <div style={{
                position: 'absolute',
                top: '24px',
                right: '32px',
                zIndex: 11,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 12,
            }}>
                <button
                    style={{
                        background: '#fff',
                        color: '#1976d2',
                        border: '1.5px solid #1976d2',
                        borderRadius: 10,
                        padding: '8px 18px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                        transition: 'background 0.2s',
                    }}
                    onClick={() => navigate('/college-dashboard/scheduled-calls')}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="7" width="13" height="10" rx="2" fill="#1976d2" fillOpacity="0.12" />
                        <rect x="3" y="7" width="13" height="10" rx="2" stroke="#1976d2" strokeWidth="1.5" />
                        <polygon points="19,7 23,10 23,14 19,17" fill="#1976d2" fillOpacity="0.3" />
                    </svg>
                    Show Scheduled Video Calls
                </button>
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
                        marginRight: '12px',
                        position: 'relative',
                    }}
                    onClick={() => setVideoModalOpen(true)}
                    aria-label="Video call requests"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#222">
                        <rect x="3" y="7" width="13" height="10" rx="2" />
                        <polygon points="19,7 23,10 23,14 19,17" fill="#222" />
                    </svg>
                    {/* Badge for pending requests */}
                    {videoRequests.filter(r => r.status === 'pending').length > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            background: '#d32f2f',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                        }}>
                            {videoRequests.filter(r => r.status === 'pending').length}
                        </span>
                    )}
                </button>
                <button
                    style={{
                        background: '#f9f9f9', // match your card bg
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
            {/* Left Sidebar (Conversations with Recruiters) */}
            <div style={{ width: '30%', borderRight: '1px solid #ddd', padding: '1rem', boxSizing: 'border-box' }}>
                <h2>Your Conversations</h2>
                {conversationsLoading && <p>Loading conversations...</p>}
                {conversationsError && <p style={{ color: 'red' }}>{conversationsError}</p>}
                <ul>
                    {(conversations || [])
                        .filter(conv => conv && conv.messages && conv.messages.length > 0) // Only show conversations with messages
                        .map((conv) => (
                        <li
                            key={conv?._id || Math.random()}
                            style={{ cursor: 'pointer', fontWeight: selectedConversationId === conv?._id ? 'bold' : 'normal' }}
                            onClick={() => setSelectedConversationId(conv?._id)}
                        >
                            {getRecruiterName(conv)}
                        </li>
                    ))}
                </ul>
            </div>
            {/* Right Main Content (All Recruiters or Chat) */}
            <div style={{ flex: 1, padding: '1rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                {selectedConversation ? (
                    <>
                        <h2>Chat</h2>
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                            {messagesLoading && <p>Loading messages...</p>}
                            {messagesError && <p style={{ color: 'red' }}>{messagesError}</p>}
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {(messages || []).map(msg => {
                                    // For college members, check if message is from their college
                                    const userId = stripAllQuotes(String(user?.collegeId || user?._id || user?.id || '').trim());
                                    const userType = stripAllQuotes(((user?.userType || '').charAt(0).toUpperCase() + (user?.userType || '').slice(1)).trim());
                                    const msgSenderId = stripAllQuotes(String(msg?.senderId || '').trim());
                                    const msgSenderModel = stripAllQuotes(String(msg?.senderModel || '').trim());

                                    const isOwnMessage = msgSenderId === userId && msgSenderModel === userType;

                                    // Debug log
                                    console.log({
                                        msgSenderId: msgSenderId,
                                        userId: userId,
                                        msgSenderModel: msgSenderModel,
                                        userType: userType,
                                        isOwnMessage: isOwnMessage,
                                        msg: msg,
                                        // msgSenderIdType: typeof msgSenderId,
                                        // userIdType: typeof userId,
                                        // msgSenderModelType: typeof msgSenderModel,
                                        // userTypeType: typeof userType,
                                        // msgSenderIdRaw: JSON.stringify(msgSenderId),
                                        // userIdRaw: JSON.stringify(userId),
                                        // msgSenderModelRaw: JSON.stringify(msgSenderModel),
                                        // userTypeRaw: JSON.stringify(userType),
                                    });

                                    return (
                                        <li
                                            key={msg && msg._id ? msg._id : Math.random()}
                                            style={{
                                                display: 'flex',
                                                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                                margin: '8px 0'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    background: isOwnMessage ? '#dcf8c6' : '#f1f0f0',
                                                    color: '#222',
                                                    borderRadius: 16,
                                                    padding: '8px 12px',
                                                    maxWidth: '70%',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {msg?.message}
                                                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                                                    {msg?.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </span>
                                        </li>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </ul>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message"
                                style={{ flex: 1, padding: 8, borderRadius: 16, border: '1px solid #ccc' }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{ padding: '8px 16px', borderRadius: 16, background: '#4caf50', color: '#fff', border: 'none' }}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>All Recruiters</h2>
                        {recruitersLoading && <p>Loading recruiters...</p>}
                        {recruitersError && <p style={{ color: 'red' }}>{recruitersError}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                            {(recruiters || []).map((recruiter) => (
                                <div
                                    key={recruiter && recruiter._id ? recruiter._id : Math.random()}
                                    onClick={() => handleRecruiterClick(recruiter)}
                                    style={{
                                        cursor: 'pointer',
                                        background: '#f9f9f9',
                                        border: '1px solid #ddd',
                                        borderRadius: '12px',
                                        padding: '20px 24px',
                                        minWidth: '180px',
                                        marginBottom: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        fontWeight: 500,
                                        fontSize: '1.1rem',
                                        textAlign: 'center',
                                        flex: '0 1 calc(33% - 16px)'
                                    }}
                                >
                                    {recruiter && recruiter.name ? recruiter.name : "Unknown Recruiter"}
                                </div>
                            ))}
                        </div>
                        {selectedRecruiterId && (
                            <div style={{ marginTop: '1rem' }}>
                                <h3>Conversations with {recruiterName}</h3>
                                {conversationsLoading && <p>Loading conversations...</p>}
                                {conversationsError && <p style={{ color: 'red' }}>{conversationsError}</p>}
                                <ul>
                                    {(conversations || []).filter(conv => {
                                        if (!conv || !Array.isArray(conv.participants)) return false;
                                        const recruiterParticipant = conv.participants.find(
                                            p => p && p.participantModel === "Recruiter" && p.participantId && p.participantId._id
                                        );
                                        return recruiterParticipant && recruiterParticipant.participantId._id === selectedRecruiterId;
                                    }).map(conv => (
                                        <li
                                            key={conv && conv._id ? conv._id : Math.random()}
                                            onClick={() => conv && conv._id && setSelectedConversationId(conv._id)}
                                        >
                                            {getRecruiterName(conv)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* Video Call Requests Modal */}
            {videoModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} onClick={() => setVideoModalOpen(false)}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: 28,
                        minWidth: 400,
                        maxWidth: '90vw',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        position: 'relative',
                        animation: 'fadeIn 0.2s',
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: 0, marginBottom: 20, fontWeight: 700, fontSize: '1.3rem' }}>
                            <span role="img" aria-label="video">📹</span> Video Call Requests
                        </h3>
                        {videoLoading ? (
                            <div style={{ textAlign: 'center', padding: 24 }}>
                                Loading...
                            </div>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {videoRequests.length === 0 && <li style={{ color: '#888', textAlign: 'center' }}>No requests.</li>}
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
                                                {req.status === 'scheduled' && req.scheduledTime && (
                                                    <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 500 }}>
                                                        <span role="img" aria-label="clock">🕒</span> {new Date(req.scheduledTime).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {req.status === 'pending' && (
                                            <button
                                                style={{
                                                    background: '#4caf50', color: '#fff', border: 'none', borderRadius: 8,
                                                    padding: '8px 14px', fontWeight: 600, cursor: 'pointer'
                                                }}
                                                onClick={() => dispatch(acceptVideoCallRequestThunk({ requestId: req._id }))}
                                                disabled={videoLoading}
                                            >Accept</button>
                                        )}
                                        {req.status === 'accepted' && (
                                            <button
                                                style={{
                                                    background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8,
                                                    padding: '8px 14px', fontWeight: 600, cursor: 'pointer'
                                                }}
                                                onClick={() => setScheduleModal({ open: true, requestId: req._id })}
                                                disabled={videoLoading}
                                            >Schedule</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button style={{
                            position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
                            fontSize: 22, cursor: 'pointer', color: '#888'
                        }} onClick={() => setVideoModalOpen(false)} aria-label="Close">&times;</button>
                    </div>
                </div>
            )}
            {/* Schedule Modal */}
            {scheduleModal.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.2)',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} onClick={() => setScheduleModal({ open: false, requestId: null })}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 12,
                        padding: 24,
                        minWidth: 320,
                        maxWidth: '90vw',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        position: 'relative',
                    }} onClick={e => e.stopPropagation()}>
                        <h4>Schedule Video Call</h4>
                        <input
                            type="datetime-local"
                            value={scheduleTime}
                            onChange={e => setScheduleTime(e.target.value)}
                            style={{ width: '100%', padding: 8, marginBottom: 16 }}
                        />
                        <button
                            onClick={() => {
                                dispatch(scheduleVideoCallThunk({ requestId: scheduleModal.requestId, scheduledTime: scheduleTime }));
                                setScheduleModal({ open: false, requestId: null });
                                setScheduleTime('');
                            }}
                            style={{ padding: '8px 16px', borderRadius: 8, background: '#4caf50', color: '#fff', border: 'none' }}
                        >
                            Schedule
                        </button>
                        <button style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }} onClick={() => setScheduleModal({ open: false, requestId: null })}>&times;</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollegeDashboard;
