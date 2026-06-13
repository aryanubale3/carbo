import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';

// Mock scrollTo and other browser APIs not supported in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  
  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver
  });
});

describe('CarbonIQ Frontend Component & Accessibility (WCAG)', () => {

  it('should mount the application structure successfully and display the primary header link', () => {
    render(<App />);
    const appLogo = screen.getAllByText('CarbonIQ');
    expect(appLogo.length).toBeGreaterThan(0);
  });

  describe('Keyboard Navigation Accessibility', () => {
    it('should allow focusing on the drag-and-drop landing file frame using tab orders', () => {
      render(<App />);
      const dropZone = screen.getByLabelText('Upload capture receipt file frame');
      expect(dropZone).toBeInTheDocument();
      expect(dropZone.tabIndex).toBe(0);
    });

    it('should fire the file explorer overlay when Enter is key-pressed on the drag-and-drop area', () => {
      render(<App />);
      const dropZone = screen.getByLabelText('Upload capture receipt file frame');
      
      const clickMock = vi.fn();
      const inputEl = document.getElementById('receipt-file');
      if (inputEl) {
        inputEl.click = clickMock;
      }

      fireEvent.keyDown(dropZone, { key: 'Enter', code: 'Enter' });
      expect(clickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('ARIA Annotations and Contrast Elements', () => {
    it('should render the Metropolitan Region Selector dropdown with correct ARIA label indicators', () => {
      render(<App />);
      const selects = screen.getAllByLabelText('Metropolitan Region Selector');
      expect(selects.length).toBeGreaterThan(0);
      expect(selects[0].tagName).toBe('SELECT');
    });

    it('should render the Mobile Navigation select dropdown with correct ARIA label', () => {
      render(<App />);
      const mobileNav = screen.getByLabelText('Mobile Navigation Selector');
      expect(mobileNav).toBeInTheDocument();
      expect(mobileNav.tagName).toBe('SELECT');
    });

    it('should support toggle shifts in regional SMART grid node metrics without breaking focus', () => {
      render(<App />);
      const select = screen.getAllByLabelText('Metropolitan Region Selector')[0] as HTMLSelectElement;
      
      fireEvent.change(select, { target: { value: 'Mumbai' } });
      expect(select.value).toBe('Mumbai');
    });
  });

  describe('Heading Hierarchy & Screen Reader Structure', () => {
    it('should exhibit structured heading order with the main workspace scanning title', () => {
      render(<App />);
      const scanHeading = screen.getByRole('heading', { name: 'Invoice Capture Frame' });
      expect(scanHeading).toBeInTheDocument();
    });

    it('should transition visible panels elegantly when switching workspace tabs', async () => {
      render(<App />);
      
      // Click on Digital Twin navigation segment
      const twinTabButton = screen.getByRole('button', { name: 'Carbon Twin AI' });
      expect(twinTabButton).toBeInTheDocument();
      
      fireEvent.click(twinTabButton);
      
      // In Twin hub view, sliders and simulation metrics should be visible
      await waitFor(() => {
        const twinHeading = screen.getByRole('heading', { name: 'Digital Carbon Twin AI' });
        expect(twinHeading).toBeInTheDocument();
      });
    });
  });

});
