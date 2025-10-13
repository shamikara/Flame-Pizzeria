'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendEmail } from '@/lib/email';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        const resetLink = `${window.location.origin}/reset-password?token=${result.token}`;
        
        const emailResult = await sendEmail({
          to: email,
          subject: 'Password Reset',
          template: 'password-reset',
          data: { resetLink }
        });

        setMessage(emailResult.success 
          ? 'Password reset link sent! Check your email.' 
          : 'Email failed: ' + emailResult.error
        );
      } else {
        setMessage(result.error || 'Failed to send reset link');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </Button>
      {message && (
        <p className={`text-sm text-center ${
          message.includes('failed') ? 'text-red-500' : 'text-green-500'
        }`}>
          {message}
        </p>
      )}
    </form>
  );
}