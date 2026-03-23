import {
  Component, OnInit, OnDestroy,
  inject, signal, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin, Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import {
  Chart, ChartConfiguration,
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, BarController, BarElement,
  Tooltip, Legend, Filler
} from 'chart.js';

import { AnalyticsService, AnalyticsStats, ChartData } from '../../../core/services/analytics.service';
import { VisitorService, DashboardStats } from '../../../core/services/visitor.service';

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, BarController, BarElement,
  Tooltip, Legend, Filler
);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private analyticsSvc = inject(AnalyticsService);
  private visitorSvc   = inject(VisitorService);

  // ── State ─────────────────────────────────────────────────────────────────
  stats        = signal<AnalyticsStats | null>(null);
  visitors     = signal<DashboardStats | null>(null);
  loading      = signal(true);
  selectedDays = signal(30);
  dateFrom     = '';
  dateTo       = '';

  // ── Chart canvas refs ──────────────────────────────────────────────────────
  @ViewChild('ordersChart')  ordersChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart')  statusChartRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('topChart')     topChartRef!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('profitChart')  profitChartRef!:  ElementRef<HTMLCanvasElement>;

  private ordersChart?:  Chart;
  private revenueChart?: Chart;
  private statusChart?:  Chart;
  private topChart?:     Chart;
  private profitChart?:  Chart;

  private pollSub?: Subscription;

  // ── Status colour map ──────────────────────────────────────────────────────
  private readonly STATUS_COLORS: Record<string, string> = {
    PENDING:    '#f59e0b',
    CONFIRMED:  '#3b82f6',
    PROCESSING: '#8b5cf6',
    COMPLETED:  '#10b981',
    CANCELLED:  '#ef4444'
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.pollSub = interval(60_000).pipe(
      startWith(0),
      switchMap(() => forkJoin({
        stats:    this.analyticsSvc.getStats(),
        charts:   this.analyticsSvc.getChartData(this.selectedDays()),
        visitors: this.visitorSvc.getStats()
      }))
    ).subscribe({
      next: ({ stats, charts, visitors }) => {
        this.stats.set(stats);
        this.visitors.set(visitors);
        this.loading.set(false);
        // Defer one tick so Angular renders the canvas elements before we access them
        setTimeout(() => this.updateCharts(charts), 0);
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
    this.ordersChart?.destroy();
    this.revenueChart?.destroy();
    this.statusChart?.destroy();
    this.topChart?.destroy();
    this.profitChart?.destroy();
  }

  // ── Day filter ─────────────────────────────────────────────────────────────

  changeDays(days: number): void {
    this.selectedDays.set(days);
    this.dateFrom = '';
    this.dateTo   = '';
    this.analyticsSvc.getChartData(days).subscribe(data => this.updateCharts(data));
  }

  applyDateRange(): void {
    if (!this.dateFrom || !this.dateTo) return;
    this.selectedDays.set(0);
    this.analyticsSvc.getChartData(30, this.dateFrom, this.dateTo)
      .subscribe(data => this.updateCharts(data));
  }

  // ── Chart build & update ───────────────────────────────────────────────────

  private buildCharts(data: ChartData): void {
    this.buildOrdersChart(data);
    this.buildRevenueChart(data);
    this.buildStatusChart(data);
    this.buildTopChart(data);
    this.buildProfitChart(data);
  }

  private updateCharts(data: ChartData): void {
    if (!this.ordersChart) { this.buildCharts(data); return; }
    this.updateLine(this.ordersChart,  data.ordersByDate.map(d => d.label), data.ordersByDate.map(d => d.value));
    this.updateLine(this.revenueChart!, data.revenueByDate.map(d => d.label), data.revenueByDate.map(d => d.value));
    this.statusChart!.data.labels = data.orderStatus.map(s => s.status);
    this.statusChart!.data.datasets[0].data = data.orderStatus.map(s => s.count);
    this.statusChart!.update('active');
    this.topChart!.data.labels = data.topProducts.map(p => p.name);
    this.topChart!.data.datasets[0].data = data.topProducts.map(p => p.quantity);
    this.topChart!.update('active');
    // Profit chart
    if (this.profitChart && data.profitByDate) {
      this.profitChart.data.labels = data.profitByDate.map(d => d.label);
      this.profitChart.data.datasets[0].data = data.profitByDate.map(d => d.revenue);
      this.profitChart.data.datasets[1].data = data.profitByDate.map(d => d.cogs);
      this.profitChart.data.datasets[2].data = data.profitByDate.map(d => d.profit);
      this.profitChart.update('active');
    }
  }

  private buildOrdersChart(data: ChartData): void {
    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: data.ordersByDate.map(d => d.label),
        datasets: [{
          label: 'Orders',
          data: data.ordersByDate.map(d => d.value),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.10)',
          tension: 0.4, fill: true,
          pointRadius: 3, pointBackgroundColor: '#3b82f6'
        }]
      },
      options: this.lineOpts()
    };
    this.ordersChart = new Chart(this.ordersChartRef.nativeElement, cfg);
  }

  private buildRevenueChart(data: ChartData): void {
    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: data.revenueByDate.map(d => d.label),
        datasets: [{
          label: 'Revenue (₼)',
          data: data.revenueByDate.map(d => d.value),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.10)',
          tension: 0.4, fill: true,
          pointRadius: 3, pointBackgroundColor: '#10b981'
        }]
      },
      options: this.lineOpts()
    };
    this.revenueChart = new Chart(this.revenueChartRef.nativeElement, cfg);
  }

  private buildStatusChart(data: ChartData): void {
    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.orderStatus.map(s => s.status),
        datasets: [{
          data: data.orderStatus.map(s => s.count),
          backgroundColor: data.orderStatus.map(s => this.STATUS_COLORS[s.status] ?? '#9ca3af'),
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } }
        }
      }
    };
    this.statusChart = new Chart(this.statusChartRef.nativeElement, cfg);
  }

  private buildTopChart(data: ChartData): void {
    const BG = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444',
                 '#06b6d4','#84cc16','#f97316','#ec4899','#6366f1'];
    const cfg: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: data.topProducts.map(p => p.name),
        datasets: [{
          label: 'Units Sold',
          data: data.topProducts.map(p => p.quantity),
          backgroundColor: BG,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} units` } }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 11 } }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        }
      }
    };
    this.topChart = new Chart(this.topChartRef.nativeElement, cfg);
  }

  private buildProfitChart(data: ChartData): void {
    const pts = data.profitByDate ?? [];
    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: pts.map(d => d.label),
        datasets: [
          {
            label: 'Gəlir (₼)',
            data: pts.map(d => d.revenue),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            tension: 0.4, fill: false,
            pointRadius: 3, pointBackgroundColor: '#10b981'
          },
          {
            label: 'Maya (₼)',
            data: pts.map(d => d.cogs),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.08)',
            tension: 0.4, fill: false,
            pointRadius: 3, pointBackgroundColor: '#f59e0b'
          },
          {
            label: 'Mənfəət (₼)',
            data: pts.map(d => d.profit),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.10)',
            tension: 0.4, fill: true,
            pointRadius: 3, pointBackgroundColor: '#6366f1'
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { font: { size: 11 }, padding: 12 } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 11 } } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 11 } }, beginAtZero: true }
        }
      }
    };
    this.profitChart = new Chart(this.profitChartRef.nativeElement, cfg);
  }

  private updateLine(chart: Chart, labels: string[], values: number[]): void {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update('active');
  }

  private lineOpts(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 11 } }, beginAtZero: true }
      }
    };
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  formatCurrency(v: number): string {
    return new Intl.NumberFormat('az-AZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(v) + ' ₼';
  }
}
