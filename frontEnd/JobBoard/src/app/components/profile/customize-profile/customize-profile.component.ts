import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-customize-profile',
  templateUrl: './customize-profile.component.html',
  styleUrls: ['./customize-profile.component.css']
})
export class CustomizeProfileComponent implements OnInit {
  user = {
    username: '',
    email: '',
    roles: [] as string[],
    profileImage: ''
  };
  cvForm: FormGroup;
  isSaving = false;
  previewVisible = false;
  errorMessage = '';
  currentYear: number = new Date().getFullYear();
  suggestedAbout: string = `I am a [Job Title] with [Number] years of experience in [Industry/Field].
                             I specialize in [Skill/Technology], and I have a proven track record of [Achievement or Responsibility].
                              I am passionate about [Interest or Goal], and I thrive in [Work Environment or Team Setting].`;
  // Suggested skills, languages, and certifications
  suggestedSkills: string[] = [
    'React.js', 'SQL', 'Teamwork', 'AngularJS', 'Software Development',
    'Amazon Web Services (AWS)', 'Git', 'C#', 'Docker Products', 'Agile Methodologies'
  ];
  suggestedLanguages: string[] = [
    'English - Fluent', 'Spanish - Intermediate', 'French - Native',
    'German - Beginner', 'Arabic - Fluent', 'Mandarin - Intermediate'
  ];
  suggestedCertifications: { name: string, issuer: string, issueDate: string }[] = [
    { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', issueDate: '2023-01' },
    { name: 'Certified ScrumMaster (CSM)', issuer: 'Scrum Alliance', issueDate: '2022-06' },
    { name: 'Google Cloud Professional Data Engineer', issuer: 'Google', issueDate: '2023-03' },
    { name: 'Microsoft Azure Fundamentals', issuer: 'Microsoft', issueDate: '2022-09' },
    { name: 'Cisco Certified Network Associate (CCNA)', issuer: 'Cisco', issueDate: '2021-12' },
    { name: 'Project Management Professional (PMP)', issuer: 'PMI', issueDate: '2023-05' }
  ];
  suggestedExperiences: { company: string, position: string, duration: string, description: string }[] = [
    { company: 'Google', position: 'Software Engineer', duration: '2020-2023', description: 'Developed scalable web applications using React and Node.js.' },
    { company: 'Microsoft', position: 'Data Analyst', duration: '2019-2022', description: 'Analyzed large datasets to provide actionable insights using SQL and Power BI.' },
    { company: 'Amazon', position: 'Cloud Engineer', duration: '2021-2023', description: 'Designed and implemented cloud solutions on AWS.' },
    { company: 'IBM', position: 'Project Manager', duration: '2018-2021', description: 'Led cross-functional teams to deliver projects on time using Agile methodologies.' },
    { company: 'Tesla', position: 'Electrical Engineer', duration: '2020-2022', description: 'Designed electrical systems for autonomous vehicles.' },
    { company: 'Facebook', position: 'Product Manager', duration: '2019-2023', description: 'Managed product lifecycle from ideation to launch.' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.cvForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      headline: ['', [Validators.maxLength(120)]],
      currentPosition: ['', [Validators.maxLength(100)]],
      industry: ['', [Validators.maxLength(50)]],
      location: ['', [Validators.maxLength(100)]],
      website: ['', [Validators.pattern('https?://.+'), Validators.maxLength(200)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.pattern('^[0-9]{10}$'), Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(200)]],
      about: ['', [Validators.maxLength(2000)]],
      profileImage: [''],
      education: this.fb.array([]),
      experience: this.fb.array([]),
      skills: ['', [Validators.maxLength(500)]],
      languages: ['', [Validators.maxLength(500)]],
      certifications: this.fb.array([]),
      projects: this.fb.array([]),
      publications: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadUserInfo();
    if (this.educationArray.length === 0) this.addEducation();
    if (this.experienceArray.length === 0) this.addExperience();
  }

  loadUserInfo(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.authService.getCurrentUserFromServer().subscribe({
      next: (response) => {
        this.cvForm.patchValue({
          email: response.email || '',
          fullName: response.username || '',
          profileImage: response.profileImage ||'' // Adjust based on actual field name
        });
        console.log('Loaded user info:', this.cvForm.value);
      },
      error: (err) => {
        this.errorMessage = 'Error fetching user info: ' + (err.message || 'Unknown error');
        this.router.navigate(['/login']);
      }
    });
  }
  sanitizeImageUrl(url: string): string {
    return this.sanitizer.bypassSecurityTrustUrl(url) as string;
  }

  // FormArray getters
  get educationArray(): FormArray { return this.cvForm.get('education') as FormArray; }
  get experienceArray(): FormArray { return this.cvForm.get('experience') as FormArray; }
  get certificationsArray(): FormArray { return this.cvForm.get('certifications') as FormArray; }
  get projectsArray(): FormArray { return this.cvForm.get('projects') as FormArray; }
  get publicationsArray(): FormArray { return this.cvForm.get('publications') as FormArray; }


// Method to add the suggested About paragraph
addSuggestedAbout(): void {
  const currentAbout = this.cvForm.get('about')?.value || '';
  if (!currentAbout.trim()) { // Only set if the textarea is empty
    this.cvForm.get('about')?.setValue(this.suggestedAbout);
  } else {
    // Optionally, append the suggested paragraph if the textarea already has content
    this.cvForm.get('about')?.setValue(`${currentAbout}\n\n${this.suggestedAbout}`);
  }
}
  // Add/Remove methods
  addEducation(): void {
    const educationGroup = this.fb.group({
      institution: ['', [Validators.required, Validators.maxLength(100)]],
      degree: ['', [Validators.required, Validators.maxLength(100)]],
      year: ['', [Validators.required, Validators.pattern('^[0-9]{4}$'), Validators.min(1900), Validators.max(this.currentYear)]]
    });
    this.educationArray.push(educationGroup);
  }

  removeEducation(index: number): void { this.educationArray.removeAt(index); }

  addExperience(): void {
    const experienceGroup = this.fb.group({
      company: ['', [Validators.required, Validators.maxLength(100)]],
      position: ['', [Validators.required, Validators.maxLength(100)]],
      duration: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', Validators.maxLength(500)]
    });
    this.experienceArray.push(experienceGroup);
  }

  removeExperience(index: number): void { this.experienceArray.removeAt(index); }

  addCertification(): void {
    const certificationGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      issuer: ['', [Validators.required, Validators.maxLength(100)]],
      issueDate: ['', [Validators.pattern('^[0-9]{4}-[0-9]{2}$')]]
    });
    this.certificationsArray.push(certificationGroup);
  }

  // Method to add a suggested certification
  addSuggestedCertification(cert: { name: string, issuer: string, issueDate: string }): void {
    const existingCerts = this.certificationsArray.value as { name: string, issuer: string, issueDate: string }[];
    const certExists = existingCerts.some(existingCert => 
      existingCert.name === cert.name && existingCert.issuer === cert.issuer
    );

    if (!certExists) {
      const certificationGroup = this.fb.group({
        name: [cert.name, [Validators.required, Validators.maxLength(100)]],
        issuer: [cert.issuer, [Validators.required, Validators.maxLength(100)]],
        issueDate: [cert.issueDate, [Validators.pattern('^[0-9]{4}-[0-9]{2}$')]]
      });
      this.certificationsArray.push(certificationGroup);
    }
  }

  removeCertification(index: number): void { this.certificationsArray.removeAt(index); }

  addSuggestedExperience(exp: { company: string, position: string, duration: string, description: string }): void {
    const existingExps = this.experienceArray.value as { company: string, position: string, duration: string, description: string }[];
    const expExists = existingExps.some(existingExp => 
      existingExp.company === exp.company && existingExp.position === exp.position
    );
  
    if (!expExists) {
      const experienceGroup = this.fb.group({
        company: [exp.company, [Validators.required, Validators.maxLength(100)]],
        position: [exp.position, [Validators.required, Validators.maxLength(100)]],
        duration: [exp.duration, [Validators.required, Validators.maxLength(50)]],
        description: [exp.description, Validators.maxLength(500)]
      });
      this.experienceArray.push(experienceGroup);
    }
  }
  addProject(): void {
    const projectGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      url: ['', [Validators.pattern('https?://.+')]]
    });
    this.projectsArray.push(projectGroup);
  }

  removeProject(index: number): void { this.projectsArray.removeAt(index); }

  addPublication(): void {
    const publicationGroup = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      publisher: ['', [Validators.maxLength(100)]],
      publicationDate: ['', [Validators.pattern('^[0-9]{4}-[0-9]{2}$')]],
      url: ['', [Validators.pattern('https?://.+')]]
    });
    this.publicationsArray.push(publicationGroup);
  }

  removePublication(index: number): void { this.publicationsArray.removeAt(index); }

  addSkill(skill: string): void {
    const currentSkills = this.cvForm.get('skills')?.value || '';
    const skillsArray = currentSkills.split('\n').filter((line: string) => line.trim());
    if (!skillsArray.includes(skill)) {
      const newSkills = currentSkills ? `${currentSkills}\n${skill}` : skill;
      this.cvForm.get('skills')?.setValue(newSkills);
    }
  }

  addLanguage(language: string): void {
    const currentLanguages = this.cvForm.get('languages')?.value || '';
    const languagesArray = currentLanguages.split('\n').filter((line: string) => line.trim());
    if (!languagesArray.includes(language)) {
      const newLanguages = currentLanguages ? `${currentLanguages}\n${language}` : language;
      this.cvForm.get('languages')?.setValue(newLanguages);
    }
  }

  

  saveProfile(): void {
    if (this.cvForm.valid) {
      this.isSaving = true;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      this.generateCV(doc).then(() => {
        const pdfBlob = doc.output('blob');
        const formData = new FormData();
        formData.append('cv', pdfBlob, `profile_${this.user.username || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`);

        this.authService.CVtoBack(formData).subscribe({
          next: (response) => {
            console.log('CV saved:', response);
            this.isSaving = false;
            this.errorMessage = '';
            alert('CV saved successfully!');
          },
          error: (err) => {
            this.errorMessage = 'Error saving CV: ' + (err.message || 'Unknown error');
            console.error('Error saving CV:', err);
            this.isSaving = false;
          }
        });
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.cvForm.markAllAsTouched();
    }
  }

  togglePreview(): void {
    this.previewVisible = !this.previewVisible;
  }

 downloadCV(): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.generateCV(doc).then(() => {
      doc.save(`profile_${this.cvForm.get('fullName')?.value || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`);
    });
  }

 
 
  private generateCV(doc: jsPDF): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        doc.setFont('helvetica', 'normal');
        const formValue = this.cvForm.value;
        console.log('Form Value for PDF:', formValue);
  
        // Add header background
        doc.setFillColor(0, 102, 204);
        doc.rect(0, 0, 210, 40, 'F');
  
        let yPosition = 10;
  
       
  
        // Header Text (Name and Headline) beside the image
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        if (formValue.fullName) {
          doc.text(formValue.fullName, 45, 15, { maxWidth: 150 });
        }
        if (formValue.headline) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(230, 230, 230);
          doc.text(formValue.headline, 45, 25, { maxWidth: 150 });
        }
  
        yPosition = 45;
        this.addCVContent(doc, yPosition, formValue).then(() => {
          console.log('All content added successfully');
          resolve();
        }).catch((err) => {
          console.error('Error in addCVContent:', err);
          reject(err);
        });
      } catch (err) {
        console.error('Error in generateCV:', err);
        reject(err);
      }
    });
  }

  
  // Helper method (unchanged)
  private renderHeaderTextAndContent(doc: jsPDF, formValue: any, resolve: () => void): void {
    let yPosition = 10;
  
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    if (formValue.fullName) {
      doc.text(formValue.fullName, 10, yPosition, { maxWidth: 190 });
      yPosition += 10;
    }
  
    if (formValue.headline) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(230, 230, 230);
      doc.text(formValue.headline, 10, yPosition, { maxWidth: 190 });
      yPosition += 10;
    }
  
    yPosition = Math.max(yPosition, 40);
    this.addCVContent(doc, yPosition, formValue).then(resolve);
  }
  private addCVContent(doc: jsPDF, startY: number, formValue: any): Promise<void> {
    return new Promise((resolve) => {
      let yPosition = startY;

      // Contact Info (below header)
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray
      const contactInfo = [
        formValue.email || '',
        formValue.phone || '',
        formValue.location || ''
      ].filter(Boolean).join(' | ');
      if (contactInfo) {
        doc.text(contactInfo, 105, yPosition, { align: 'center' });
        yPosition += 10;
      }

      if (formValue.website) {
        doc.setTextColor(0, 123, 255); // Blue for links
        doc.textWithLink(formValue.website, 105, yPosition, { url: formValue.website, align: 'center' });
        yPosition += 10;
      }

      // Section Divider
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      // About Section
      if (formValue.about) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204); // Dark blue
        doc.text('About', 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51); // Dark gray
        const aboutLines = doc.splitTextToSize(formValue.about, 170);
        aboutLines.forEach((line: string) => {
          doc.text(line, 20, yPosition);
          yPosition += 5;
        });
        yPosition += 8;
      }

      // Two-Column Layout for Skills and Languages
      const leftColumnX = 20;
      const rightColumnX = 105;
      let leftY = yPosition;
      let rightY = yPosition;

      // Skills (Left Column)
      if (formValue.skills) {
        const skills = formValue.skills.split('\n').filter((line: string) => line.trim());
        if (skills.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 102, 204);
          doc.text('Skills', leftColumnX, leftY);
          leftY += 6;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 51, 51);
          skills.forEach((skill: string) => {
            doc.text(`• ${skill}`, leftColumnX + 5, leftY);
            leftY += 5;
          });
          leftY += 8;
        }
      }

      // Languages (Right Column)
      if (formValue.languages) {
        const languages = formValue.languages.split('\n').filter((line: string) => line.trim());
        if (languages.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 102, 204);
          doc.text('Languages', rightColumnX, rightY);
          rightY += 6;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 51, 51);
          languages.forEach((language: string) => {
            doc.text(`• ${language}`, rightColumnX + 5, rightY);
            rightY += 5;
          });
          rightY += 8;
        }
      }

      // Update yPosition to the max of leftY and rightY
      yPosition = Math.max(leftY, rightY);

      // Section Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      // Education
      if (formValue.education.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text('Education', 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        formValue.education.forEach((edu: any) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${edu.degree || ''}`, 20, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`${edu.institution || ''} (${edu.year || ''})`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 5;
      }

      // Experience
      if (formValue.experience.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text('Experience', 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        formValue.experience.forEach((exp: any) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${exp.position || ''}`, 20, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(exp.duration || '', 190, yPosition, { align: 'right' });
          yPosition += 5;
          doc.text(exp.company || '', 25, yPosition);
          yPosition += 5;
          if (exp.description) {
            const descLines = doc.splitTextToSize(exp.description, 160);
            descLines.forEach((line: string) => {
              doc.text(line, 25, yPosition);
              yPosition += 5;
            });
          }
          yPosition += 5;
        });
        yPosition += 5;
      }

      // Certifications
      if (formValue.certifications.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text('Certifications', 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        formValue.certifications.forEach((cert: any) => {
          doc.setFont('helvetica', 'bold');
          doc.text(`${cert.name || ''}`, 20, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`${cert.issuer || ''} (${cert.issueDate || ''})`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 5;
      }

      // Projects
      if (formValue.projects.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text('Projects', 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        formValue.projects.forEach((proj: any) => {
          doc.setFont('helvetica', 'bold');
          doc.text(proj.name || '', 20, yPosition);
          yPosition += 5;
          if (proj.description) {
            const descLines = doc.splitTextToSize(proj.description, 160);
            descLines.forEach((line: string) => {
              doc.text(line, 25, yPosition);
              yPosition += 5;
            });
          }
          if (proj.url) {
            doc.setTextColor(0, 123, 255);
            doc.textWithLink(proj.url, 25, yPosition, { url: proj.url });
            yPosition += 5;
          }
          yPosition += 5;
        });
        yPosition += 5;
      }

      // Publications
      if (formValue.publications.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 204);
        doc.text('Publications', 20, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        formValue.publications.forEach((pub: any) => {
          doc.setFont('helvetica', 'bold');
          doc.text(pub.title || '', 20, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.text(pub.publicationDate || '', 190, yPosition, { align: 'right' });
          yPosition += 5;
          doc.text(pub.publisher || '', 25, yPosition);
          yPosition += 5;
          if (pub.url) {
            doc.setTextColor(0, 123, 255);
            doc.textWithLink(pub.url, 25, yPosition, { url: pub.url });
            yPosition += 5;
          }
          yPosition += 5;
        });
      }

      resolve();
    });
  }

  generateProfileText(): string {
    const formValue = this.cvForm.value;
    console.log('Form Value for Preview:', formValue);
    let profile = `=== Profile ===\n\n`;

    if (formValue.fullName) profile += `Name: ${formValue.fullName}\n`;
    if (formValue.headline) profile += `Headline: ${formValue.headline}\n`;
    if (formValue.currentPosition) profile += `Current Position: ${formValue.currentPosition}\n`;
    if (formValue.industry) profile += `Industry: ${formValue.industry}\n`;
    if (formValue.location) profile += `Location: ${formValue.location}\n`;
    if (formValue.website) profile += `Website: ${formValue.website}\n`;
    if (formValue.email) profile += `Email: ${formValue.email}\n`;
    if (formValue.phone) profile += `Phone: ${formValue.phone}\n`;
    if (formValue.address) profile += `Address: ${formValue.address}\n`;

    if (formValue.about) {
      profile += `\n=== About ===\n${formValue.about}\n`;
    }

    if (formValue.education.length > 0) {
      profile += `\n=== Education ===\n`;
      formValue.education.forEach((edu: any, index: number) => {
        profile += `${index + 1}. ${edu.degree || ''} - ${edu.institution || ''} (${edu.year || ''})\n`;
      });
    }

    if (formValue.experience.length > 0) {
      profile += `\n=== Experience ===\n`;
      formValue.experience.forEach((exp: any, index: number) => {
        profile += `${index + 1}. ${exp.position || ''} at ${exp.company || ''} (${exp.duration || ''})\n`;
        if (exp.description) profile += `   ${exp.description}\n`;
      });
    }

    if (formValue.skills) {
      const skills = formValue.skills.split('\n').filter((line: string) => line.trim());
      if (skills.length > 0) {
        profile += `\n=== Skills ===\n`;
        skills.forEach((skill: string, index: number) => {
          profile += `${index + 1}. ${skill.trim()}\n`;
        });
      }
    }

    if (formValue.languages) {
      const languages = formValue.languages.split('\n').filter((line: string) => line.trim());
      if (languages.length > 0) {
        profile += `\n=== Languages ===\n`;
        languages.forEach((language: string, index: number) => {
          profile += `${index + 1}. ${language.trim()}\n`;
        });
      }
    }

    if (formValue.certifications.length > 0) {
      profile += `\n=== Certifications ===\n`;
      formValue.certifications.forEach((cert: any, index: number) => {
        profile += `${index + 1}. ${cert.name || ''} - ${cert.issuer || ''} (${cert.issueDate || ''})\n`;
      });
    }

    if (formValue.projects.length > 0) {
      profile += `\n=== Projects ===\n`;
      formValue.projects.forEach((proj: any, index: number) => {
        profile += `${index + 1}. ${proj.name || ''}\n`;
        if (proj.description) profile += `   ${proj.description}\n`;
        if (proj.url) profile += `   URL: ${proj.url}\n`;
      });
    }

    if (formValue.publications.length > 0) {
      profile += `\n=== Publications ===\n`;
      formValue.publications.forEach((pub: any, index: number) => {
        profile += `${index + 1}. ${pub.title || ''} - ${pub.publisher || ''} (${pub.publicationDate || ''})\n`;
        if (pub.url) profile += `   URL: ${pub.url}\n`;
      });
    }

    return profile.trim();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}