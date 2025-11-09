import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-2">{label}</label>}
      <input
        id={id}
        className="w-full px-4 py-2.5 border border-border-color rounded-xl shadow-sm placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-glow focus:border-primary-glow sm:text-sm bg-white/5 text-text-primary transition-all duration-300"
        style={{
            transition: 'box-shadow 0.3s ease',
        }}
        onFocus={(e) => e.target.style.boxShadow = '0 0 15px rgba(0, 255, 245, 0.3), inset 0 0 5px rgba(0, 255, 245, 0.2)'}
        onBlur={(e) => e.target.style.boxShadow = 'none'}
        {...props}
      />
    </div>
  );
};

export default Input;
