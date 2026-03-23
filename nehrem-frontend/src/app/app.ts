import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { VisitorService } from './core/services/visitor.service';
import { LogoService } from './core/services/logo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private visitorSvc = inject(VisitorService);
  private logoSvc    = inject(LogoService);
  private router     = inject(Router);

  isPrintPage = signal(false);

  ngOnInit(): void {
    this.visitorSvc.ping();
    this.logoSvc.loadLogo();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.isPrintPage.set(e.urlAfterRedirects.includes('/print'));
    });
  }
}
