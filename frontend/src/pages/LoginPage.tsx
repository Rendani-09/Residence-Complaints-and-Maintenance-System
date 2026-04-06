import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      if (email.includes('admin')) navigate('/admin');
      else navigate('/dashboard');
    }
  };

  const handleDemoLogin = (role: 'student' | 'admin') => {
    loginAsRole(role);
    if (role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 items-center justify-center bg-primary lg:flex">
        <div className="max-w-md px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/20 font-heading font-bold text-3xl text-primary-foreground">
              RC
            </div>
            <h1 className="font-heading text-3xl font-bold text-primary-foreground">
              ResComplaints
            </h1>
            <p className="mt-3 text-primary-foreground/80 text-lg">
              Student Residence Complaints and Maintenance System
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-xl">
              RC
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">ResComplaints</h1>
          </div>

          <h2 className="font-heading text-2xl font-bold text-foreground">Welcome back</h2>
          <p className="mt-1 text-muted-foreground">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.ac.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up as Student
            </Link>
          </p>

          <div className="mt-8 border-t pt-6">
            <p className="mb-3 text-center text-xs text-muted-foreground">Quick demo access</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDemoLogin('student')}>
                Login as Student
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDemoLogin('admin')}>
                Login as Admin
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
