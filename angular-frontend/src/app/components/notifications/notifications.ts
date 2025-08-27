import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="notifications-container">
      <button 
        mat-icon-button 
        [matMenuTriggerFor]="notificationMenu"
        [matBadge]="unreadCount"
        [matBadgeHidden]="unreadCount === 0"
        matBadgeColor="warn"
        matTooltip="Notifications"
        class="notification-button">
        <mat-icon>notifications</mat-icon>
      </button>

      <mat-menu #notificationMenu="matMenu" class="notification-menu">
        <div class="notification-header" (click)="$event.stopPropagation()">
          <h3>Notifications</h3>
          <div class="header-actions">
            <button mat-icon-button (click)="markAllAsRead()" [disabled]="unreadCount === 0" matTooltip="Mark all as read">
              <mat-icon>done_all</mat-icon>
            </button>
            <button mat-icon-button (click)="clearAll()" [disabled]="notifications.length === 0" matTooltip="Clear all">
              <mat-icon>clear_all</mat-icon>
            </button>
            <button mat-icon-button (click)="sendTestNotification()" matTooltip="Send test notification">
              <mat-icon>bug_report</mat-icon>
            </button>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="connection-status" (click)="$event.stopPropagation()">
          <div class="status-indicator" [class.connected]="isConnected" [class.disconnected]="!isConnected">
            <mat-icon>{{ isConnected ? 'wifi' : 'wifi_off' }}</mat-icon>
            <span>{{ isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <button mat-button (click)="toggleConnection()" class="connection-button">
            {{ isConnected ? 'Disconnect' : 'Connect' }}
          </button>
        </div>

        <mat-divider></mat-divider>

        <div class="notification-list" (click)="$event.stopPropagation()">
          <div *ngIf="notifications.length === 0" class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <p>No notifications yet</p>
          </div>

          <div *ngFor="let notification of notifications; trackBy: trackByNotification" 
               class="notification-item" 
               [class.unread]="!notification.read"
               (click)="handleNotificationClick(notification)">
            
            <div class="notification-icon" [ngClass]="'icon-' + notification.type">
              <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
            </div>

            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ getRelativeTime(notification.timestamp) }}</div>
            </div>

            <div class="notification-actions">
              <button mat-icon-button (click)="markAsRead(notification.id, $event)" 
                      *ngIf="!notification.read" 
                      matTooltip="Mark as read">
                <mat-icon>done</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <mat-divider *ngIf="notifications.length > 0"></mat-divider>

        <div class="notification-footer" (click)="$event.stopPropagation()">
          <button mat-button routerLink="/dashboard" class="view-all-button">
            View All in Dashboard
          </button>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: relative;
    }

    .notification-button {
      color: white;
    }

    .notification-menu {
      width: 400px;
      max-width: 90vw;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f5f5f5;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
      }

      .header-actions {
        display: flex;
        gap: 4px;
      }
    }

    .connection-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #fafafa;

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;

        &.connected {
          color: #4caf50;
        }

        &.disconnected {
          color: #f44336;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .connection-button {
        font-size: 0.8rem;
        min-width: auto;
        padding: 4px 12px;
      }
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #666;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        p {
          margin: 0;
          font-size: 1rem;
        }
      }

      .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        border-left: 3px solid transparent;

        &:hover {
          background-color: #f5f5f5;
        }

        &.unread {
          background-color: #e3f2fd;
          border-left-color: #2196f3;
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
            color: white;
          }

          &.icon-quote {
            background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
          }

          &.icon-shipment {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
          }

          &.icon-payment {
            background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          }

          &.icon-delivery {
            background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
          }

          &.icon-test {
            background: linear-gradient(135deg, #607d8b 0%, #455a64 100%);
          }

          &.icon-system {
            background: linear-gradient(135deg, #795548 0%, #5d4037 100%);
          }
        }

        .notification-content {
          flex: 1;
          min-width: 0;

          .notification-title {
            font-weight: 600;
            font-size: 0.9rem;
            color: #333;
            margin-bottom: 4px;
          }

          .notification-message {
            font-size: 0.8rem;
            color: #666;
            line-height: 1.4;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .notification-time {
            font-size: 0.7rem;
            color: #999;
          }
        }

        .notification-actions {
          flex-shrink: 0;
        }
      }
    }

    .notification-footer {
      padding: 12px 16px;
      background-color: #f5f5f5;
      text-align: center;

      .view-all-button {
        width: 100%;
        font-weight: 500;
      }
    }

    // Responsive design
    @media (max-width: 480px) {
      .notification-menu {
        width: 100vw;
        max-width: 100vw;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isConnected = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications.slice(0, 10); // Show only latest 10 in menu
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
      })
    );

    // Subscribe to connection status
    this.subscriptions.push(
      this.notificationService.connectionStatus$.subscribe(status => {
        this.isConnected = status;
      })
    );

    // Auto-connect on component init
    this.notificationService.connect();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.notificationService.disconnect();
  }

  markAsRead(notificationId: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  clearAll() {
    this.notificationService.clearAll();
  }

  sendTestNotification() {
    this.notificationService.sendTestNotification();
  }

  toggleConnection() {
    if (this.isConnected) {
      this.notificationService.disconnect();
    } else {
      this.notificationService.connect();
    }
  }

  handleNotificationClick(notification: Notification) {
    this.markAsRead(notification.id);
    // Handle navigation based on notification type
    // This could be expanded to navigate to specific pages
  }

  getNotificationIcon(type: string): string {
    const icons = {
      quote: 'description',
      shipment: 'local_shipping',
      payment: 'payment',
      delivery: 'done_all',
      test: 'bug_report',
      system: 'info'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }
}
