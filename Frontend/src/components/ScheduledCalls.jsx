import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import VideoCall from './VideoCall';

const ALWAYS_ALLOW_JOIN = true; // set to false for production

const ScheduledCalls = () => {
    const [scheduledCalls, setScheduledCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCall, setActiveCall] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchScheduledCalls();
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('/api/user/profile', { withCredentials: true });
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const fetchScheduledCalls = async () => {
        try {
            const response = await axios.get('/api/request-video-call/scheduled-calls', {
                withCredentials: true
            });
            setScheduledCalls(response.data.scheduledCalls);
        } catch (error) {
            console.error('Error fetching scheduled calls:', error);
            toast.error('Failed to fetch scheduled calls');
        } finally {
            setLoading(false);
        }
    };

    const joinCall = async (callId) => {
        try {
            const response = await axios.post('/api/request-video-call/join',
                { requestId: callId },
                { withCredentials: true }
            );

            setActiveCall({
                roomId: response.data.roomId,
                callId: callId
            });
            toast.success('Joined video call successfully');
        } catch (error) {
            console.error('Error joining call:', error);
            toast.error(error.response?.data?.message || 'Failed to join call');
        }
    };

    const leaveCall = () => {
        setActiveCall(null);
        fetchScheduledCalls(); // Refresh the list
    };

    const isCallTime = (scheduledTime) => {
        const now = new Date();
        const callTime = new Date(scheduledTime);
        const timeDiff = Math.abs(now - callTime);
        const tenMinutes = 10 * 60 * 1000;
        return timeDiff <= tenMinutes;
    };

    if (activeCall) {
        return (
            <VideoCall
                roomId={activeCall.roomId}
                userId={user?._id}
                userType={user?.userType}
                onLeave={leaveCall}
            />
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Scheduled Video Calls</h2>

            {scheduledCalls.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No scheduled calls found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {scheduledCalls.map(call => (
                        <div key={call._id} className="bg-white rounded-lg shadow-md p-6 border">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {user?.userType === 'recruiter' ? call.collegeId?.name : call.recruiterId?.companyName}
                                    </h3>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p><strong>Scheduled Time:</strong> {new Date(call.scheduledTime).toLocaleString()}</p>
                                        <p><strong>Status:</strong>
                                            <span className={`ml-1 px-2 py-1 rounded text-xs ${call.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                    call.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {call.status}
                                            </span>
                                        </p>

                                        {call.studentIds && call.studentIds.length > 0 && (
                                            <p><strong>Students:</strong> {call.studentIds.map(s => s.name).join(', ')}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-4">
                                    {(ALWAYS_ALLOW_JOIN || isCallTime(call.scheduledTime)) ? (
                                        <button
                                            onClick={() => joinCall(call._id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Join Call
                                        </button>
                                    ) : (
                                        <div className="text-sm text-gray-500">
                                            Waiting for scheduled time
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScheduledCalls;
