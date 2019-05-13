import {TestBed, ComponentFixture} from '@angular/core/testing';
import {HomeComponent} from './home.component';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CustomModule} from '../custom.module';
import {AuthService} from "../auth.service";
import {HttpClientModule} from "@angular/common/http";
import {RouterTestingModule} from "@angular/router/testing";

describe('Home', () => {

  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [CustomModule, HttpClientModule, RouterTestingModule],
      declarations: [HomeComponent],
      providers: [
        AuthService
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);

    component = fixture.componentInstance; // BannerComponent test instance

    // query for the title <h1> by CSS element selector
    de = fixture.debugElement.query(By.css('#MoRide'));
    el = de.nativeElement;
  });

  it('displays a greeting', () => {
    fixture.detectChanges();
    expect(el.textContent).toContain(component.text);
  });
});
