export interface VoIPCall {
  id: string;
  userId: string;
  deviceId: string;
  pushToken: string; // PushKit token
  status: 'initiating' | 'ringing' | 'connected' | 'completed' | 'failed';
  webrtcData: {
    roomId: string;
    offer?: RTCSessionDescription;
    answer?: RTCSessionDescription;
    candidates: RTCIceCandidate[];
  };
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VoIPPushPayload {
  callId: string;
  type: 'incoming_call';
  caller: {
    id: string;
    name: string;
  };
  webrtcData: {
    roomId: string;
    serverUrl: string;
  };
} 