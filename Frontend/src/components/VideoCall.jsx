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
  const socketRef = useRef(null);

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
      // Initialize socket FIRST
      console.log('Initializing socket connection...');
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('Socket connected, joining room:', roomId);
        setIsConnected(true);
        // Add a small delay before joining room to ensure connection is stable
        setTimeout(() => {
          newSocket.emit('join-room', { roomId, userId, userType });
        }, 100);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Try to get user media with fallback options
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (mediaError) {
        console.log('Failed to get video and audio, trying video only:', mediaError);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (videoError) {
          console.log('Failed to get video, trying audio only:', videoError);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true
            });
          } catch (audioError) {
            console.log('Failed to get any media, continuing without media:', audioError);
            // Try to get any available media devices
            try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videoDevices = devices.filter(device => device.kind === 'videoinput');
              const audioDevices = devices.filter(device => device.kind === 'audioinput');
              
              console.log('Available video devices:', videoDevices.length);
              console.log('Available audio devices:', audioDevices.length);
              
              // Try with specific device constraints if available
              if (videoDevices.length > 0 || audioDevices.length > 0) {
                const constraints = {};
                if (videoDevices.length > 0) constraints.video = { deviceId: videoDevices[0].deviceId };
                if (audioDevices.length > 0) constraints.audio = { deviceId: audioDevices[0].deviceId };
                
                stream = await navigator.mediaDevices.getUserMedia(constraints);
              } else {
                stream = null;
              }
            } catch (deviceError) {
              console.log('Failed to enumerate devices:', deviceError);
              stream = null;
            }
          }
        }
      }
      
      if (stream) {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        // Create a placeholder video element or show a message
        console.log('No media stream available, showing placeholder');
        
        // Create a dummy stream for peer connection (optional)
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, 640, 480);
          ctx.fillStyle = '#fff';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('No Camera', 320, 240);
          
          const dummyStream = canvas.captureStream();
          localStreamRef.current = dummyStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = dummyStream;
          }
        } catch (error) {
          console.log('Could not create dummy stream:', error);
        }
      }

      newSocket.on('user-joined', ({ userId: remoteUserId, userType: remoteUserType }) => {
        console.log('User joined:', { remoteUserId, remoteUserType });
        toast.success(`${remoteUserType} joined the call`);
        
        // Ensure socket is available before creating peer connection
        if (socketRef.current && socketRef.current.connected) {
          // Add a small delay to ensure everything is ready
          setTimeout(() => {
            createPeerConnection(remoteUserId, true);
          }, 200);
        } else {
          console.error('Socket not connected, cannot create peer connection');
        }
      });

      newSocket.on('offer', async ({ offer, fromUserId }) => {
        console.log('Received offer from:', fromUserId);
        await handleOffer(offer, fromUserId);
      });

      newSocket.on('answer', async ({ answer, fromUserId }) => {
        console.log('Received answer from:', fromUserId);
        await handleAnswer(answer, fromUserId);
      });

      newSocket.on('ice-candidate', async ({ candidate, fromUserId }) => {
        console.log('Received ICE candidate from:', fromUserId);
        await handleIceCandidate(candidate, fromUserId);
      });

      newSocket.on('user-left', ({ userId: leftUserId }) => {
        handleUserLeft(leftUserId);
      });

    } catch (error) {
      console.error('Error initializing call:', error);
      if (error.name === 'NotReadableError' && error.message.includes('Device in use')) {
        toast.error('Camera/microphone is in use by another application. Please close other video apps and try again.');
      } else {
        toast.error('Failed to initialize call: ' + error.message);
      }
    }
  };

  const createPeerConnection = (remoteUserId, isInitiator = false) => {
    console.log('Creating peer connection for:', remoteUserId, 'isInitiator:', isInitiator);
    
    // Check if peer connection already exists
    if (peerConnectionsRef.current[remoteUserId]) {
      console.log('Peer connection already exists for:', remoteUserId);
      return;
    }
    
    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnectionsRef.current[remoteUserId] = peerConnection;

    // Add local stream if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    } else {
      console.log('No local stream available, creating peer connection without local media');
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream for user:', remoteUserId);
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
      if (event.candidate && socketRef.current && socketRef.current.connected) {
        console.log('Sending ICE candidate to:', remoteUserId);
        socketRef.current.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
          targetUserId: remoteUserId
        });
      } else if (event.candidate) {
        console.warn('Socket not ready for ICE candidate, will retry');
        // Retry after a short delay
        setTimeout(() => {
          if (socketRef.current && socketRef.current.connected) {
            console.log('Retrying to send ICE candidate to:', remoteUserId);
            socketRef.current.emit('ice-candidate', {
              roomId,
              candidate: event.candidate,
              targetUserId: remoteUserId
            });
          }
        }, 200);
      }
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log('Peer connection state changed for', remoteUserId, ':', peerConnection.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed for', remoteUserId, ':', peerConnection.iceConnectionState);
    };

    if (isInitiator) {
      createOffer(remoteUserId);
    }
  };

  const createOffer = async (remoteUserId) => {
    console.log('Creating offer for:', remoteUserId);
    const peerConnection = peerConnectionsRef.current[remoteUserId];
    try {
      const offer = await peerConnection.createOffer();
      console.log('Offer created:', offer);
      await peerConnection.setLocalDescription(offer);
      console.log('Local description set');
      
      // Add a small delay to ensure socket is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (socketRef.current && socketRef.current.connected) {
        console.log('Sending offer to:', remoteUserId);
        socketRef.current.emit('offer', {
          roomId,
          offer,
          targetUserId: remoteUserId
        });
        console.log('Offer sent via socket');
      } else {
        console.error('Socket not available or not connected for sending offer. Socket state:', socketRef.current ? socketRef.current.connected : 'null');
        // Retry after a short delay
        setTimeout(() => {
          if (socketRef.current && socketRef.current.connected) {
            console.log('Retrying to send offer to:', remoteUserId);
            socketRef.current.emit('offer', {
              roomId,
              offer,
              targetUserId: remoteUserId
            });
            console.log('Offer sent via socket (retry)');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (offer, fromUserId) => {
    createPeerConnection(fromUserId);
    const peerConnection = peerConnectionsRef.current[fromUserId];
    
    try {
      await peerConnection.setRemoteDescription(offer);
      
      // Process any queued ICE candidates
      if (peerConnection.queuedCandidates && peerConnection.queuedCandidates.length > 0) {
        console.log('Processing queued ICE candidates for user:', fromUserId);
        for (const candidate of peerConnection.queuedCandidates) {
          try {
            await peerConnection.addIceCandidate(candidate);
            console.log('Queued ICE candidate added successfully');
          } catch (error) {
            console.error('Error adding queued ICE candidate:', error);
          }
        }
        peerConnection.queuedCandidates = [];
      }
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // Add a small delay to ensure socket is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (socketRef.current && socketRef.current.connected) {
        console.log('Sending answer to:', fromUserId);
        socketRef.current.emit('answer', {
          roomId,
          answer,
          targetUserId: fromUserId
        });
        console.log('Answer sent via socket');
      } else {
        console.error('Socket not available for sending answer. Socket state:', socketRef.current ? socketRef.current.connected : 'null');
        // Retry after a short delay
        setTimeout(() => {
          if (socketRef.current && socketRef.current.connected) {
            console.log('Retrying to send answer to:', fromUserId);
            socketRef.current.emit('answer', {
              roomId,
              answer,
              targetUserId: fromUserId
            });
            console.log('Answer sent via socket (retry)');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer, fromUserId) => {
    const peerConnection = peerConnectionsRef.current[fromUserId];
    if (!peerConnection) {
      console.warn('No peer connection found for user:', fromUserId);
      return;
    }
    
    try {
      await peerConnection.setRemoteDescription(answer);
      
      // Process any queued ICE candidates
      if (peerConnection.queuedCandidates && peerConnection.queuedCandidates.length > 0) {
        console.log('Processing queued ICE candidates for user:', fromUserId);
        for (const candidate of peerConnection.queuedCandidates) {
          try {
            await peerConnection.addIceCandidate(candidate);
            console.log('Queued ICE candidate added successfully');
          } catch (error) {
            console.error('Error adding queued ICE candidate:', error);
          }
        }
        peerConnection.queuedCandidates = [];
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate, fromUserId) => {
    const peerConnection = peerConnectionsRef.current[fromUserId];
    if (!peerConnection) {
      console.warn('No peer connection found for user:', fromUserId);
      return;
    }
    
    try {
      // Check if remote description is set before adding ICE candidate
      if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        await peerConnection.addIceCandidate(candidate);
        console.log('ICE candidate added successfully for user:', fromUserId);
      } else {
        console.log('Remote description not set yet, queuing ICE candidate for user:', fromUserId);
        // Queue the candidate to be added later when remote description is set
        if (!peerConnection.queuedCandidates) {
          peerConnection.queuedCandidates = [];
        }
        peerConnection.queuedCandidates.push(candidate);
      }
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
    toast.success('User left the call');
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
    
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId, userId });
      socketRef.current.disconnect();
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
            {!localStreamRef.current && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">📹</div>
                  <div className="text-sm">Camera not available</div>
                </div>
              </div>
            )}
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
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    if (videoRef.current && user.stream) {
      console.log('Setting remote video stream for user:', user.userId);
      videoRef.current.srcObject = user.stream;
      
      // Check if stream has tracks
      if (user.stream.getTracks().length > 0) {
        setHasStream(true);
        console.log('Remote stream has tracks:', user.stream.getTracks().length);
      } else {
        console.warn('Remote stream has no tracks');
        setHasStream(false);
      }
      
      // Add event listeners for debugging
      videoRef.current.onloadedmetadata = () => {
        console.log('Remote video metadata loaded');
      };
      
      videoRef.current.onplay = () => {
        console.log('Remote video started playing');
      };
      
      videoRef.current.onerror = (error) => {
        console.error('Remote video error:', error);
      };
    }
  }, [user.stream, user.userId]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      {!hasStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">👤</div>
            <div className="text-sm">Waiting for remote video...</div>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        Remote User
      </div>
    </div>
  );
};

export default VideoCall;
