package com.example.mhike.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.mhike.R;
import com.example.mhike.services.AuthService;
import com.example.mhike.ui.MainActivity;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.google.android.material.textview.MaterialTextView;

import okhttp3.OkHttpClient;

/**
 * LoginActivity - User login screen with authentication
 */
public class LoginActivity extends AppCompatActivity {
    
    private TextInputEditText usernameEditText;
    private TextInputEditText passwordEditText;
    private TextInputLayout usernameInputLayout;
    private TextInputLayout passwordInputLayout;
    private MaterialButton loginButton;
    private MaterialButton registerButton;
    private LinearProgressIndicator progressIndicator;
    private MaterialTextView errorTextView;
    
    private AuthService authService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Initialize auth service
        authService = new AuthService(this, new OkHttpClient());
        
        initializeUI();
        setupListeners();
        
        // Check if already logged in
        if (authService.isLoggedIn()) {
            navigateToMain();
        }
    }
    
    private void initializeUI() {
        usernameEditText = findViewById(R.id.usernameEditText);
        passwordEditText = findViewById(R.id.passwordEditText);
        usernameInputLayout = findViewById(R.id.usernameInputLayout);
        passwordInputLayout = findViewById(R.id.passwordInputLayout);
        loginButton = findViewById(R.id.loginButton);
        registerButton = findViewById(R.id.registerButton);
        progressIndicator = findViewById(R.id.progressIndicator);
        errorTextView = findViewById(R.id.errorTextView);
        
        // Hide progress bar initially
        progressIndicator.setVisibility(android.view.View.GONE);
        errorTextView.setVisibility(android.view.View.GONE);
    }
    
    private void setupListeners() {
        loginButton.setOnClickListener(v -> performLogin());
        registerButton.setOnClickListener(v -> navigateToRegister());
    }
    
    private void performLogin() {
        // Clear previous errors
        clearErrors();
        
        // Get input values
        String username = usernameEditText.getText().toString().trim();
        String password = passwordEditText.getText().toString().trim();
        
        // Validate inputs
        if (!validateInputs(username, password)) {
            return;
        }
        
        // Show loading
        setLoading(true);
        
        // Call auth service
        authService.signin(username, password, new AuthService.AuthCallback() {
            @Override
            public void onSuccess(String token, long userId, String username) {
                runOnUiThread(() -> {
                    setLoading(false);
                    Toast.makeText(LoginActivity.this, "Login successful", Toast.LENGTH_SHORT).show();
                    navigateToMain();
                });
            }
            
            @Override
            public void onError(String errorMessage) {
                runOnUiThread(() -> {
                    setLoading(false);
                    showError(errorMessage);
                });
            }
        });
    }
    
    private boolean validateInputs(String username, String password) {
        boolean isValid = true;
        
        if (TextUtils.isEmpty(username)) {
            usernameInputLayout.setError("Username is required");
            isValid = false;
        } else if (username.length() < 3) {
            usernameInputLayout.setError("Username must be at least 3 characters");
            isValid = false;
        }
        
        if (TextUtils.isEmpty(password)) {
            passwordInputLayout.setError("Password is required");
            isValid = false;
        } else if (password.length() < 6) {
            passwordInputLayout.setError("Password must be at least 6 characters");
            isValid = false;
        }
        
        return isValid;
    }
    
    private void clearErrors() {
        usernameInputLayout.setError(null);
        passwordInputLayout.setError(null);
        errorTextView.setVisibility(android.view.View.GONE);
    }
    
    private void showError(String message) {
        errorTextView.setText(message);
        errorTextView.setVisibility(android.view.View.VISIBLE);
    }
    
    private void setLoading(boolean isLoading) {
        progressIndicator.setVisibility(isLoading ? android.view.View.VISIBLE : android.view.View.GONE);
        loginButton.setEnabled(!isLoading);
        registerButton.setEnabled(!isLoading);
        usernameEditText.setEnabled(!isLoading);
        passwordEditText.setEnabled(!isLoading);
    }
    
    private void navigateToRegister() {
        Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
        startActivity(intent);
    }
    
    private void navigateToMain() {
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
