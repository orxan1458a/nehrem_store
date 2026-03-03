import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <span class="logo">🏠 Nehrem Store</span>
        <p>© {{ year }} All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2d6a4f;
      color: #d8f3dc;
      padding: 1.5rem 1rem;
      margin-top: 4rem;
    }
    .footer__inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: .5rem;
    }
    .logo { font-weight: 700; font-size: 1.1rem; }
    p { margin: 0; font-size: .85rem; opacity: .8; }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
