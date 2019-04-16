import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {RideListComponent} from "./rides/ride-list.component";
import {UserProfileComponent} from "./users/user-profile.component";
import {UserSingleComponent} from "./users/user-single.component";

//TODO: possibly clean up routes to not be named "badly"
// Route Configuration
export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'rides', component: RideListComponent},
  {path: 'rides/users', component: UserProfileComponent},
  {path: 'rides/users/:userId', component: UserSingleComponent}
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes);
