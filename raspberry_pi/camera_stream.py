
"""
Pi Camera MJPEG Streaming
Provides live camera feed in MJPEG format
"""

import io
import time
from threading import Condition

try:
    from picamera2 import Picamera2
    from picamera2.encoders import JpegEncoder
    from picamera2.outputs import FileOutput
    PICAMERA_AVAILABLE = True
except ImportError:
    print("picamera2 not available. Running in simulation mode.")
    PICAMERA_AVAILABLE = False

class StreamingOutput(io.BufferedIOBase):
    """Output handler for camera frames"""
    
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

class CameraStream:
    def __init__(self, resolution=(640, 480), framerate=30):
        """
        Initialize camera stream
        
        Args:
            resolution: Camera resolution tuple (width, height)
            framerate: Frames per second
        """
        self.resolution = resolution
        self.framerate = framerate
        self.output = StreamingOutput()
        
        if PICAMERA_AVAILABLE:
            try:
                # Initialize Pi Camera
                self.camera = Picamera2()
                config = self.camera.create_video_configuration(
                    main={"size": resolution}
                )
                self.camera.configure(config)
                
                # Start recording to output
                encoder = JpegEncoder()
                self.camera.start_recording(encoder, FileOutput(self.output))
                
                print(f"Camera initialized: {resolution[0]}x{resolution[1]} @ {framerate}fps")
            except Exception as e:
                print(f"Error initializing camera: {e}")
                self.camera = None
        else:
            self.camera = None
            print("Camera initialized in simulation mode")
    
    def generate_frames(self):
        """
        Generator function for MJPEG streaming
        Yields JPEG frames with multipart boundaries
        """
        if not PICAMERA_AVAILABLE or self.camera is None:
            # Simulation mode - generate dummy frames
            while True:
                # Create a simple test pattern
                dummy_frame = self._create_dummy_frame()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + dummy_frame + b'\r\n')
                time.sleep(1.0 / self.framerate)
        else:
            # Real camera streaming
            try:
                while True:
                    with self.output.condition:
                        self.output.condition.wait()
                        frame = self.output.frame
                    
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            except Exception as e:
                print(f"Error generating frames: {e}")
    
    def _create_dummy_frame(self):
        """Create a dummy JPEG frame for simulation"""
        # This is a minimal valid JPEG (1x1 black pixel)
        return (
            b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
            b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c'
            b'\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c'
            b'\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00'
            b'\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01'
            b'\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05'
            b'\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04'
            b'\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A'
            b'\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82'
            b'\t\n\x16\x17\x18\x19\x1a%&\'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz'
            b'\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a'
            b'\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9'
            b'\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8'
            b'\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5'
            b'\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfe\xfe\xa2'
            b'\x8a(\xff\xd9'
        )
    
    def get_frame(self):
        """Get a single frame (for motion detection)"""
        if not PICAMERA_AVAILABLE or self.camera is None:
            return None
        
        with self.output.condition:
            self.output.condition.wait()
            return self.output.frame
    
    def cleanup(self):
        """Cleanup camera resources"""
        print("Cleaning up camera...")
        if PICAMERA_AVAILABLE and self.camera is not None:
            try:
                self.camera.stop_recording()
                self.camera.close()
            except Exception as e:
                print(f"Error cleaning up camera: {e}")

# Example usage
if __name__ == "__main__":
    stream = CameraStream()
    
    try:
        print("Camera stream ready. Press Ctrl+C to stop.")
        
        # Generate a few frames for testing
        frame_gen = stream.generate_frames()
        for i in range(10):
            frame = next(frame_gen)
            print(f"Frame {i+1}: {len(frame)} bytes")
            time.sleep(0.1)
    
    finally:
        stream.cleanup()
