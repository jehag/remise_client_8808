import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientWallComponent } from './client-wall.component';

describe('ClientWallComponent', () => {
  let component: ClientWallComponent;
  let fixture: ComponentFixture<ClientWallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientWallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientWallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
