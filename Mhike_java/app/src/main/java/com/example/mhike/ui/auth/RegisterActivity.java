package com.example.mhike.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

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
 * RegisterActivity - User registration screen
 */
public class RegisterActivity extends AppCompatActivity {
    
    private TextInputEditText usernameEditText;
    private TextInputEditText passwordEditText;
    private TextInputEditText confirmPasswordEditText;
    private TextInputEditText bioEditText;
    private TextInputEditText regionEditText;
    private TextInputLayout usernameInputLayout;
    private TextInputLayout passwordInputLayout;
    private TextInputLayout confirmPasswordInputLayout;
    private TextInputLayout bioInputLayout;
    private TextInputLayout regionInputLayout;
    private MaterialButton registerButton;
    private MaterialButton loginButton;
    private LinearProgressIndicator progressIndicator;
    private MaterialTextView errorTextView;
    
    private AuthService authService;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);
        
        // Set up toolbar
        Toolbar toolbar = findViewById(R.id.registerTopAppBar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        
        // Initialize auth service
        authService = new AuthService(this, new OkHttpClient());
        
        initializeUI();
        setupListeners();
    }
    
    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
    
    private void initializeUI() {
        usernameEditText = findViewById(R.id.usernameEditText);
        passwordEditText = findViewById(R.id.passwordEditText);
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText);
        bioEditText = findViewById(R.id.bioEditText);
        regionEditText = findViewById(R.id.regionEditText);
        
        usernameInputLayout = findViewById(R.id.usernameInputLayout);
        passwordInputLayout = findViewById(R.id.passwordInputLayout);
        confirmPasswordInputLayout = findViewById(R.id.confirmPasswordInputLayout);
        bioInputLayout = findViewById(R.id.bioInputLayout);
        regionInputLayout = findViewById(R.id.regionInputLayout);
        
        registerButton = findViewById(R.id.registerButton);
        loginButton = findViewById(R.id.loginButton);
        progressIndicator = findViewById(R.id.progressIndicator);
        errorTextView = findViewById(R.id.errorTextView);
        
        // Hide progress bar initially
        progressIndicator.setVisibility(android.view.View.GONE);
        errorTextView.setVisibility(android.view.View.GONE);
    }
    
    private void setupListeners() {
        registerButton.setOnClickListener(v -> performRegister());
        loginButton.setOnClickListener(v -> navigateToLogin());
    }
    
    private void performRegister() {
        // Clear previous errors
        clearErrors();
        
        // Get input values
        String username = usernameEditText.getText().toString().trim();
        String password = passwordEditText.getText().toString().trim();
        String confirmPassword = confirmPasswordEditText.getText().toString().trim();
        String bio = bioEditText.getText().toString().trim();
        String region = regionEditText.getText().toString().trim();
        
        // Validate inputs
        if (!validateInputs(username, password, confirmPassword, bio, region)) {
            return;
        }
        
        // Show loading
        setLoading(true);
        
        // Call auth service
        authService.signup(username, password, bio, region, null, new AuthService.AuthCallback() {
            @Override
            public void onSuccess(String token, long userId, String username) {
                runOnUiThread(() -> {
                    setLoading(false);
                    Toast.makeText(RegisterActivity.this, "Registration successful", Toast.LENGTH_SHORT).show();
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
    
    private boolean validateInputs(String username, String password, String confirmPassword, String bio, String region) {
        boolean isValid = true;
        
        if (TextUtils.isEmpty(username)) {
            usernameInputLayout.setError("Username is required");
            isValid = false;
        } else if (username.length() < 3) {
            usernameInputLayout.setError("Username must be at least 3 characters");
            isValid = false;
        } else if (!username.matches("^[a-zA-Z0-9_]+$")) {
            usernameInputLayout.setError("Username can only contain letters, numbers, and underscores");
            isValid = false;
        }
        
        if (TextUtils.isEmpty(password)) {
            passwordInputLayout.setError("Password is required");
            isValid = false;
        } else if (password.length() < 6) {
            passwordInputLayout.setError("Password must be at least 6 characters");
            isValid = false;
        }
        
        if (TextUtils.isEmpty(confirmPassword)) {
            confirmPasswordInputLayout.setError("Please confirm your password");
            isValid = false;
        } else if (!password.equals(confirmPassword)) {
            confirmPasswordInputLayout.setError("Passwords do not match");
            isValid = false;
        }
        
        if (TextUtils.isEmpty(region)) {
            regionInputLayout.setError("Region is required");
            isValid = false;
        }
        
        // Bio is optional but show warning if too long
        if (bio.length() > 500) {
            bioInputLayout.setError("Bio must be 500 characters or less");
            isValid = false;
        }
        
        return isValid;
    }
    
    private void clearErrors() {
        usernameInputLayout.setError(null);
        passwordInputLayout.setError(null);
        confirmPasswordInputLayout.setError(null);
        bioInputLayout.setError(null);
        regionInputLayout.setError(null);
        errorTextView.setVisibility(android.view.View.GONE);
    }
    
    private void showError(String message) {
        errorTextView.setText(message);
        errorTextView.setVisibility(android.view.View.VISIBLE);
    }
    
    private void setLoading(boolean isLoading) {
        progressIndicator.setVisibility(isLoading ? android.view.View.VISIBLE : android.view.View.GONE);
        registerButton.setEnabled(!isLoading);
        loginButton.setEnabled(!isLoading);
        usernameEditText.setEnabled(!isLoading);
        passwordEditText.setEnabled(!isLoading);
        confirmPasswordEditText.setEnabled(!isLoading);
        bioEditText.setEnabled(!isLoading);
        regionEditText.setEnabled(!isLoading);
    }
    
    private void navigateToLogin() {
        finish();
    }
    
    private void navigateToMain() {
        Intent intent = new Intent(RegisterActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
