import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DebugElement} from '@angular/core';

import {AppModule} from './app.module';
import {AppComponent} from './app.component';
import {CustomModule} from './custom.module';

describe('AppComponent', () => {
  let appInstance: AppComponent;
  let appFixture: ComponentFixture<AppComponent>;
  let debugElement: DebugElement;

  beforeEach(() => {

    window['gapi'] = {
      load() {
        return null;
      }};

    TestBed.configureTestingModule({
      imports: [
        CustomModule,
        AppModule
      ],
    });

    appFixture = TestBed.createComponent(AppComponent);

    appInstance = appFixture.componentInstance;

    debugElement = appFixture.debugElement;
  });

  it('should create the app', () => {
    expect(appFixture).toBeTruthy();
  });

  it(`should have as title 'app'`, () => {
    expect(appInstance.title).toEqual('Mongo-Angular-Spark lab');
  });
});
