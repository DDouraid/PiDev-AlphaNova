import { Component } from '@angular/core';

@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.component.html',
  styleUrls: ['./add-feedback.component.css']
})
export class AddFeedbackComponent {

  private inappropriateWords = ['putain', 'merde', 'con', 'salope'];

  checkForInappropriateWords(feedback: string): boolean {
    const words = feedback.toLowerCase().split(/\s+/);
    return words.some(word => this.inappropriateWords.includes(word));
  }

  // Example method to handle feedback submission
  submitFeedback(feedback: string): void {
    if (this.checkForInappropriateWords(feedback)) {
      console.warn('Feedback contains inappropriate words.');
      // Handle the case where inappropriate words are found
    } else {
      console.log('Feedback is clean.');
      // Proceed with feedback submission
    }
  }

}
