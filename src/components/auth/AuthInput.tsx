import React from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  type: 'email' | 'password' | 'text';
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  icon?: 'email' | 'lock' | 'user';
}

/**
 * Premium Auth Input Component
 * Dark, icon-inclusive input fields for onboarding flow
 */
const AuthInput: React.FC<AuthInputProps> = ({
  type,
  id,
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  required = false,
  minLength,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  icon = type === 'email' ? 'email' : type === 'password' ? 'lock' : 'user'
}) => {
  const IconComponent = icon === 'email' ? Mail : icon === 'lock' ? Lock : User;

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="auth-input-wrapper">
        {/* Left Icon */}
        <div className="auth-input-icon">
          <IconComponent size={18} />
        </div>
        
        {/* Input Field */}
        <input
          type={showPasswordToggle && showPassword ? 'text' : type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          minLength={minLength}
          className={`auth-input-field ${showPasswordToggle ? 'auth-input-with-toggle' : 'auth-input-no-toggle'}`}
        />
        
        {/* Password Toggle (Right Side) */}
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
