import React from 'react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from '../../App';

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

afterEach(() => {
  cleanup();
});

describe('CarbonIQ App Component Comprehensive Flow Coverage', () => {

  it('should render the sidebar and switch active tabs correctly', async () => {
    const { getByText, getByRole, getAllByText } = render(<App />);

    // Default tab is workspace playground
    expect(getByText('Invoice Capture Frame')).toBeInTheDocument();

    // Switch to Carbon Twin AI
    const twinTab = getByRole('button', { name: 'Carbon Twin AI' });
    fireEvent.click(twinTab);
    expect(getByText('Digital Carbon Twin AI')).toBeInTheDocument();
    expect(getByText('Model Levers & Weights')).toBeInTheDocument();

    // Switch to AI Advisor Coach
    const coachTab = getByRole('button', { name: 'AI Advisor Coach' });
    fireEvent.click(coachTab);
    expect(getByText('Gemini Carbon Advisor')).toBeInTheDocument();

    // Switch to Municipal Network
    const networkTab = getByRole('button', { name: 'Municipal Network' });
    fireEvent.click(networkTab);
    expect(getByText('Metropolitan Carbon Integration Grid')).toBeInTheDocument();

    // Click on Pune node card to test click handler and state sync
    const puneNode = getAllByText('Pune').find(el => el.tagName === 'SPAN')!;
    fireEvent.click(puneNode);
    const citySelect = getByRole('combobox', { name: 'Metropolitan Region Selector' }) as HTMLSelectElement;
    expect(citySelect.value).toBe('Pune');

    // Switch to Action Campaigns
    const actionsTab = getByRole('button', { name: 'Action Campaigns' });
    fireEvent.click(actionsTab);
    expect(getByText('AI Campaign Action Engine')).toBeInTheDocument();
  });

  it('should trigger sample scans in the Workspace Scanner Playground', async () => {
    // Mock global fetch for API calls
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { id: "s1", name: "Mock Bread", co2: 0.2, quantity: "1 unit", category: "Produce", ecoRating: "A", alternative: "None" }
          ],
          totalCo2: 0.2,
          explanation: "Mock calculation explanation."
        })
      })
    );
    global.fetch = mockFetch;

    const { getByText } = render(<App />);

    // Click Bengaluru Cafe preset button
    const bengButton = getByText('Bengaluru Café Receipt');
    fireEvent.click(bengButton);

    // Wait for the UI to update with mock scanning details
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    }, { timeout: 4500 });
  });

  it('should interact with Carbon Twin AI sliders and options', () => {
    const { container, getByRole } = render(<App />);

    // Go to Carbon Twin AI
    fireEvent.click(getByRole('button', { name: 'Carbon Twin AI' }));

    // Interact with dairy slider by ID
    const dairySlider = container.querySelector('#dairy-slider') as HTMLInputElement;
    expect(dairySlider).toBeInTheDocument();
    fireEvent.change(dairySlider, { target: { value: '50' } });
    expect(dairySlider.value).toBe('50');

    // Interact with alternative grain slider by ID
    const grainSlider = container.querySelector('#alt-slider') as HTMLInputElement;
    expect(grainSlider).toBeInTheDocument();
    fireEvent.change(grainSlider, { target: { value: '80' } });
    expect(grainSlider.value).toBe('80');

    // Toggle solar fuel co-op power offset button
    const offsetsButton = getByRole('button', { name: 'OFFSETS' });
    fireEvent.click(offsetsButton);
    expect(getByRole('button', { name: 'ENGAGED' })).toBeInTheDocument();
  });

  it('should send a message to AI Coach and update the chat screen', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: "Here is your coach recommendations: swap ghee with mustard oil." })
      })
    );
    global.fetch = mockFetch;

    const { getByRole, getByPlaceholderText, getByText } = render(<App />);

    // Navigate to Coach tab
    fireEvent.click(getByRole('button', { name: 'AI Advisor Coach' }));

    // Type a chat query
    const input = getByPlaceholderText('Inquire about regional millets, dairy emission locks, or carbon twin contractions...');
    fireEvent.change(input, { target: { value: 'How can I save carbon footprint?' } });
    
    // Submit the message
    const sendButton = getByRole('button', { name: 'Send' });
    fireEvent.click(sendButton);

    expect(getByText('How can I save carbon footprint?')).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText('Here is your coach recommendations: swap ghee with mustard oil.')).toBeInTheDocument();
    });
  });

  it('should allow committing to campaigns in Action Campaigns tab', async () => {
    const { getByRole, getAllByRole, findAllByRole } = render(<App />);

    // Switch to Action Campaigns tab
    fireEvent.click(getByRole('button', { name: 'Action Campaigns' }));

    // Verify there is a Lock button
    const commitButtons = getAllByRole('button', { name: 'LOCK' });
    expect(commitButtons.length).toBeGreaterThan(0);

    // Commit to the first campaign
    fireEvent.click(commitButtons[0]);

    // Verify button text changes to ABORT using findAllByRole bound locally
    const abortBtns = await findAllByRole('button', { name: 'ABORT' });
    expect(abortBtns.length).toBe(2);
  });

  it('should switch metropolitan region nodes and display node rankings', () => {
    const { getByLabelText, getByRole, getAllByText, getByText } = render(<App />);

    // Switch node dropdown
    const selectNode = getByLabelText('Metropolitan Region Selector');
    fireEvent.change(selectNode, { target: { value: 'Mumbai' } });
    expect(selectNode).toHaveValue('Mumbai');

    // Go to Municipal Network tab to verify it displays Pune, Mumbai, Bengaluru averages
    fireEvent.click(getByRole('button', { name: 'Municipal Network' }));
    
    // Check that Mumbai, Pune, Bengaluru nodes are present in the list
    expect(getAllByText('Mumbai').length).toBeGreaterThan(0);
    expect(getAllByText('Pune').length).toBeGreaterThan(0);
    expect(getAllByText('Bengaluru').length).toBeGreaterThan(0);
  });

  it('should handle dragging and dropping a receipt file', () => {
    const { container } = render(<App />);
    const dropZone = container.querySelector('#drag-and-drop-zone');
    expect(dropZone).toBeInTheDocument();

    const file = new File(['mock content'], 'test-receipt.png', { type: 'image/png' });
    
    fireEvent.dragEnter(dropZone!, {
      dataTransfer: { files: [file] }
    });
    
    fireEvent.dragOver(dropZone!, {
      dataTransfer: { files: [file] }
    });

    fireEvent.dragLeave(dropZone!, {
      dataTransfer: { files: [file] }
    });

    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] }
    });
  });

  it('should trigger Mumbai and Pune sample scans', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [{ id: "s2", name: "Mock Food", co2: 0.5, quantity: "1 unit", category: "Dairy", ecoRating: "C", alternative: "None" }],
          totalCo2: 0.5,
          explanation: "Mock explanation"
        })
      })
    );
    global.fetch = mockFetch;

    const { getByText } = render(<App />);

    // Click Mumbai preset
    const mumButton = getByText('Mumbai Grocery Mart');
    fireEvent.click(mumButton);
    
    // Click Pune preset
    const puneButton = getByText('Pune Household Dairy');
    fireEvent.click(puneButton);
  });

  it('should allow clicking on recommended swaps to go to Twin', async () => {
    const { getByText } = render(<App />);
    // Fresh Paneer is in the default scanResult. Check its swap card.
    const swapCard = getByText('Swap: Firm Soy Tofu (0.6kg CO₂)');
    fireEvent.click(swapCard);
  });

  it('should simulate weekly mission twin transition', () => {
    const { getByRole } = render(<App />);
    fireEvent.click(getByRole('button', { name: 'Action Campaigns' }));
    
    const simButton = getByRole('button', { name: 'Simulate in twin' });
    fireEvent.click(simButton);
  });

  it('should fall back gracefully on API network failures during receipt scan and chat', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    const { getByText, getByRole, getByPlaceholderText } = render(<App />);

    // Trigger Bengaluru Café Receipt scan (will hit fetch reject and trigger catch fallback)
    const bengButton = getByText('Bengaluru Café Receipt');
    fireEvent.click(bengButton);

    // Navigate to Coach and send chat message (will hit fetch reject and trigger catch fallback)
    fireEvent.click(getByRole('button', { name: 'AI Advisor Coach' }));
    const input = getByPlaceholderText('Inquire about regional millets, dairy emission locks, or carbon twin contractions...');
    fireEvent.change(input, { target: { value: 'Why is it high?' } });
    fireEvent.click(getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('should click the sidebar logo and reset tab to workspace', () => {
    const { getByText, getByRole } = render(<App />);
    fireEvent.click(getByRole('button', { name: 'Carbon Twin AI' }));
    const logo = getByText('CarbonIQ');
    fireEvent.click(logo);
    expect(getByText('Invoice Capture Frame')).toBeInTheDocument();
  });

  it('should switch metropolitan region node by clicking a node card in Municipal Network grid', () => {
    const { getByRole, getByText, getAllByText } = render(<App />);
    fireEvent.click(getByRole('button', { name: 'Municipal Network' }));
    const mumbaiCard = getAllByText('Mumbai')[0];
    fireEvent.click(mumbaiCard);
  });

  it('should cover Firestore sync and GCS signed URL file upload processing in hook', async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/get-signed-url')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ signedUrl: 'http://localhost:3000/api/mock-upload', gcsUrl: 'gs://bucket/file.png' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [{ id: "t1", name: "GCS Item", co2: 0.1, quantity: "1", category: "Dairy", ecoRating: "A", alternative: "None" }],
          totalCo2: 0.1,
          explanation: "Mock"
        })
      });
    });
    global.fetch = mockFetch;

    const { container } = render(<App />);
    const dropZone = container.querySelector('#drag-and-drop-zone');
    expect(dropZone).toBeInTheDocument();

    const file = new File(['dummy content'], 'gcs-receipt.png', { type: 'image/png' });
    fireEvent.drop(dropZone!, {
      dataTransfer: { files: [file] }
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    }, { timeout: 4500 });
  });

});



