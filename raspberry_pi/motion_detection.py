
"""
Motion Detection with OpenCV
Detects motion and records video clips
"""

import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
import time

try:
    from picamera2 import Picamera2
    PICAMERA_AVAILABLE = True
except ImportError:
    print("picamera2 not available. Running in simulation mode.")
    PICAMERA_AVAILABLE = False

class MotionDetector:
    def __init__(self, threshold=25, min_area=500):
        """
        Initialize motion detector
        
        Args:
            threshold: Pixel difference threshold for motion detection
            min_area: Minimum contour area to consider as motion
        """
        self.threshold = threshold
        self.min_area = min_area
        self.previous_frame = None
        self.motion_detected = False
        self.clips_dir = Path("clips")
        self.clips_dir.mkdir(exist_ok=True)
        
        if PICAMERA_AVAILABLE:
            try:
                # Initialize camera for motion detection
                self.camera = Picamera2()
                config = self.camera.create_still_configuration(
                    main={"size": (640, 480)}
                )
                self.camera.configure(config)
                self.camera.start()
                time.sleep(2)  # Camera warm-up
                print("Motion detector initialized with Pi Camera")
            except Exception as e:
                print(f"Error initializing camera for motion detection: {e}")
                self.camera = None
        else:
            self.camera = None
            print("Motion detector initialized in simulation mode")
    
    def detect_motion(self):
        """
        Detect motion in current frame
        
        Returns:
            bool: True if motion detected, False otherwise
        """
        if not PICAMERA_AVAILABLE or self.camera is None:
            # Simulation mode - randomly detect motion
            import random
            return random.random() < 0.01  # 1% chance of motion
        
        try:
            # Capture frame
            frame = self.camera.capture_array()
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (21, 21), 0)
            
            # Initialize previous frame
            if self.previous_frame is None:
                self.previous_frame = gray
                return False
            
            # Compute difference between frames
            frame_delta = cv2.absdiff(self.previous_frame, gray)
            thresh = cv2.threshold(frame_delta, self.threshold, 255, cv2.THRESH_BINARY)[1]
            
            # Dilate threshold image to fill holes
            thresh = cv2.dilate(thresh, None, iterations=2)
            
            # Find contours
            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Check if any contour is large enough
            motion = False
            for contour in contours:
                if cv2.contourArea(contour) > self.min_area:
                    motion = True
                    break
            
            # Update previous frame
            self.previous_frame = gray
            
            return motion
        
        except Exception as e:
            print(f"Error detecting motion: {e}")
            return False
    
    def record_clip(self, duration=10):
        """
        Record a video clip
        
        Args:
            duration: Clip duration in seconds
        
        Returns:
            str: Filename of recorded clip
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"motion_{timestamp}.mp4"
        filepath = self.clips_dir / filename
        
        if not PICAMERA_AVAILABLE or self.camera is None:
            # Simulation mode - create dummy file
            print(f"Simulating clip recording: {filename}")
            filepath.touch()
            return filename
        
        try:
            print(f"Recording clip: {filename}")
            
            # Setup video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(str(filepath), fourcc, 20.0, (640, 480))
            
            # Record frames
            start_time = time.time()
            while time.time() - start_time < duration:
                frame = self.camera.capture_array()
                out.write(frame)
            
            out.release()
            print(f"Clip recorded: {filename}")
            
            return filename
        
        except Exception as e:
            print(f"Error recording clip: {e}")
            return filename
    
    def cleanup(self):
        """Cleanup resources"""
        print("Cleaning up motion detector...")
        if PICAMERA_AVAILABLE and self.camera is not None:
            try:
                self.camera.stop()
                self.camera.close()
            except Exception as e:
                print(f"Error cleaning up motion detector: {e}")

# Example usage
if __name__ == "__main__":
    detector = MotionDetector()
    
    try:
        print("Motion detection active. Press Ctrl+C to stop.")
        
        while True:
            if detector.detect_motion():
                print("Motion detected!")
                detector.record_clip(duration=5)
                time.sleep(5)  # Cooldown period
            
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        print("\nStopping motion detection...")
    
    finally:
        detector.cleanup()
