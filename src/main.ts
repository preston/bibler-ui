import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/components/app.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import { authTokenInterceptor } from './app/services/auth-token.interceptor';


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZonelessChangeDetection(),
        importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule),
        provideHttpClient(withInterceptors([authTokenInterceptor]))
    ]
})
  .catch(err => console.error(err));
