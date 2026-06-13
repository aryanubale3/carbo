import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Framer Motion to render simple elements instantly in jsdom
vi.mock('motion/react', () => {
  const dummyComponent = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'> & {
      animate?: unknown;
      initial?: unknown;
      exit?: unknown;
      transition?: unknown;
      variants?: unknown;
    }
  >(({ children, ...props }, ref) => {
    // strip out framer-motion specific props to avoid HTML validation warnings
    const { animate, initial, exit, transition, variants, ...cleanProps } = props;
    return React.createElement('div', { ref, ...cleanProps }, children);
  });
  return {
    motion: {
      div: dummyComponent,
      button: dummyComponent,
      span: dummyComponent,
      nav: dummyComponent,
      header: dummyComponent,
      footer: dummyComponent,
      section: dummyComponent,
      article: dummyComponent,
      aside: dummyComponent,
      a: dummyComponent,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Add any test-specific global mocks here if needed (e.g., fetch, window APIs)
vi.mock("../hooks/useAuth.tsx", () => {
  return {
    useAuth: () => ({
      user: { uid: "test-user-123", email: "test@example.com" },
      loading: false,
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      logOut: vi.fn().mockResolvedValue(undefined),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
    ProtectedRoute: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock("../services/firebase", () => {
  return {
    auth: {},
    googleProvider: {},
    db: {},
    storage: {},
  };
});

vi.mock("firebase/firestore", () => {
  return {
    doc: vi.fn(),
    setDoc: vi.fn().mockResolvedValue({}),
    getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
    getDocs: vi.fn().mockResolvedValue({ forEach: () => {} }),
    collection: vi.fn(),
  };
});

beforeAll(() => {
  // Global initializer
});

afterEach(() => {
  // Clear any persistent mocks or state
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => {
  // Cleanup
});
