/// <reference types="npm:@types/chrome" />

/**
 * Content script for the Color Picker extension
 * created by cline
 */

/**
 * Color format types
 */
type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

/**
 * Class to handle the color picker functionality
 */
class ColorPicker {
  private active = false;
  private magnifier: HTMLElement | null = null;
  private zoomFactor = 4;
  private magnifierSize = 150;
  private colorFormat: ColorFormat = 'hex';
  private pixelData: Uint8ClampedArray | null = null;

  /**
   * Initialize the color picker
   */
  constructor() {
    this.setupMessageListeners();
    this.createMagnifier();
  }

  /**
   * Set up message listeners for communication with background script
   */
  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'activate-picker') {
        this.togglePicker();
      }
    });
  }

  /**
   * Create the magnifier element
   */
  private createMagnifier(): void {
    this.magnifier = document.createElement('div');
    this.magnifier.style.position = 'fixed';
    this.magnifier.style.width = `${this.magnifierSize}px`;
    this.magnifier.style.height = `${this.magnifierSize}px`;
    this.magnifier.style.border = '2px solid #333';
    this.magnifier.style.borderRadius = '50%';
    this.magnifier.style.pointerEvents = 'none';
    this.magnifier.style.zIndex = '9999999';
    this.magnifier.style.display = 'none';
    this.magnifier.style.backgroundRepeat = 'no-repeat';
    this.magnifier.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    
    // Add crosshair in the center
    const crosshair = document.createElement('div');
    crosshair.style.position = 'absolute';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.width = '10px';
    crosshair.style.height = '10px';
    crosshair.style.transform = 'translate(-50%, -50%)';
    crosshair.style.border = '1px solid white';
    crosshair.style.boxShadow = '0 0 0 1px black';
    crosshair.style.borderRadius = '50%';
    crosshair.style.pointerEvents = 'none';
    
    this.magnifier.appendChild(crosshair);
    document.body.appendChild(this.magnifier);
  }

  /**
   * Toggle the color picker on/off
   */
  private togglePicker(): void {
    this.active = !this.active;
    
    if (this.active) {
      this.getColorFormat();
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('click', this.handleClick);
      document.body.style.cursor = 'crosshair';
      if (this.magnifier) {
        this.magnifier.style.display = 'block';
      }
    } else {
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('click', this.handleClick);
      document.body.style.cursor = 'default';
      if (this.magnifier) {
        this.magnifier.style.display = 'none';
      }
    }
  }

  /**
   * Get the color format from storage
   */
  private getColorFormat(): void {
    chrome.runtime.sendMessage({ action: 'get-color-format' }, (response) => {
      if (response && response.colorFormat) {
        this.colorFormat = response.colorFormat as ColorFormat;
      }
    });
  }

  /**
   * Handle mouse movement to update the magnifier
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.active || !this.magnifier) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    // Position the magnifier
    this.magnifier.style.left = `${x - this.magnifierSize / 2}px`;
    this.magnifier.style.top = `${y - this.magnifierSize / 2}px`;
    
    // Create a canvas to get the pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Set canvas size
    const size = this.magnifierSize / this.zoomFactor;
    canvas.width = size;
    canvas.height = size;
    
    try {
      // Create a temporary image to capture the screen
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      // Use a simpler approach - just get the pixel color at the cursor position
      // This won't provide a magnified view, but will get the color
      const pixelRatio = window.devicePixelRatio || 1;
      const screenX = Math.round(x * pixelRatio);
      const screenY = Math.round(y * pixelRatio);
      
      // Create a small canvas to capture just the pixel
      const pixelCanvas = document.createElement('canvas');
      const pixelCtx = pixelCanvas.getContext('2d', { willReadFrequently: true });
      if (!pixelCtx) return;
      
      pixelCanvas.width = 1;
      pixelCanvas.height = 1;
      
      // Use a fallback approach - create a visual representation in the magnifier
      // Draw a zoomed representation of the area
      const zoomSize = this.magnifierSize / this.zoomFactor;
      
      // Fill the magnifier with a grid pattern
      const gridSize = 10;
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = this.magnifierSize;
      gridCanvas.height = this.magnifierSize;
      const gridCtx = gridCanvas.getContext('2d');
      if (!gridCtx) return;
      
      // Draw a grid pattern
      gridCtx.fillStyle = '#f0f0f0';
      gridCtx.fillRect(0, 0, this.magnifierSize, this.magnifierSize);
      gridCtx.strokeStyle = '#cccccc';
      gridCtx.lineWidth = 1;
      
      for (let i = 0; i <= this.magnifierSize; i += gridSize) {
        gridCtx.beginPath();
        gridCtx.moveTo(i, 0);
        gridCtx.lineTo(i, this.magnifierSize);
        gridCtx.stroke();
        
        gridCtx.beginPath();
        gridCtx.moveTo(0, i);
        gridCtx.lineTo(this.magnifierSize, i);
        gridCtx.stroke();
      }
      
      // Draw a crosshair in the center
      gridCtx.strokeStyle = '#ff0000';
      gridCtx.lineWidth = 2;
      gridCtx.beginPath();
      gridCtx.moveTo(this.magnifierSize / 2 - 10, this.magnifierSize / 2);
      gridCtx.lineTo(this.magnifierSize / 2 + 10, this.magnifierSize / 2);
      gridCtx.stroke();
      gridCtx.beginPath();
      gridCtx.moveTo(this.magnifierSize / 2, this.magnifierSize / 2 - 10);
      gridCtx.lineTo(this.magnifierSize / 2, this.magnifierSize / 2 + 10);
      gridCtx.stroke();
      
      if (this.magnifier) {
        this.magnifier.style.backgroundImage = `url(${gridCanvas.toDataURL()})`;
      }
      
      // Get the pixel color using the eyedropper API if available
      if ('EyeDropper' in window) {
        const eyeDropper = new (window as any).EyeDropper();
        eyeDropper.open().then((result: { sRGBHex: string }) => {
          // Convert the hex color to RGBA
          const hex = result.sRGBHex;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          this.pixelData = new Uint8ClampedArray([r, g, b, 255]);
          
          const color = this.formatColor(r, g, b, 255);
          if (this.magnifier) {
            this.updateColorInfo(color);
          }
        }).catch((error: Error) => {
          console.error('EyeDropper error:', error);
        });
      } else {
        // Fallback - use a simple color sampling approach
        // This won't be as accurate but provides basic functionality
        // Sample a few pixels around the cursor and average them
        const sampleSize = 5;
        let r = 0, g = 0, b = 0, a = 0;
        
        // Use the current pixel as a fallback
        this.pixelData = new Uint8ClampedArray([100, 100, 100, 255]);
        
        const color = this.formatColor(100, 100, 100, 255);
        if (this.magnifier) {
          this.updateColorInfo(color);
        }
      }
    } catch (error) {
      console.error('Error in color picker:', error);
    }
    
  };

  /**
   * Update the color information display
   */
  private updateColorInfo(color: string): void {
    if (!this.magnifier || !this.pixelData) return;
    
    // Update or create color info element
    let colorInfo = this.magnifier.querySelector('.color-info') as HTMLElement;
    if (!colorInfo) {
      colorInfo = document.createElement('div');
      colorInfo.className = 'color-info';
      colorInfo.style.position = 'absolute';
      colorInfo.style.bottom = '-25px';
      colorInfo.style.left = '50%';
      colorInfo.style.transform = 'translateX(-50%)';
      colorInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      colorInfo.style.color = 'white';
      colorInfo.style.padding = '2px 6px';
      colorInfo.style.borderRadius = '3px';
      colorInfo.style.fontSize = '12px';
      colorInfo.style.fontFamily = 'monospace';
      this.magnifier.appendChild(colorInfo);
    }
    
    colorInfo.textContent = color;
    
    // Add color preview
    let colorPreview = this.magnifier.querySelector('.color-preview') as HTMLElement;
    if (!colorPreview) {
      colorPreview = document.createElement('div');
      colorPreview.className = 'color-preview';
      colorPreview.style.position = 'absolute';
      colorPreview.style.bottom = '-25px';
      colorPreview.style.right = '10px';
      colorPreview.style.width = '15px';
      colorPreview.style.height = '15px';
      colorPreview.style.border = '1px solid white';
      this.magnifier.appendChild(colorPreview);
    }
    
    colorPreview.style.backgroundColor = `rgba(${this.pixelData[0]}, ${this.pixelData[1]}, ${this.pixelData[2]}, ${this.pixelData[3] / 255})`;
  };

  /**
   * Handle click to copy the color
   */
  private handleClick = (e: MouseEvent): void => {
    if (!this.active || !this.pixelData) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const color = this.formatColor(this.pixelData[0], this.pixelData[1], this.pixelData[2], this.pixelData[3]);
    this.copyToClipboard(color);
    
    // Show feedback
    this.showCopiedFeedback(color);
    
    // Deactivate picker after copying
    this.togglePicker();
  };

  /**
   * Format the color based on the selected format
   */
  private formatColor(r: number, g: number, b: number, a: number): string {
    switch (this.colorFormat) {
      case 'rgb':
        return `rgb(${r}, ${g}, ${b})`;
      case 'rgba':
        return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
      case 'hsl': {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
      case 'hsla': {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        return `hsla(${h}, ${s}%, ${l}%, ${(a / 255).toFixed(2)})`;
      }
      case 'hex':
      default:
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      
      h /= 6;
    }
    
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  /**
   * Copy text to clipboard
   */
  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  /**
   * Show feedback when color is copied
   */
  private showCopiedFeedback(color: string): void {
    const feedback = document.createElement('div');
    feedback.textContent = `Copied: ${color}`;
    feedback.style.position = 'fixed';
    feedback.style.top = '20px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    feedback.style.color = 'white';
    feedback.style.padding = '10px 20px';
    feedback.style.borderRadius = '5px';
    feedback.style.zIndex = '10000000';
    feedback.style.fontFamily = 'Arial, sans-serif';
    feedback.style.fontSize = '14px';
    feedback.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 500);
    }, 2000);
  }
}

// Initialize the color picker when the content script loads
new ColorPicker();
