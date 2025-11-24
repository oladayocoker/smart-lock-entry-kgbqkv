
"""
GPIO Motor Control for Smart Lock
Controls a servo motor or DC motor to lock/unlock the door
"""

import time

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    print("RPi.GPIO not available. Running in simulation mode.")
    GPIO_AVAILABLE = False

class LockMotor:
    def __init__(self, pin=18):
        """
        Initialize the lock motor controller
        
        Args:
            pin: GPIO pin number for motor control (default: 18)
        """
        self.pin = pin
        self.is_locked = True
        
        if GPIO_AVAILABLE:
            # Setup GPIO
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.pin, GPIO.OUT)
            
            # Setup PWM for servo control (50Hz)
            self.pwm = GPIO.PWM(self.pin, 50)
            self.pwm.start(0)
            
            # Initialize to locked position
            self._move_to_locked_position()
        else:
            print("Motor initialized in simulation mode")
    
    def lock(self):
        """Lock the door"""
        print("Locking door...")
        
        if GPIO_AVAILABLE:
            self._move_to_locked_position()
        else:
            # Simulation
            time.sleep(0.5)
        
        self.is_locked = True
        print("Door locked")
    
    def unlock(self):
        """Unlock the door"""
        print("Unlocking door...")
        
        if GPIO_AVAILABLE:
            self._move_to_unlocked_position()
        else:
            # Simulation
            time.sleep(0.5)
        
        self.is_locked = False
        print("Door unlocked")
    
    def _move_to_locked_position(self):
        """Move servo to locked position (0 degrees)"""
        if GPIO_AVAILABLE:
            # 0 degrees = 2.5% duty cycle
            self.pwm.ChangeDutyCycle(2.5)
            time.sleep(0.5)
            self.pwm.ChangeDutyCycle(0)  # Stop sending signal
    
    def _move_to_unlocked_position(self):
        """Move servo to unlocked position (90 degrees)"""
        if GPIO_AVAILABLE:
            # 90 degrees = 7.5% duty cycle
            self.pwm.ChangeDutyCycle(7.5)
            time.sleep(0.5)
            self.pwm.ChangeDutyCycle(0)  # Stop sending signal
    
    def get_state(self):
        """Get current lock state"""
        return self.is_locked
    
    def cleanup(self):
        """Cleanup GPIO resources"""
        print("Cleaning up motor GPIO...")
        if GPIO_AVAILABLE:
            self.pwm.stop()
            GPIO.cleanup()

# Example usage
if __name__ == "__main__":
    motor = LockMotor()
    
    try:
        print("Testing lock motor...")
        
        motor.unlock()
        time.sleep(2)
        
        motor.lock()
        time.sleep(2)
        
        print("Test complete")
    
    finally:
        motor.cleanup()
