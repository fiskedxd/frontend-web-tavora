import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../utils/api';

const HomePage = () => {
  const { user, login, getAuthHeaders } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navHide, setNavHide] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY && currentScrollY > 90;
      const scrollingUp = currentScrollY < lastScrollY;

      if (scrollingDown) {
        setShowNavbar(false);
        setNavHide(true);
        window.setTimeout(() => setNavHide(false), 320);
      } else if (scrollingUp) {
        setShowNavbar(true);
        setNavHide(false);
      }

      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);

      if (currentScrollY < 50) {
        setShowNavbar(true);
        setNavHide(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const Icons = {
    chat: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    user: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    login: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
    menu: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    download: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.707 10.708L16.293 9.29398L13 12.587V2.00098H11V12.587L7.70697 9.29398L6.29297 10.708L12 16.415L17.707 10.708Z" />
        <path d="M18 18.001V20.001H6V18.001H4V20.001C4 21.103 4.897 22.001 6 22.001H18C19.104 22.001 20 21.103 20 20.001V18.001H18Z" />
      </svg>
    ),
    play: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
    check: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    mic: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z" />
      </svg>
    ),
    message: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    video: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    headphones: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
    gamepad: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="11" x2="10" y2="11" />
        <line x1="8" y1="9" x2="8" y2="13" />
        <line x1="15" y1="12" x2="15.01" y2="12" />
        <line x1="18" y1="10" x2="18.01" y2="10" />
        <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
      </svg>
    ),
    zap: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    monitor: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    phone: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    console: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="6" cy="12" r="1" />
        <circle cx="18" cy="12" r="1" />
        <path d="M8 12h8" />
      </svg>
    ),
    star: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    arrowRight: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    shield: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    server: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    smile: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    music: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  };

  const goToPage = (path) => {
    window.location.href = path;
  };

  const onboardingOrder = ['email', 'password', 'displayName', 'phone', 'server'];
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [authMode, setAuthMode] = useState('onboarding');
  const [onboardingStep, setOnboardingStep] = useState('email');
  const [onboardingError, setOnboardingError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [onboardingData, setOnboardingData] = useState({
    email: '',
    password: '',
    displayName: '',
    country: 'FR',
    phone: '',
  });

  useEffect(() => {
    document.body.style.overflow = isOnboardingOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOnboardingOpen]);

  const stepMeta = {
    email: {
      title: 'Create your Tavora account',
      subtitle: 'Enter your email to get started.',
      stepLabel: 'Step 1 of 5',
      button: 'Continue',
    },
    password: {
      title: 'Create a password',
      subtitle: 'Choose a secure password for your Tavora account.',
      stepLabel: 'Step 2 of 5',
      button: 'Continue',
    },
    displayName: {
      title: 'Choose your display name',
      subtitle: 'This is the name your friends will see on Tavora.',
      stepLabel: 'Step 3 of 5',
      button: 'Continue',
    },
    phone: {
      title: 'Add your phone number',
      subtitle: 'Add your phone number to help secure your account.',
      stepLabel: 'Step 4 of 5',
      button: 'Continue',
    },
    server: {
      title: 'Create your first server',
      subtitle: 'Your server is where you meet your friends. Create your own and start chatting.',
      stepLabel: 'Step 5 of 5',
      button: 'Create my own',
    },
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    setAuthMode('onboarding');
    setOnboardingStep('email');
    setOnboardingError('');
    setVerificationSent(false);
    setVerificationCode('');
    setOnboardingData({ email: '', password: '', displayName: '', country: 'FR', phone: '' });
  };

  const goToLogin = () => {
    setAuthMode('login');
    setOnboardingError('');
  };

  const handleLogin = async () => {
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setOnboardingError('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    setAuthLoading(true);
    setOnboardingError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email.trim().toLowerCase(),
          password: loginData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Connexion impossible.');
      }

      login(data.user, data.token);
      closeOnboarding();
    } catch (error) {
      setOnboardingError(error.message || 'Connexion impossible.');
    } finally {
      setAuthLoading(false);
    }
  };

  const goToNextStep = () => {
    const currentIndex = onboardingOrder.indexOf(onboardingStep);

    if (onboardingStep === 'email') {
      if (!onboardingData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboardingData.email.trim())) {
        setOnboardingError('Please enter a valid email address.');
        return;
      }
    }

    if (onboardingStep === 'password') {
      if (!onboardingData.password.trim() || onboardingData.password.trim().length < 8) {
        setOnboardingError('Choose a password with at least 8 characters.');
        return;
      }
    }

    if (onboardingStep === 'displayName') {
      if (!onboardingData.displayName.trim()) {
        setOnboardingError('Please enter a display name.');
        return;
      }
    }

    if (onboardingStep === 'phone') {
      if (!onboardingData.country.trim() || !onboardingData.phone.trim()) {
        setOnboardingError('Please enter your country and phone number.');
        return;
      }
    }

    setOnboardingError('');
    if (currentIndex < onboardingOrder.length - 1) {
      setOnboardingStep(onboardingOrder[currentIndex + 1]);
    }
  };

  const handleOnboardingSubmit = async () => {
    if (onboardingStep === 'server') {
      setAuthLoading(true);
      setOnboardingError('');

      try {
        const usernameSeed = onboardingData.displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const payload = {
          username: usernameSeed || `user${Date.now()}`,
          displayName: onboardingData.displayName.trim(),
          email: onboardingData.email.trim().toLowerCase(),
          phone: onboardingData.phone.trim(),
          password: onboardingData.password,
          confirmPassword: onboardingData.password,
          acceptTerms: true,
          ...(verificationSent ? { verificationCode } : {}),
        };

        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Création du compte impossible.');
        }

        if (data.verificationRequired) {
          setVerificationSent(true);
          setOnboardingError('Un code de vérification a été envoyé à votre adresse e-mail.');
          return;
        }

        login(data.user, data.token);
        closeOnboarding();
      } catch (error) {
        setOnboardingError(error.message || 'Création du compte impossible.');
      } finally {
        setAuthLoading(false);
      }
      return;
    }
    goToNextStep();
  };

  const renderLoginContent = () => (
    <div className="animate-[onboarding-in_0.35s_ease-out]" style={{ animationName: 'onboarding-in', animationDuration: '0.35s', animationTimingFunction: 'ease-out' }}>
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300/70">Welcome back</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Log in to Tavora</h2>
        <p className="mt-3 text-sm text-white/55">Use your account details to continue inside the app.</p>
      </div>

      <div className="space-y-5">
        {onboardingError && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{onboardingError}</div>
        )}

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Email</span>
          <input
            type="email"
            value={loginData.email}
            onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-white/30"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Password</span>
          <input
            type="password"
            value={loginData.password}
            onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-white/30"
          />
        </label>

        <button type="button" onClick={handleLogin} disabled={authLoading} className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60">
          {authLoading ? 'Please wait…' : 'Log in'}
        </button>

        <button type="button" onClick={() => setAuthMode('onboarding')} className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.05] hover:text-white">
          Create account
        </button>
      </div>
    </div>
  );

  const renderOnboardingContent = () => {
    switch (onboardingStep) {
      case 'email':
        return (
          <div key="email" className="animate-[onboarding-in_0.35s_ease-out]" style={{ animationName: 'onboarding-in', animationDuration: '0.35s', animationTimingFunction: 'ease-out' }}>
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300/70">Track</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Create your Tavora account</h2>
              <p className="mt-3 text-sm text-white/55">Enter your email to get started.</p>
            </div>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Email</span>
                <input
                  type="email"
                  value={onboardingData.email}
                  onChange={(event) => setOnboardingData((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-white/30"
                />
              </label>
              <button type="button" onClick={handleOnboardingSubmit} className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90">
                Continue
              </button>
            </div>
          </div>
        );
      case 'password':
        return (
          <div key="password" className="animate-[onboarding-in_0.35s_ease-out]" style={{ animationName: 'onboarding-in', animationDuration: '0.35s', animationTimingFunction: 'ease-out' }}>
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300/70">Step 2 of 5</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Create a password</h2>
              <p className="mt-3 text-sm text-white/55">Choose a secure password for your Tavora account.</p>
            </div>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Password</span>
                <input
                  type="password"
                  value={onboardingData.password}
                  onChange={(event) => setOnboardingData((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter a secure password"
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-white/30"
                />
              </label>
              <button type="button" onClick={handleOnboardingSubmit} className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90">
                Continue
              </button>
            </div>
          </div>
        );
      case 'displayName':
        return (
          <div key="displayName" className="animate-[onboarding-in_0.35s_ease-out]" style={{ animationName: 'onboarding-in', animationDuration: '0.35s', animationTimingFunction: 'ease-out' }}>
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300/70">Step 3 of 5</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Choose your display name</h2>
              <p className="mt-3 text-sm text-white/55">This is the name your friends will see on Tavora.</p>
            </div>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Enter a Display Name</span>
                <input
                  type="text"
                  value={onboardingData.displayName}
                  onChange={(event) => setOnboardingData((current) => ({ ...current, displayName: event.target.value }))}
                  placeholder="Your display name"
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-white/30"
                />
              </label>
              <button type="button" onClick={handleOnboardingSubmit} className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90">
                Continue
              </button>
            </div>
          </div>
        );
      case 'phone':
        return (
          <div key="phone" className="animate-[onboarding-in_0.35s_ease-out]" style={{ animationName: 'onboarding-in', animationDuration: '0.35s', animationTimingFunction: 'ease-out' }}>
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300/70">Step 4 of 5</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Add your phone number</h2>
              <p className="mt-3 text-sm text-white/55">Add your phone number to help secure your account.</p>
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Country</span>
                  <select
                    value={onboardingData.country}
                    onChange={(event) => setOnboardingData((current) => ({ ...current, country: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20"
                  >
                    <option value="FR">France</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="DE">Germany</option>
                    <option value="ES">Spain</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/40">Phone number</span>
                  <input
                    type="tel"
                    value={onboardingData.phone}
                    onChange={(event) => setOnboardingData((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="612345678"
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1016] px-4 py-3.5 text-base text-white outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 placeholder:text-white/30"
                  />
                </label>
              </div>
              <button type="button" onClick={handleOnboardingSubmit} className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white/90">
                Continue
              </button>
            </div>
          </div>
        );
      case 'server':
        return (
          <div key="server" className="animate-[onboarding-in_0.35s_ease-out]" style={{ animationName: 'onboarding-in', animationDuration: '0.35s', animationTimingFunction: 'ease-out' }}>
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-300/70">Step 5 of 5</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Create your first server</h2>
              <p className="mt-3 text-sm text-white/55">Your server is where you meet your friends. Create your own and start chatting.</p>
            </div>
            <div className="space-y-5">
              {verificationSent ? (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                  <label className="block text-sm text-cyan-100">Code envoyé à ton adresse e-mail</label>
                  <input value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className="mt-3 w-full rounded-xl border border-cyan-200/20 bg-black/20 px-4 py-3 text-center font-mono text-xl tracking-[0.5em] text-white outline-none focus:border-cyan-200" />
                  <p className="mt-2 text-xs text-cyan-100/60">Le code expire dans 15 minutes.</p>
                  <button type="button" onClick={handleOnboardingSubmit} disabled={authLoading || verificationCode.length !== 6} className="mt-4 w-full rounded-xl bg-cyan-200 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{authLoading ? 'Vérification…' : 'Vérifier et créer mon compte'}</button>
                </div>
              ) : <button type="button" onClick={handleOnboardingSubmit} disabled={authLoading} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#0d1016] px-5 py-4 text-left transition hover:border-indigo-400/40 hover:bg-[#111724] disabled:cursor-not-allowed disabled:opacity-60">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/75">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <path d="M8 7h8M8 12h8M8 17h5" />
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-white">Create my own</span>
                </div>
                <svg className="h-5 w-5 text-white/60 transition group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-y-auto overflow-x-hidden">
          {/* AJOUTE CE STYLE ICI - JUSTE APRÈS LE DIV OUVERT */}
    {!user && (
      <style>{`
        /* Forcer la scrollbar visible sur PC pour la page d'accueil */
        body {
          overflow-y: auto !important;
        }
        
        html, body, #root {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        * {
          scrollbar-width: auto !important;
          scrollbar-color: rgba(255, 255, 255, 0.25) rgba(0, 0, 0, 0.3) !important;
        }
        
        *::-webkit-scrollbar {
          width: 12px !important;
          height: 12px !important;
        }
        
        *::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3) !important;
          border-radius: 9999px !important;
        }
        
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.12)) !important;
          border: 2px solid rgba(0, 0, 0, 0.2) !important;
          border-radius: 9999px !important;
          min-height: 40px !important;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2)) !important;
        }
      `}</style>
    )}
              <header className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-500 sm:px-6 sm:pt-4 lg:px-8 ${showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-14 opacity-0'}`}>
                <div className={`mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border border-white/[0.06] px-5 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-500 ${scrolled ? 'bg-[#030303]/95' : 'bg-[#030303]/80'} ${navHide ? 'animate-[nav-bounce_0.35s_ease-out]' : ''}`}>
                  <div className="absolute inset-0 overflow-y-auto rounded-[28px] pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent_40%)]" />
                  </div>
                  <div className="relative flex items-center gap-3">
                    <Link to="/" className="group flex items-center gap-3">
                      <div className="relative h-10 w-10">
                        <div className="absolute inset-0 rounded-2xl bg-white/[0.06] border border-white/[0.06] transition-all duration-300 group-hover:bg-white/[0.10] group-hover:border-white/[0.10]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                        </div>
                      </div>
                      <div className="leading-none">
                        <div className="text-base font-semibold tracking-[0.02em] text-white/90">Tavora</div>
                        <div className="text-[10px] uppercase tracking-[0.34em] text-white/25">signal • play • connect</div>
                      </div>
                    </Link>
                  </div>

                  <nav className="relative hidden items-center gap-1 lg:flex">
                    {[
                      { label: 'Discover', path: '/discover' },
                      { label: 'Spaces', path: '/spaces' },
                      { label: 'Safety', path: '/safety' },
                      { label: 'Support', path: '/support' },
                    ].map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => goToPage(item.path)}
                        className="group relative rounded-full px-4 py-2 text-sm text-white/40 transition-all duration-300 hover:bg-white/[0.04] hover:text-white/80"
                      >
                        <span>{item.label}</span>
                        <span className="absolute bottom-1 left-1/2 h-[1px] w-0 -translate-x-1/2 bg-white/40 transition-all duration-300 group-hover:w-[60%]" />
                      </button>
                    ))}
                  </nav>

                  <div className="relative flex items-center gap-3">
                    {user ? (
                      <Link
                        to={user?.id ? `/${user.id}/home` : '/home'}
                        className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-sm font-medium text-white/80 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.08] hover:text-white hover:border-white/[0.14]"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Open Tavora
                      </Link>
                    ) : (
                      <Link
                        to="/login"
                        className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white px-5 py-2 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 hover:border-white/20"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Login
                      </Link>
                    )}
                    <button
                      onClick={() => setMobileMenuOpen((prev) => !prev)}
                      className="rounded-full border border-white/[0.06] bg-white/[0.02] p-2.5 text-white/50 transition hover:bg-white/[0.06] hover:text-white/80 lg:hidden"
                      aria-label="Toggle menu"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>

                {mobileMenuOpen && (
                  <div className="mx-auto mt-3 max-w-7xl rounded-[24px] border border-white/[0.06] bg-[#030303]/95 px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:hidden">
                    <div className="flex flex-col gap-1">
                      {[
                        { label: 'Discover', path: '/discover' },
                        { label: 'Spaces', path: '/spaces' },
                        { label: 'Safety', path: '/safety' },
                        { label: 'Support', path: '/support' },
                      ].map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => goToPage(item.path)}
                          className="rounded-2xl px-4 py-2.5 text-left text-sm text-white/40 transition hover:bg-white/[0.04] hover:text-white/80"
                        >
                          {item.label}
                        </button>
                      ))}
                      {user ? (
                        <Link
                          to="/profile"
                          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/80"
                        >
                          Open Tavora
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white px-5 py-2.5 text-sm font-medium text-black"
                        >
                          Login
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </header>
      <section id="discover" className="relative pt-40 pb-36 px-6 sm:pt-48 md:pt-52 scroll-mt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-r from-indigo-500/[0.08] to-purple-500/[0.08] blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-indigo-400 rounded-full animate-pulse opacity-30" />
        <div className="absolute top-56 left-[10%] w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-20" />
        <div className="absolute bottom-40 right-[20%] w-4 h-4 bg-indigo-300/20 rounded-full animate-bounce opacity-10" />
        <div className="absolute top-1/3 left-[25%] w-1.5 h-1.5 bg-white/10 rounded-full animate-ping" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-7xl md:text-9xl font-extrabold leading-none tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Group chat</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">that's all fun</span>
            <br />
            <span className="bg-gradient-to-r from-white/50 to-white/20 bg-clip-text text-transparent">& games</span>
          </h1>

          <p className="text-lg text-white/30 max-w-xl mx-auto leading-relaxed font-light">
            Tavora is great for playing games and chilling with friends, or even building a worldwide community. Customize your own space to talk, play, and hang out.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
            <a href="#" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-semibold text-base hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl shadow-white/5">
              <span className="group-hover:translate-y-0.5 transition-transform duration-300">{Icons.download}</span>
              Download for Windows
            </a>
            <button type="button" onClick={() => setIsOnboardingOpen(true)} className="relative inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base hover:bg-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95">
              {Icons.play}
              Open in browser
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-white/15">
            {Icons.check}
            No credit card required
          </div>
        </div>
      </section>

      {isOnboardingOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#050508]/55 backdrop-blur-[2px] p-2 sm:p-4" onClick={closeOnboarding}>
          <div className="mx-auto w-full max-w-[1080px] pt-2 sm:pt-4" style={{ paddingTop: '10%' }} onClick={(event) => event.stopPropagation()}>
            <div
              className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0a0b10]/95 shadow-[0_40px_120px_rgba(0,0,0,0.72)]"
              style={{ animation: 'modal-in 0.32s ease-out both' }}
            >
              <button type="button" onClick={closeOnboarding} aria-label="Close onboarding" className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              <div className="grid max-h-[92vh] md:grid-cols-[0.95fr_1.05fr]">
                <div className="relative hidden overflow-hidden md:block">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/membrelistbackground.png')" }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,6,12,0.58),rgba(8,10,18,0.18),rgba(8,10,18,0.72))]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_32%)]" />
                  <div className="relative flex h-full min-h-[420px] flex-col justify-between p-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
                        <svg className="h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium tracking-[0.22em] text-white/80 uppercase">Tavora</span>
                    </div>

                    <div className="max-w-[280px] rounded-[20px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Welcome</p>
                      <p className="mt-2 text-2xl font-semibold text-white">Your space begins here.</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex min-h-[420px] flex-col justify-between bg-[#090b10] p-5 sm:p-8 lg:p-10">
                  {authMode === 'login' ? (
                    <>
                      <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-white/35">
                        <span>Tavora</span>
                        <span>Login</span>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        {renderLoginContent()}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
                        <button type="button" onClick={() => setAuthMode('onboarding')} className="transition hover:text-white/75">
                          Create account
                        </button>
                        <span>Secure access</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-white/35">
                        <span>Tavora</span>
                        <span>{stepMeta[onboardingStep].stepLabel}</span>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        {renderOnboardingContent()}
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.18em] text-white/35">
                        <button type="button" onClick={() => setOnboardingStep((current) => onboardingOrder[Math.max(0, onboardingOrder.indexOf(current) - 1)])} disabled={onboardingStep === 'email'} className="transition hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-40">
                          Back
                        </button>
                        <p>Already have an account? <button type="button" onClick={goToLogin} className="ml-1 text-white/70 hover:text-white">Log in</button></p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes onboarding-in {
          from { opacity: 0; transform: translateX(26px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <section id="spaces" className="py-36 px-6 relative scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="relative bg-[#08080d] rounded-3xl border border-white/[0.04] p-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.04] blur-2xl rounded-full" />
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0">A</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-indigo-300">Alex</span>
                        <span className="text-[10px] text-white/15">Today at 2:30 PM</span>
                      </div>
                      <div className="text-sm text-white/50">Ready for tonight? The server is up</div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-lg text-xs text-white/40">
                          {Icons.star}
                          <span>Hype</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-lg text-xs text-white/40">
                          {Icons.zap}
                          <span>Let's go</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0">S</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-purple-300">Sarah</span>
                        <span className="text-[10px] text-white/15">Today at 2:31 PM</span>
                      </div>
                      <div className="text-sm text-white/50">I'm bringing the new loadout</div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    {Icons.mic}
                    Soundboard active
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 block">Discover</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">Build spaces that feel made for your crew</h2>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                Discover new ways to personalize your rooms with stickers, custom status, soundboards, and playful energy that makes every conversation feel alive.
              </p>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-xs text-white/25">
                  <div className="w-8 h-8 bg-white/[0.03] rounded-xl flex items-center justify-center">{Icons.smile}</div>
                  Stickers
                </div>
                <div className="flex items-center gap-2 text-xs text-white/25">
                  <div className="w-8 h-8 bg-white/[0.03] rounded-xl flex items-center justify-center">{Icons.music}</div>
                  Soundboard
                </div>
                <div className="flex items-center gap-2 text-xs text-white/25">
                  <div className="w-8 h-8 bg-white/[0.03] rounded-xl flex items-center justify-center">{Icons.message}</div>
                  Custom status
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="safety" className="py-36 px-6 relative scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 block">Spaces</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">Create rooms for every kind of hangout</h2>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                From casual games to study sessions and late-night chillouts, your spaces can adapt to the vibe, the people, and the moment.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  {Icons.video}
                  <div>
                    <div className="text-xs text-white/60 font-medium">1080p 60fps</div>
                    <div className="text-[10px] text-white/20">Crystal clear</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  {Icons.zap}
                  <div>
                    <div className="text-xs text-white/60 font-medium">Ultra low latency</div>
                    <div className="text-[10px] text-white/20">No delay</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative bg-[#08080d] rounded-3xl border border-white/[0.04] p-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/[0.04] blur-2xl rounded-full" />
                <div className="aspect-video bg-gradient-to-br from-[#0a0a14] to-[#060610] rounded-2xl flex items-center justify-center border border-white/[0.04]">
                  <div className="w-20 h-20 bg-white/[0.04] rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-all duration-300 hover:scale-110 cursor-pointer group">
                    <div className="text-white/60 group-hover:text-white transition-colors">{Icons.play}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="relative bg-[#08080d] rounded-3xl border border-white/[0.04] p-10 overflow-hidden">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/[0.04] blur-2xl rounded-full" />
                <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                    {Icons.headphones}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/80">Voice Connected</div>
                    <div className="text-xs text-white/25 mt-0.5">3 friends in channel</div>
                  </div>
                  <div className="ml-auto flex -space-x-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-[#08080d] flex items-center justify-center text-[10px] font-bold">A</div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-[#08080d] flex items-center justify-center text-[10px] font-bold">S</div>
                    <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-[#08080d] flex items-center justify-center text-[10px] font-bold">M</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 block">Safety</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">Stay protected while your crew gathers</h2>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                Keep voice and text channels secure with privacy-first controls, calm moderation tools, and a smoother way to manage who joins the room.
              </p>
              <div className="mt-8 flex items-center gap-3 text-xs text-white/25">
                {Icons.shield}
                End-to-end encrypted voice channels
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-36 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 block">Activities</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">Always have something to do together</h2>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                Watch videos, play built-in games, listen to music, or just scroll together. Seamlessly text, call, video chat, and play games, all in one group chat.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Icons.gamepad, label: 'Games', color: 'from-indigo-400 to-purple-500' },
                  { icon: Icons.video, label: 'Watch', color: 'from-purple-400 to-pink-500' },
                  { icon: Icons.music, label: 'Listen', color: 'from-pink-400 to-red-500' },
                  { icon: Icons.zap, label: 'Play', color: 'from-amber-400 to-orange-500' },
                  { icon: Icons.message, label: 'Chat', color: 'from-green-400 to-emerald-500' },
                  { icon: Icons.server, label: 'Hang out', color: 'from-cyan-400 to-blue-500' },
                ].map((item, i) => (
                  <div key={i} className="aspect-square bg-white/[0.02] border border-white/[0.04] rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <div className="text-white/30 group-hover:text-white/60 transition-colors">{item.icon}</div>
                    <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 overflow-hidden whitespace-nowrap">
        <div className="inline-flex gap-12 text-2xl font-bold tracking-wider animate-scroll">
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="mx-4">talk</span>
              <span className="mx-4 opacity-40">•</span>
              <span className="mx-4">play</span>
              <span className="mx-4 opacity-40">•</span>
              <span className="mx-4">chat</span>
              <span className="mx-4 opacity-40">•</span>
              <span className="mx-4">hang out</span>
              <span className="mx-4 opacity-40">•</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <section className="py-36 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 block">Platforms</span>
              <h2 className="text-5xl font-bold leading-tight mb-6">Wherever you game, hang out here</h2>
              <p className="text-white/30 text-lg leading-relaxed font-light">
                On your PC, phone, or console, you can still hang out on Tavora. Easily switch between devices and use tools to manage multiple group chats with friends.
              </p>
            </div>
            <div className="flex justify-center gap-6">
              {[
                { icon: Icons.monitor, label: 'Desktop' },
                { icon: Icons.phone, label: 'Mobile' },
                { icon: Icons.console, label: 'Console' },
              ].map((device, i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center justify-center text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-all duration-300 hover:scale-110">
                    {device.icon}
                  </div>
                  <span className="text-[10px] text-white/20">{device.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="support" className="py-44 px-6 relative bg-[#060608] scroll-mt-28">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 block">Support</span>
          <h2 className="text-6xl font-extrabold leading-tight mb-8">
            <span className="bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Need a hand?
              <br />
              We’re here for the vibe
              <br />
              and the fixes.
            </span>
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/30">
            From onboarding help to account questions, our support flow is built to stay quick, clear, and friendly whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-500 transition-all duration-300 hover:scale-105 active:scale-95">
              {Icons.download}
              Get help now
            </a>
            <a href="#" className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/70 font-semibold text-lg hover:bg-white/[0.06] transition-all duration-300">
              {Icons.chat}
              Contact support
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#050508] border-t border-white/[0.04] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">{Icons.chat}</div>
                <span className="font-bold text-sm">Tavora</span>
              </Link>
              <div className="flex gap-3">
                {[Icons.star, Icons.star, Icons.star, Icons.star, Icons.star].map((icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 bg-white/[0.03] rounded-lg flex items-center justify-center text-white/20 hover:bg-white/[0.06] hover:text-white/50 transition-all">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes nav-bounce {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          45% { transform: translateY(5px) scale(0.99); opacity: 0.95; }
          70% { transform: translateY(-2px) scale(1.005); opacity: 1; }
          100% { transform: translateY(-10px) scale(0.97); opacity: 0.7; }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;