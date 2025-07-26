import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const VideoCall = ({ roomId, userId, userType, onLeave }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize socket
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join-room', { roomId, userId, userType });
      });

      newSocket.on('user-joined', ({ userId: remoteUserId, userType: remoteUserType }) => {
        toast.success(`${remoteUserType} joined the call`);
        createPeerConnection(remoteUserId, true);
      });

      newSocket.on('offer', async ({ offer, fromUserId }) => {
        await handleOffer(offer, fromUserId);
      });

      newSocket.on('answer', async ({ answer, fromUserId }) => {
        await handleAnswer(answer, fromUserId);
      });

      newSocket.on('ice-candidate', async ({ candidate, fromUserId }) => {
        await handleIceCandidate(candidate, fromUserId);
      });

      newSocket.on('user-left', ({ userId: leftUserId }) => {
        handleUserLeft(leftUserId);
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const createPeerConnection = (remoteUserId, isInitiator = false) => {
    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnectionsRef.current[remoteUserId] = peerConnection;

    // Add local stream
    localStreamRef.current.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      setRemoteUsers(prev => {
        const existing = prev.find(user => user.userId === remoteUserId);
        if (existing) {
          return prev.map(user => 
            user.userId === remoteUserId 
              ? { ...user, stream: event.streams[0] }
              : user
          );
        }
        return [...prev, { userId: remoteUserId, stream: event.streams[0] }];
      });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
          targetUserId: remoteUserId
        });
      }
    };

    if (isInitiator) {
      createOffer(remoteUserId);
    }
  };

  const createOffer = async (remoteUserId) => {
    const peerConnection = peerConnectionsRef.current[remoteUserId];
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('offer', {
        roomId,
        offer,
        targetUserId: remoteUserId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer, fromUserId) => {
    createPeerConnection(fromUserId);
    const peerConnection = peerConnectionsRef.current[fromUserId];
    
    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('answer', {
        roomId,
        answer,
        targetUserId: fromUserId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer, fromUserId) => {
    const peerConnection = peerConnectionsRef.current[fromUserId];
    try {
      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate, fromUserId) => {
    const peerConnection = peerConnectionsRef.current[fromUserId];
    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const handleUserLeft = (leftUserId) => {
    if (peerConnectionsRef.current[leftUserId]) {
      peerConnectionsRef.current[leftUserId].close();
      delete peerConnectionsRef.current[leftUserId];
    }
    setRemoteUsers(prev => prev.filter(user => user.userId !== leftUserId));
    toast.info('User left the call');
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const leaveCall = () => {
    cleanup();
    onLeave();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    
    if (socket) {
      socket.emit('leave-room', { roomId, userId });
      socket.disconnect();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold">Video Call</h2>
          <div className="text-white text-sm">
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You ({userType})
            </div>
          </div>

          {/* Remote Videos */}
          {remoteUsers.map((user) => (
            <RemoteVideo key={user.userId} user={user} />
          ))}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 flex justify-center space-x-4">
          <button
            onClick={toggleVideo}
            className={`px-4 py-2 rounded-lg ${
              isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
          >
            {isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
          </button>
          
          <button
            onClick={toggleAudio}
            className={`px-4 py-2 rounded-lg ${
              isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
          >
            {isAudioEnabled ? 'Mute' : 'Unmute'}
          </button>
          
          <button
            onClick={leaveCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>
    </div>
  );
};

const RemoteVideo = ({ user }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && user.stream) {
      videoRef.current.srcObject = user.stream;
    }
  }, [user.stream]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        Remote User
      </div>
    </div>
  );
};

export default VideoCall;
