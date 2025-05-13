import { Component, OnInit } from '@angular/core';
import { PaymentService, Payment, PaymentMode } from '../../services/payment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  payments: Payment[] = [];
  newPayment: Payment = { id: null, amount: 0, mode: PaymentMode.CARD, date: '' };
  paymentModes: PaymentMode[] = [PaymentMode.CARD, PaymentMode.BANK_TRANSFER, PaymentMode.PAYPAL];
  searchTerm = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
    });
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Error loading payments', err);
      }
    });
  }
  startStripeCheckout() {
    this.paymentService.createCheckoutSession().subscribe({
      next: (url: string) => {
        window.location.href = url; // Redirect to Stripe Checkout
      },
      error: (err) => {
        console.error('Error creating Stripe session:', err);
        alert('Checkout failed.');
      }
    });
  }
  addPayment(): void {
    if (!this.newPayment.amount || !this.newPayment.mode || !this.newPayment.date) {
      this.errorMessage = 'Please fill all required fields';
      return;
    }

    this.isLoading = true;
    this.paymentService.addPayment(this.newPayment).subscribe({
      next: () => {
        this.handleSuccess('Payment added successfully');
        this.newPayment = { id: null, amount: 0, mode: PaymentMode.CARD, date: '' };
        this.loadPayments();
      },
      error: (err) => {
        this.handleError('Error adding payment', err);
      }
    });
  }

  deletePayment(id: number): void {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    this.isLoading = true;
    this.paymentService.deletePayment(id).subscribe({
      next: () => {
        this.handleSuccess('Payment deleted successfully');
        this.loadPayments();
      },
      error: (err) => {
        this.handleError('Error deleting payment', err);
      }
    });
  }

  filteredRows() {
    if (!this.searchTerm) {
      return this.payments;
    }
    return this.payments.filter(row =>
      row.amount.toString().includes(this.searchTerm) ||
      row.mode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      row.date.includes(this.searchTerm) ||
      (row.username && row.username.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRows().slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get totalPages() {
    return Math.ceil(this.filteredRows().length / this.itemsPerPage);
  }

  private handleSuccess(message: string): void {
    this.isLoading = false;
    this.successMessage = message;
    this.errorMessage = null;
    setTimeout(() => this.successMessage = null, 3000);
  }

  private handleError(context: string, error: any): void {
    console.error(`${context}:`, error);
    this.isLoading = false;
    this.errorMessage = `${context}: ${error.message || 'Unknown error'}`;
    this.successMessage = null;
    setTimeout(() => this.errorMessage = null, 5000);
  }
}
