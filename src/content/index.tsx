import React from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetRoot } from './widget/WidgetRoot';
import widgetStyles from './widget/widget.css?inline';

function bootstrap() {
  // Create host element
  const host = document.createElement('div');
  host.id = 'linkedin-copilot-root';
  document.body.appendChild(host);

  // Attach shadow DOM for style isolation
  const shadow = host.attachShadow({ mode: 'open' });

  // Inject styles into shadow DOM
  const style = document.createElement('style');
  style.textContent = widgetStyles;
  shadow.appendChild(style);

  // Create React mount point inside shadow DOM
  const mountPoint = document.createElement('div');
  shadow.appendChild(mountPoint);

  // Mount React
  const root = createRoot(mountPoint);
  root.render(<WidgetRoot />);

  console.log('LinkedIn Copilot: widget mounted');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
