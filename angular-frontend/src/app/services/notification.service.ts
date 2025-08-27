import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Notification {
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  id: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  private notifications: Notification[] = [];
  private maxNotifications = 50;

  constructor(
    private ngZone: NgZone,
    private snackBar: MatSnackBar
  ) {
    this.loadStoredNotifications();
  }

  /**
   * Connect to SSE stream for real-time notifications
   */
  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, cannot connect to notifications');
      return;
    }

    try {
      this.eventSource = new EventSource('http://localhost:8080/api/notifications/stream');
      
      this.eventSource.onopen = () => {
        this.ngZone.run(() => {
          console.log('Connected to notification stream');
          this.connectionStatusSubject.next(true);
        });
      };

      this.eventSource.onmessage = (event) => {
        this.ngZone.run(() => {
          try {
            const data = JSON.parse(event.data);
            this.handleNotification(data);
          } catch (error) {
            console.error('Error parsing notification data:', error);
          }
        });
      };

      this.eventSource.addEventListener('notification', (event: any) => {
        this.ngZone.run(() => {
          try {
            const data = JSON.parse(event.data);
            this.handleNotification(data);
          } catch (error) {
            console.error('Error parsing notification event:', error);
          }
        });
      });

      this.eventSource.addEventListener('connected', (event: any) => {
        this.ngZone.run(() => {
          console.log('SSE connection confirmed:', event.data);
        });
      });

      this.eventSource.onerror = (error) => {
        this.ngZone.run(() => {
          console.error('SSE connection error:', error);
          this.connectionStatusSubject.next(false);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (this.eventSource?.readyState === EventSource.CLOSED) {
              console.log('Attempting to reconnect...');
              this.connect();
            }
          }, 5000);
        });
      };

    } catch (error) {
      console.error('Error creating SSE connection:', error);
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatusSubject.next(false);
      console.log('Disconnected from notification stream');
    }
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(data: any): void {
    const notification: Notification = {
      id: this.generateId(),
      type: data.type || 'info',
      title: data.title || 'Notification',
      message: data.message || '',
      data: data.data,
      timestamp: new Date(data.timestamp || Date.now()),
      read: false
    };

    // Add to notifications array
    this.notifications.unshift(notification);
    
    // Keep only the latest notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Update subject
    this.notificationsSubject.next([...this.notifications]);

    // Store in localStorage
    this.storeNotifications();

    // Show snack bar for important notifications
    this.showSnackBar(notification);

    // Play notification sound (optional)
    this.playNotificationSound(notification.type);
  }

  /**
   * Show snack bar notification
   */
  private showSnackBar(notification: Notification): void {
    const config = {
      duration: 5000,
      horizontalPosition: 'right' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${notification.type}`]
    };

    const snackBarRef = this.snackBar.open(
      `${notification.title}: ${notification.message}`,
      'View',
      config
    );

    snackBarRef.onAction().subscribe(() => {
      this.markAsRead(notification.id);
      // Navigate to relevant page based on notification type
      this.handleNotificationAction(notification);
    });
  }

  /**
   * Handle notification action (when user clicks on notification)
   */
  private handleNotificationAction(notification: Notification): void {
    switch (notification.type) {
      case 'quote':
        // Navigate to quotes page
        window.location.href = '/dashboard#quotes';
        break;
      case 'shipment':
        // Navigate to tracking page
        if (notification.data?.trackingNumber) {
          window.location.href = `/tracking?number=${notification.data.trackingNumber}`;
        } else {
          window.location.href = '/dashboard#shipments';
        }
        break;
      case 'payment':
        // Navigate to payment history
        window.location.href = '/dashboard#payments';
        break;
      case 'delivery':
        // Navigate to shipment details
        if (notification.data?.shipmentId) {
          window.location.href = `/shipment/${notification.data.shipmentId}`;
        } else {
          window.location.href = '/dashboard';
        }
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(type: string): void {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Different frequencies for different notification types
      const frequencies = {
        quote: 800,
        shipment: 600,
        payment: 1000,
        delivery: 1200,
        test: 400,
        system: 300
      };

      const frequency = frequencies[type as keyof typeof frequencies] || 500;
      
      // Create oscillator for beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      // Silently fail if audio is not supported
      console.debug('Audio notification not supported:', error);
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.storeNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.notifications]);
    this.storeNotifications();
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
    this.notificationsSubject.next([]);
    this.storeNotifications();
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        observer.next(unreadCount);
      });
    });
  }

  /**
   * Store notifications in localStorage
   */
  private storeNotifications(): void {
    try {
      localStorage.setItem('songo_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  }

  /**
   * Load stored notifications from localStorage
   */
  private loadStoredNotifications(): void {
    try {
      const stored = localStorage.getItem('songo_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next([...this.notifications]);
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error);
      this.notifications = [];
    }
  }

  /**
   * Generate unique ID for notifications
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Send test notification (for demo purposes)
   */
  sendTestNotification(): void {
    fetch('http://localhost:8080/api/notifications/test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    }).catch(error => {
      console.error('Error sending test notification:', error);
    });
  }
}
