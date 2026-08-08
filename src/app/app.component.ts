import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SeedService } from './core/services/seed.service';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ModalComponent, ToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-modal></app-modal>
    <app-toast></app-toast>
  `
})
export class AppComponent implements OnInit {
  constructor(private seedService: SeedService) {}

  async ngOnInit() {
    await this.seedService.loadSeedData();
  }
}
