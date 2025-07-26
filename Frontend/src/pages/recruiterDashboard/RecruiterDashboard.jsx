import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCollegesThunk } from '../../store/slice/fetchCollegeSlice';
import { fetchConversationsThunk, createConversationThunk } from '../../store/slice/conversationSlice';
import { getMessageThunk, sendMessageThunk } from '../../store/slice/messageSlice';
import { getProfile } from '../../store/slice/userSlice';
import { logoutUser } from "../../store/slice/userSlice";
import { requestVideoCallThunk } from '../../store/slice/videoCallRequestSlice';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import StudentSelectionModal from '../../components/StudentSelectionModal';

const RecruiterDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [showScheduledModal, setShowScheduledModal] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);

    // Check if we're on a nested route
    const isNestedRoute = location.pathname !== '/recruiter-dashboard';

    // Redux state
    const { colleges,
        loading: collegesLoading,
        error: collegesError
    } = useSelector(state => state.colleges);

    const { conversations,
        loading: conversationsLoading,
        error: conversationsError
    } = useSelector(state => state.conversations);

    const { messages,
        loading: messagesLoading,
        error: messagesError
    } = useSelector(state => state.messages);

    const { user } = useSelector(state => state.user);
    const { requests: videoRequests, loading: videoLoading, error: videoError } = useSelector(state => state.videoCallRequests);

    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    // Load profile, colleges, and conversations on mount
    useEffect(() => {
        dispatch(getProfile());
        dispatch(fetchCollegesThunk());
        dispatch(fetchConversationsThunk());
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

    // Helper to get college name from conversation
    const getCollegeName = (conv) => {
        const collegeParticipant = conv.participants.find(p => p.participantModel === "College");
        const college = colleges.find(c => c._id === (collegeParticipant?.participantId?._id || collegeParticipant?.participantId));
        return college?.name || collegeParticipant?.participantId?.collegeName || "Unknown College";
    };

    // Find the collegeId for the selected conversation
    const selectedConversation = conversations.find(conv => conv._id === selectedConversationId);
    let collegeId = null;
    if (selectedConversation) {
        const collegeParticipant = selectedConversation.participants.find(p => p.participantModel === 'College');
        collegeId = collegeParticipant?.participantId?._id || collegeParticipant?.participantId;
    }
    // Check if a request already exists for this conversation
    const alreadyRequested = videoRequests && selectedConversationId && videoRequests.some(r => r.conversationId === selectedConversationId);

    // Only show scheduled video calls for this recruiter
    const scheduledCalls = videoRequests.filter(r => r.status === 'scheduled');

    // Handler for sending a message
    const handleSendMessage = () => {
        if (!user)
            return;

        dispatch(sendMessageThunk({
            conversationId: selectedConversationId,
            senderId: user._id || user.id,
            senderModel: "Recruiter",
            message: newMessage
        }));
        setNewMessage("");
    };

    // Handler to start/select a conversation with a college
    const handleCollegeClick = async (college) => {
        if (!user)
            return;

        // Check if a conversation with this college already exists
        const existingConv = conversations.find(conv =>
            conv.participants.some(
                p => p.participantModel === 'College' &&
                    p.participantId &&
                    String(p.participantId._id || p.participantId) === String(college._id)
            )
        );
        if (existingConv) {
            setSelectedConversationId(existingConv._id);
            return;
        }
        // Otherwise, create a new conversation
        const participants = [
            { participantId: user._id || user.id, participantModel: 'Recruiter' },
            { participantId: college._id, participantModel: 'College', role: 'admin' }
        ];
        const resultAction = await dispatch(createConversationThunk(participants));
        if (createConversationThunk.fulfilled.match(resultAction)) {
            // The new conversation will be added to conversations via Redux, so just select it
            const newConv = resultAction.payload;
            setSelectedConversationId(newConv._id);
        }
    };

    const handleMenuClick = () => setMenuOpen(open => !open);
    const handleLogout = () => {
        setMenuOpen(false);
        dispatch(logoutUser());
        window.location.href = "/login";
    };

    // Show loading while user is being fetched
    if (!user) {
        return <div>Loading...</div>;
    }

    // If we're on a nested route, render the nested component
    if (isNestedRoute) {
        return <Outlet />;
    }

    return (
        <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
            {/* Three-dot menu button and video call controls */}
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                            {selectedConversation && !alreadyRequested && (
                                <button
                                    style={{
                                        background: '#1976d2',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 10,
                                        padding: '8px 18px',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        marginTop: 8,
                                        transition: 'background 0.2s',
                                    }}
                                    onClick={() => setShowStudentModal(true)}
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="7" width="13" height="10" rx="2" fill="#fff" fillOpacity="0.15" />
                                        <rect x="3" y="7" width="13" height="10" rx="2" stroke="#fff" strokeWidth="1.5" />
                                        <polygon points="19,7 23,10 23,14 19,17" fill="#fff" fillOpacity="0.5" />
                                    </svg>
                                    Request Video Call
                                </button>
                            )}
                            {/* Show Scheduled Video Calls Button */}
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
                                    marginTop: 8,
                                    transition: 'background 0.2s',
                                }}
                                onClick={() => navigate('/recruiter-dashboard/scheduled-calls')}
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="7" width="13" height="10" rx="2" fill="#1976d2" fillOpacity="0.12" />
                                    <rect x="3" y="7" width="13" height="10" rx="2" stroke="#1976d2" strokeWidth="1.5" />
                                    <polygon points="19,7 23,10 23,14 19,17" fill="#1976d2" fillOpacity="0.3" />
                                </svg>
                                Show Scheduled Video Calls
                            </button>
                            {statusMsg && (
                                <div style={{
                                    color: statusMsg.startsWith('Error') ? '#d32f2f' : '#388e3c',
                                    fontWeight: 500,
                                    marginTop: 4,
                                    fontSize: '0.97rem'
                                }}>
                                    {statusMsg}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {/* Scheduled Video Calls Modal */}
            {showScheduledModal && (
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
                }} onClick={() => setShowScheduledModal(false)}>
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
                            <span role="img" aria-label="video">📹</span> Scheduled Video Calls
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {scheduledCalls.length === 0 && <li style={{ color: '#888', textAlign: 'center' }}>No scheduled calls.</li>}
                            {scheduledCalls.map(call => (
                                <li key={call._id} style={{
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
                                        {call.collegeId?.name ? call.collegeId.name[0].toUpperCase() : 'C'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>{call.collegeId?.name || call.collegeId}</div>
                                        <div style={{ fontSize: 13, color: '#888' }}>
                                            {call.collegeId?.email && <span>{call.collegeId.email}</span>}
                                        </div>
                                        <div style={{ marginTop: 4 }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 10px',
                                                borderRadius: 8,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: '#e8f5e9',
                                                color: '#388e3c',
                                                marginRight: 8
                                            }}>
                                                Scheduled
                                            </span>
                                            {call.scheduledTime && (
                                                <span style={{ fontSize: 12, color: '#388e3c', fontWeight: 500 }}>
                                                    <span role="img" aria-label="clock">🕒</span> {new Date(call.scheduledTime).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button style={{
                            position: 'absolute', top: 12, right: 16, background: 'none', border: 'none',
                            fontSize: 22, cursor: 'pointer', color: '#888'
                        }} onClick={() => setShowScheduledModal(false)} aria-label="Close">&times;</button>
                    </div>
                </div>
            )}
            {/* Left Sidebar (Conversations) */}
            <div style={{ width: '30%', borderRight: '1px solid #ddd', padding: '1rem', boxSizing: 'border-box' }}>
                <h2>Your Conversations</h2>
                {conversationsLoading && <p>Loading conversations...</p>}
                {conversationsError && <p style={{ color: 'red' }}>{conversationsError}</p>}
                <ul>
                    {conversations
                        .filter(conv => conv.messages && conv.messages.length > 0) // Only show conversations with messages
                        .map((conv) => (
                        <li
                            key={conv._id}
                            style={{ cursor: 'pointer', fontWeight: selectedConversationId === conv._id ? 'bold' : 'normal' }}
                            onClick={() => setSelectedConversationId(conv._id)}
                        >
                            {getCollegeName(conv)}
                        </li>
                    ))}
                </ul>
            </div>
            {/* Right Main Content (Conversation details or Colleges) */}
            <div style={{ flex: 1, padding: '1rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                {selectedConversation ? (
                    <>
                        <h2>Chat</h2>
                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
                            {messagesLoading && <p>Loading messages...</p>}
                            {messagesError && <p style={{ color: 'red' }}>{messagesError}</p>}
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {messages.map(msg => {
                                    const isOwnMessage = (user?._id || user?.id) === msg?.senderId && msg?.senderModel === "Recruiter";

                                    return (
                                        <li
                                            key={msg._id}
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
                                                {msg.message}
                                                <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <h2>All Colleges</h2>
                        {collegesLoading && <p>Loading colleges...</p>}
                        {collegesError && <p style={{ color: 'red' }}>{collegesError}</p>}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                            {colleges.map((college) => (
                                <div
                                    key={college._id}
                                    onClick={() => handleCollegeClick(college)}
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
                                    {college.name}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
            <StudentSelectionModal
                isOpen={showStudentModal}
                onClose={() => setShowStudentModal(false)}
                college={colleges.find(c => c._id === collegeId)}
                conversationId={selectedConversationId}
            />
        </div>
    );
};

export default RecruiterDashboard;
