import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title?: string;
  content?: string;
  size?: string; // 'modal-lg', 'modal-sm', etc.
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  type?: 'danger' | 'primary' | 'warning' | '';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private activeModalSubject = new BehaviorSubject<ModalConfig | null>(null);
  activeModal$ = this.activeModalSubject.asObservable();

  show(config: ModalConfig): void {
    this.activeModalSubject.next({
      showCancel: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      ...config
    });
  }

  confirm(title: string, message: string, onConfirm: () => void, type: 'danger' | 'primary' | 'warning' | '' = ''): void {
    this.show({
      title,
      content: message,
      onConfirm,
      confirmText: 'Confirm',
      type
    });
  }

  alert(title: string, message: string): void {
    this.show({
      title,
      content: message,
      showCancel: false,
      confirmText: 'OK'
    });
  }

  close(): void {
    this.activeModalSubject.next(null);
  }
}
