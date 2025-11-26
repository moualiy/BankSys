import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import useApi from '../hooks/useApi';
import { toast } from 'react-toastify';
import { Button, Input, Alert, Card } from '../components/ui';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { loading, error, request: apiRequest } = useApi();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const user = await apiRequest('post', '/users/login', { username, password });
      if (user && user.id) {
        localStorage.setItem('userId', user.id.toString());
        if (user.token) {
          localStorage.setItem('authToken', user.token);
        }
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        toast.error('Invalid username or password.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </motion.div>

      {/* Login Container */}
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sign in to your BankSys account
          </p>
        </motion.div>

        {/* Login Form Card */}
        <motion.div variants={itemVariants}>
          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <Alert type="error" title="Login Failed" closeable>
                  {typeof error === 'string' ? error : 'Please check your credentials and try again.'}
                </Alert>
              )}

              {/* Username Input */}
              <div>
                <Input
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: '' });
                  }}
                  error={errors.username}
                  icon={<Mail className="w-4 h-4" />}
                  disabled={loading}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  error={errors.password}
                  disabled={loading}
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-start text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600"
                    defaultChecked={false}
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Demo Credentials */}
              <motion.div
                variants={itemVariants}
                className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 border border-dashed border-neutral-300 dark:border-neutral-600"
              >
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3 uppercase">
                  Demo Credentials
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium">Username:</span> User5
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    <span className="font-medium">Password:</span> 5555
                  </p>
                </div>
              </motion.div>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-8 text-sm text-neutral-600 dark:text-neutral-400"
        >
          <p>
            BankSys © {new Date().getFullYear()} - Modern Banking System
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
