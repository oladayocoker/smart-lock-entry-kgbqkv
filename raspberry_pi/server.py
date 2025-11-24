
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio
from datetime import datetime
import os
from pathlib import Path

# Import our custom modules
from motor import LockMotor
from camera_stream import CameraStream
from motion_detection import MotionDetector

app = FastAPI(title="Smart Lock Entry API")

# CORS middleware to allow mobile app connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
lock_motor = LockMotor()
camera_stream = CameraStream()
motion_detector = MotionDetector()

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")

manager = ConnectionManager()

# Pydantic models
class LockCommand(BaseModel):
    command: str  # "lock" or "unlock"

class LockStateResponse(BaseModel):
    isLocked: bool
    timestamp: str

class ActivityLogResponse(BaseModel):
    id: str
    action: str
    timestamp: str
    user: Optional[str] = None
    details: Optional[str] = None

class MotionClipResponse(BaseModel):
    filename: str
    timestamp: str
    duration: int

# In-memory storage (in production, use a database)
activity_logs = []
lock_state = {"isLocked": True, "timestamp": datetime.now().isoformat()}

def add_activity_log(action: str, user: Optional[str] = None, details: Optional[str] = None):
    """Add an activity log entry"""
    log = {
        "id": str(len(activity_logs) + 1),
        "action": action,
        "timestamp": datetime.now().isoformat(),
        "user": user,
        "details": details,
    }
    activity_logs.append(log)
    return log

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Smart Lock Entry API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/lock/state", response_model=LockStateResponse)
async def get_lock_state():
    """Get current lock state"""
    return lock_state

@app.post("/lock/command")
async def set_lock_command(command: LockCommand):
    """Send lock/unlock command"""
    global lock_state
    
    if command.command not in ["lock", "unlock"]:
        raise HTTPException(status_code=400, detail="Invalid command. Use 'lock' or 'unlock'")
    
    try:
        is_locked = command.command == "lock"
        
        # Control the motor
        if is_locked:
            lock_motor.lock()
        else:
            lock_motor.unlock()
        
        # Update state
        lock_state = {
            "isLocked": is_locked,
            "timestamp": datetime.now().isoformat(),
        }
        
        # Log activity
        add_activity_log(
            action=f"Door {command.command}ed",
            details=f"Lock state changed to {command.command}ed"
        )
        
        # Broadcast to all connected WebSocket clients
        await manager.broadcast({
            "type": "lock_state",
            "isLocked": is_locked,
            "timestamp": lock_state["timestamp"],
        })
        
        return {"success": True, "state": lock_state}
    
    except Exception as e:
        print(f"Error executing lock command: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/camera/live")
async def get_camera_stream():
    """Get live MJPEG camera stream"""
    try:
        return StreamingResponse(
            camera_stream.generate_frames(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )
    except Exception as e:
        print(f"Error streaming camera: {e}")
        raise HTTPException(status_code=500, detail="Camera stream unavailable")

@app.get("/clips", response_model=List[MotionClipResponse])
async def get_motion_clips():
    """Get list of recorded motion clips"""
    clips_dir = Path("clips")
    
    if not clips_dir.exists():
        return []
    
    clips = []
    for clip_file in clips_dir.glob("*.mp4"):
        stat = clip_file.stat()
        clips.append({
            "filename": clip_file.name,
            "timestamp": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "duration": 10,  # Default duration, could be calculated from video
        })
    
    # Sort by timestamp, newest first
    clips.sort(key=lambda x: x["timestamp"], reverse=True)
    return clips

@app.get("/clips/{filename}")
async def get_clip_file(filename: str):
    """Download a specific motion clip"""
    clip_path = Path("clips") / filename
    
    if not clip_path.exists():
        raise HTTPException(status_code=404, detail="Clip not found")
    
    return FileResponse(clip_path, media_type="video/mp4")

@app.get("/activity", response_model=List[ActivityLogResponse])
async def get_activity_logs():
    """Get activity logs"""
    # Return most recent logs first
    return list(reversed(activity_logs[-50:]))  # Last 50 logs

@app.websocket("/ws/lock")
async def websocket_lock_state(websocket: WebSocket):
    """WebSocket endpoint for real-time lock state updates"""
    await manager.connect(websocket)
    
    try:
        # Send current state immediately upon connection
        await websocket.send_json({
            "type": "lock_state",
            "isLocked": lock_state["isLocked"],
            "timestamp": lock_state["timestamp"],
        })
        
        # Keep connection alive
        while True:
            # Wait for messages from client (ping/pong)
            data = await websocket.receive_text()
            
            # Echo back to keep connection alive
            if data == "ping":
                await websocket.send_text("pong")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# Background task for motion detection
@app.on_event("startup")
async def startup_event():
    """Start background tasks on server startup"""
    print("Starting Smart Lock Entry API...")
    print("Initializing motion detection...")
    
    # Create clips directory if it doesn't exist
    Path("clips").mkdir(exist_ok=True)
    
    # Add initial activity log
    add_activity_log("System started", details="Smart Lock Entry system initialized")
    
    # Start motion detection in background
    asyncio.create_task(motion_detection_task())

async def motion_detection_task():
    """Background task for motion detection"""
    while True:
        try:
            # Check for motion every second
            if motion_detector.detect_motion():
                print("Motion detected! Recording clip...")
                
                # Record clip
                clip_filename = motion_detector.record_clip()
                
                # Log activity
                add_activity_log(
                    "Motion detected",
                    details=f"Recorded clip: {clip_filename}"
                )
                
                # Broadcast motion event to connected clients
                await manager.broadcast({
                    "type": "motion_detected",
                    "timestamp": datetime.now().isoformat(),
                    "clip": clip_filename,
                })
            
            await asyncio.sleep(1)
        
        except Exception as e:
            print(f"Error in motion detection: {e}")
            await asyncio.sleep(5)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on server shutdown"""
    print("Shutting down Smart Lock Entry API...")
    camera_stream.cleanup()
    lock_motor.cleanup()
    motion_detector.cleanup()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
