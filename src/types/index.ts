
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LockState {
  isLocked: boolean;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
  details?: string;
}

export interface MotionClip {
  filename: string;
  timestamp: string;
  duration: number;
  thumbnailUrl?: string;
}

export interface DeviceSettings {
  piBaseUrl: string;
  cameraEnabled: boolean;
  motionDetectionEnabled: boolean;
}
