import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent {
  @Input() offerId!: number;
  @Input() studentId!: number;
  @Input() admissionPrediction: any = null; // Pre-existing prediction from backend
  @Output() predictionComplete = new EventEmitter<any>();

  showResults: boolean = true; // Always show results since prediction is pre-fetched
  error: string = '';

  constructor() {}

  ngOnInit(): void {
    if (!this.admissionPrediction) {
      this.error = 'No admission prediction available for this offer.';
      this.showResults = false;
    } else {
      this.predictionComplete.emit(this.admissionPrediction);
    }
  }

  getPredictionTitle(): string {
    if (!this.admissionPrediction) return '';

    const probability = this.admissionPrediction.probability;
    if (probability > 0.7) {
      return 'High Chance of Admission';
    } else if (probability >= 0.4) {
      return 'Moderate Chance of Admission';
    } else {
      return 'Low Chance of Admission';
    }
  }

  resetForm(): void {
    this.showResults = false;
    this.admissionPrediction = null;
    this.error = '';
  }

  getUniversityName(): string {
    if (!this.admissionPrediction) return 'N/A';
    const name = this.admissionPrediction.recommendedUniversity;
    if (!name || name === 'N/A') {
      return 'To reach more offers, consider enhancing your skills in in-demand areas such as programming, data analysis, or communication.';
    }
    return name;
  }

  getClusterExplanation(): string {
    if (!this.admissionPrediction) return 'N/A';
    switch (this.admissionPrediction.cluster) {
      case 1:
        return 'Cluster 1: Top-ranked universities with high research output.';
      case 2:
        return 'Cluster 2: Well-established universities with strong teaching.';
      case 3:
        return 'Cluster 3: Regional universities with good student support.';
      case 4:
        return 'Cluster 4: Specialized or emerging universities.';
      default:
        return 'Unknown cluster';
    }
  }
}