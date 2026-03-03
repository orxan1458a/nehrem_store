import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { DeliveryMethod } from '../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  private fb          = inject(FormBuilder);
  private cartSvc     = inject(CartService);
  private orderSvc    = inject(OrderService);
  private whatsappSvc = inject(WhatsappService);
  private router      = inject(Router);

  cart = this.cartSvc;
  submitting = signal(false);
  error = signal('');

  form = this.fb.group({
    firstName:      ['', [Validators.required, Validators.maxLength(100)]],
    lastName:       ['', [Validators.required, Validators.maxLength(100)]],
    phone:          ['', [Validators.required, Validators.pattern(/^[+]?[0-9\s\-()]{7,20}$/)]],
    deliveryMethod: ['DELIVERY' as DeliveryMethod, Validators.required],
    address:        [''],
    notes:          ['']
  });

  get deliveryMethod(): DeliveryMethod {
    return this.form.get('deliveryMethod')!.value as DeliveryMethod;
  }

  get isDelivery(): boolean { return this.deliveryMethod === 'DELIVERY'; }

  setMethod(method: DeliveryMethod): void {
    this.form.patchValue({ deliveryMethod: method, address: '' });
    const addrCtrl = this.form.get('address')!;
    if (method === 'DELIVERY') {
      addrCtrl.setValidators([Validators.required, Validators.maxLength(500)]);
    } else {
      addrCtrl.clearValidators();
    }
    addrCtrl.updateValueAndValidity();
  }

  onConfirmOrder(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.cart.items().length === 0) { this.error.set('Your cart is empty.'); return; }

    this.submitting.set(true);
    this.error.set('');

    const val = this.form.getRawValue();

    // Save order to backend first, then open WhatsApp
    this.orderSvc.create({
      firstName:      val.firstName!,
      lastName:       val.lastName!,
      phone:          val.phone!,
      deliveryMethod: val.deliveryMethod as DeliveryMethod,
      address:        val.address || undefined,
      notes:          val.notes   || undefined,
      items: this.cart.items().map(i => ({
        productId: i.product.id,
        quantity:  i.quantity
      }))
    }).subscribe({
      next: () => {
        // Open WhatsApp with formatted message
        this.whatsappSvc.openWhatsApp(
          {
            firstName:      val.firstName!,
            lastName:       val.lastName!,
            phone:          val.phone!,
            deliveryMethod: val.deliveryMethod as DeliveryMethod,
            address:        val.address || undefined,
            notes:          val.notes   || undefined
          },
          this.cart.items(),
          this.cart.subtotal()
        );
        this.cart.clear();
        this.router.navigate(['/shop']);
      },
      error: err => {
        this.error.set(err?.error?.message ?? 'Failed to place order. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  hasError(field: string, error = ''): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl || !ctrl.touched) return false;
    return error ? ctrl.hasError(error) : ctrl.invalid;
  }
}
