import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SiteFooterComponent } from './shared/components/site-footer/site-footer.component';
import { VisitorService } from './core/services/visitor.service';
import { LogoService } from './core/services/logo.service';
import { BrandingService }  from './core/services/branding.service';
import { HomepageService }  from './core/services/homepage.service';
import { ContactService }    from './core/services/contact.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SiteFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private visitorSvc   = inject(VisitorService);
  private logoSvc      = inject(LogoService);
  private brandingSvc  = inject(BrandingService);
  private homepageSvc  = inject(HomepageService);
  private contactSvc   = inject(ContactService);
  private router       = inject(Router);

  isPrintPage = signal(false);

  ngOnInit(): void {
    this.visitorSvc.ping();
    this.logoSvc.loadLogo();
    this.brandingSvc.loadAppName();
    this.brandingSvc.loadFavicon();
    this.homepageSvc.loadHomepageSettings();
    this.contactSvc.load();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.isPrintPage.set(e.urlAfterRedirects.includes('/print'));
    });
  }
}
