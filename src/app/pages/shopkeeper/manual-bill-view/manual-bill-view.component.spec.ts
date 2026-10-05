import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualBillViewComponent } from './manual-bill-view.component';

describe('ManualBillViewComponent', () => {
  let component: ManualBillViewComponent;
  let fixture: ComponentFixture<ManualBillViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualBillViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualBillViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
