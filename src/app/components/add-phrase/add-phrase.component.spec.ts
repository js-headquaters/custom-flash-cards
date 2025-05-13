import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPhraseComponent } from './add-phrase.component';

describe('AddPhraseComponent', () => {
  let component: AddPhraseComponent;
  let fixture: ComponentFixture<AddPhraseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPhraseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPhraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
