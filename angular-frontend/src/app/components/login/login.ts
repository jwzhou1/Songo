import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password, rememberMe } = this.loginForm.value;

      // Simulate API call
      setTimeout(() => {
        // Demo login - accept any email/password combination
        if (email && password) {
          // Store demo user data
          const userData = {
            id: 1,
            email: email,
            firstName: 'Demo',
            lastName: 'User',
            token: 'demo-jwt-token'
          };

          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', userData.token);

          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid email or password';
        }

        this.loading = false;
      }, 1500);
    }
  }
}
