import { TestBed } from '@angular/core/testing';

import { IameilleurepriseService } from './iameilleureprise.service';

describe('IameilleurepriseService', () => {
  let service: IameilleurepriseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IameilleurepriseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
