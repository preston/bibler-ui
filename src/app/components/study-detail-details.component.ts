// Author: Preston Lee

import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { STUDY_DETAIL_API } from './study-detail-api.token';

@Component({
  selector: 'app-study-detail-details',
  templateUrl: 'study-detail-details.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class StudyDetailDetailsComponent {
  readonly vm = inject(STUDY_DETAIL_API);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.vm.showStudyBibleDropdown()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const host = this.elementRef.nativeElement;
    const dropdownRegion = host.querySelector('[data-study-bible-dropdown-region]');
    if (!dropdownRegion) return;
    if (!dropdownRegion.contains(target)) {
      this.vm.closeStudyBibleDropdown();
    }
  }
}
