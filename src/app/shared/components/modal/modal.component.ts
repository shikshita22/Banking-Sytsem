import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="modal" class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal" [ngClass]="modal.size || ''">
        <div class="modal-header">
          <h3>{{ modal.title || 'Confirm' }}</h3>
          <button class="btn btn-ghost btn-icon sm" (click)="close()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body" [innerHTML]="modal.content"></div>
        <div class="modal-footer">
          <button *ngIf="modal.showCancel !== false" class="btn btn-secondary" (click)="close()">
            {{ modal.cancelText || 'Cancel' }}
          </button>
          <button *ngIf="modal.onConfirm" class="btn" [ngClass]="modal.type === 'danger' ? 'btn-danger' : 'btn-primary'" (click)="confirm()">
            {{ modal.confirmText || 'Confirm' }}
          </button>
          <button *ngIf="!modal.onConfirm && modal.showCancel === false" class="btn btn-primary" (click)="close()">
            OK
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  modal: ModalConfig | null = null;

  constructor(private modalService: ModalService) {
    this.modalService.activeModal$.subscribe(modal => {
      this.modal = modal;
    });
  }

  close() {
    this.modalService.close();
  }

  confirm() {
    if (this.modal && this.modal.onConfirm) {
      this.modal.onConfirm();
    }
    this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.modal) {
      this.close();
    }
  }
}
