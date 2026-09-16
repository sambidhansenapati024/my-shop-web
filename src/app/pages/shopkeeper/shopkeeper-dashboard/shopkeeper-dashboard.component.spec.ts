import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopkeeperDashboardComponent } from './shopkeeper-dashboard.component';

describe('ShopkeeperDashboardComponent', () => {
  let component: ShopkeeperDashboardComponent;
  let fixture: ComponentFixture<ShopkeeperDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopkeeperDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopkeeperDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
