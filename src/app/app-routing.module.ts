import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PhoneComponent } from './phone/phone.component';
import { WallComponent } from './wall/wall.component';

const routes: Routes = [
  { path: 'wall', component:WallComponent},
  { path: 'phone', component:PhoneComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
