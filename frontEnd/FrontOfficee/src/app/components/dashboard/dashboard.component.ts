import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any[] = [];
  isSearching: boolean = false;

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load custom.min.js dynamically
    const customScript = document.createElement('script');
    customScript.src = 'assets/js/custom.min.js';
    customScript.async = true;
    document.body.appendChild(customScript);

    // Load dashboard-1.js dynamically
    const dashboardScript = document.createElement('script');
    dashboardScript.src = 'assets/js/dashboard/dashboard-1.js';
    dashboardScript.async = true;
    document.body.appendChild(dashboardScript);
  }

  onSearch(): void {
    this.isSearching = true;
    this.searchService.search(this.searchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error searching:', err);
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  navigateToResult(result: any): void {
    this.router.navigate([result.route]);
    this.searchQuery = ''; // Clear search input
    this.searchResults = []; // Clear search results
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }
}