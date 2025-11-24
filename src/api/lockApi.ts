
import { LockState, ActivityLog, MotionClip } from '../types';

export class LockApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getLockState(): Promise<LockState> {
    try {
      const response = await fetch(`${this.baseUrl}/lock/state`);
      if (!response.ok) {
        throw new Error('Failed to get lock state');
      }
      return await response.json();
    } catch (error) {
      console.log('Error getting lock state:', error);
      throw error;
    }
  }

  async setLockState(isLocked: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/lock/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: isLocked ? 'lock' : 'unlock' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to set lock state');
      }
    } catch (error) {
      console.log('Error setting lock state:', error);
      throw error;
    }
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const response = await fetch(`${this.baseUrl}/activity`);
      if (!response.ok) {
        throw new Error('Failed to get activity logs');
      }
      return await response.json();
    } catch (error) {
      console.log('Error getting activity logs:', error);
      throw error;
    }
  }

  async getMotionClips(): Promise<MotionClip[]> {
    try {
      const response = await fetch(`${this.baseUrl}/clips`);
      if (!response.ok) {
        throw new Error('Failed to get motion clips');
      }
      return await response.json();
    } catch (error) {
      console.log('Error getting motion clips:', error);
      throw error;
    }
  }

  getClipUrl(filename: string): string {
    return `${this.baseUrl}/clips/${filename}`;
  }

  getCameraStreamUrl(): string {
    return `${this.baseUrl}/camera/live`;
  }
}
