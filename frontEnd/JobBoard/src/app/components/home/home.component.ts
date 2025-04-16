import { Component, type OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { HttpClient, HttpParams } from "@angular/common/http"
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser"
import {
  Document,
  DocumentType,
  DocumentResponse,
  ResumeGenerationRequest,
  ReportGenerationRequest,
  AgreementGenerationRequest
} from "src/models/document.model"
import { saveAs } from 'file-saver'

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  isLoading = false
  errorMessage = ""

  // Document generation
  userId: number | null = null
  showResumeModal = false
  showReportModal = false
  showAgreementModal = false

  // PDF viewer
  pdfUrl: SafeResourceUrl | null = null
  showPdfViewer = false

  // Document history
  documents: Document[] = []
  documentTypes = DocumentType

  // Document generation form data
  resumeForm = {
    skills: '',
    experience: '',
    education: ''
  }

  reportForm = {
    title: '',
    content: ''
  }

  agreementForm = {
    companyName: '',
    duration: ''
  }

  backendUrl = "http://localhost:8080"

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.loadDocuments()
  }

  // Modal controls
  openResumeModal(): void {
    this.showResumeModal = true
  }

  closeResumeModal(): void {
    this.showResumeModal = false
  }

  openReportModal(): void {
    this.showReportModal = true
  }

  closeReportModal(): void {
    this.showReportModal = false
  }

  openAgreementModal(): void {
    this.showAgreementModal = true
  }

  closeAgreementModal(): void {
    this.showAgreementModal = false
  }

  // Document generation
  generateResume(): void {
    if (!this.userId) {
      this.errorMessage = "Please enter a valid user ID"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const request: ResumeGenerationRequest = {
      ...this.resumeForm,
      userId: this.userId
    }

    const params = new HttpParams()
      .set('skills', request.skills || '')
      .set('experience', request.experience || '')
      .set('education', request.education || '')
      .set('userId', request.userId.toString())

    this.http
      .post(`${this.backendUrl}/api/resumes`, {}, {
        params,
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
          this.showPdfViewer = true
          this.isLoading = false
          this.closeResumeModal()
        },
        error: (err) => {
          this.errorMessage = "Error generating resume: " + (err.message || "Unknown error")
          this.isLoading = false
          this.closeResumeModal()
        },
      })
  }

  generateReport(): void {
    if (!this.userId) {
      this.errorMessage = "Please enter a valid user ID"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const request: ReportGenerationRequest = {
      ...this.reportForm,
      userId: this.userId
    }

    const params = new HttpParams()
      .set('title', request.title || '')
      .set('content', request.content || '')
      .set('userId', request.userId.toString())

    this.http
      .post(`${this.backendUrl}/api/reports`, {}, {
        params,
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
          this.showPdfViewer = true
          this.isLoading = false
          this.closeReportModal()
        },
        error: (err) => {
          this.errorMessage = "Error generating report: " + (err.message || "Unknown error")
          this.isLoading = false
          this.closeReportModal()
        },
      })
  }

  generateAgreement(): void {
    if (!this.userId) {
      this.errorMessage = "Please enter a valid user ID"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const request: AgreementGenerationRequest = {
      ...this.agreementForm,
      userId: this.userId
    }

    const params = new HttpParams()
      .set('companyName', request.companyName)
      .set('duration', request.duration)
      .set('userId', request.userId.toString())

    this.http
      .post(`${this.backendUrl}/api/agreements`, {}, {
        params,
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
          this.showPdfViewer = true
          this.isLoading = false
          this.closeAgreementModal()
        },
        error: (err) => {
          this.errorMessage = "Error generating agreement: " + (err.message || "Unknown error")
          this.isLoading = false
          this.closeAgreementModal()
        },
      })
  }

  closePdfViewer(): void {
    this.showPdfViewer = false
    this.pdfUrl = null
  }

  // Document history methods
  loadDocuments(): void {
    // if (!this.userId) {
    //   return
    // }
this.userId =1
    this.isLoading = true
    this.errorMessage = ""

    const params = new HttpParams()
      .set('userId', this.userId.toString())

    this.http
      .get<Document[]>(`${this.backendUrl}/api/documents/my-documents`, { params })
      .subscribe({
        next: (documents) => {
          this.documents = documents
          this.isLoading = false
        },
        error: (err) => {
          this.errorMessage = "Error loading documents: " + (err.message || "Unknown error")
          this.isLoading = false
        },
      })
  }

  viewDocument(documentId: number): void {
    if (!this.userId) {
      this.errorMessage = "Please enter a valid user ID"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const params = new HttpParams()
      .set('documentId', documentId.toString())
      .set('userId', this.userId.toString())

    this.http
      .get(`${this.backendUrl}/api/documents/view`, {
        params,
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
          this.showPdfViewer = true
          this.isLoading = false
        },
        error: (err) => {
          this.errorMessage = "Error viewing document: " + (err.message || "Unknown error")
          this.isLoading = false
        },
      })
  }

  downloadDocument(documentId: number): void {
    if (!this.userId) {
      this.errorMessage = "Please enter a valid user ID"
      return
    }

    this.isLoading = true
    this.errorMessage = ""

    const params = new HttpParams()
      .set('documentId', documentId.toString())
      .set('userId', this.userId.toString())

    this.http
      .get(`${this.backendUrl}/api/documents/download`, {
        params,
        responseType: 'blob',
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response.body as Blob], { type: 'application/pdf' })
          const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'document.pdf'
          saveAs(blob, filename)
          this.isLoading = false
        },
        error: (err) => {
          this.errorMessage = "Error downloading document: " + (err.message || "Unknown error")
          this.isLoading = false
        },
      })
  }

  getDocumentTypeLabel(type: DocumentType): string {
    switch (type) {
      case DocumentType.RESUME:
        return "Resume"
      case DocumentType.REPORT:
        return "Report"
      case DocumentType.AGREEMENT:
        return "Agreement"
      default:
        return "Unknown"
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }
}
