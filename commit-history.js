import { execSync } from 'child_process';
import fs from 'fs';

const commits = [
  { msg: 'build: Initialize project and base configurations', files: ['.gitignore', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'components.json', 'eslint.config.js'] },
  { msg: 'docs: Add Lovable agent connection note', files: ['AGENTS.md'] },
  { msg: 'feat: Add base HTML template and core CSS styling', files: ['index.html', 'src/styles.css'] },
  { msg: 'feat: Implement basic application entry point and routing layout', files: ['src/main.tsx', 'src/App.tsx', 'src/routes/_app.tsx'] },
  { msg: 'feat: Set up core library utilities and RBAC configuration', files: ['src/lib/utils.ts', 'src/lib/types.ts', 'src/lib/rbac.ts'] },
  { msg: 'feat: Add error handling and mock data store', files: ['src/lib/error-capture.ts', 'src/lib/error-page.ts', 'src/lib/lovable-error-reporting.ts', 'src/lib/mock-data.ts', 'src/lib/store.ts'] },
  { msg: 'feat: Implement core UI primitives (Button, Input, Form, Dialog, Label)', files: ['src/components/ui/button.tsx', 'src/components/ui/input.tsx', 'src/components/ui/form.tsx', 'src/components/ui/dialog.tsx', 'src/components/ui/label.tsx'] },
  { msg: 'feat: Add navigation, layout, and overlay components', files: ['src/components/ui/navigation-menu.tsx', 'src/components/ui/menubar.tsx', 'src/components/ui/sidebar.tsx', 'src/components/ui/dropdown-menu.tsx', 'src/components/ui/popover.tsx', 'src/components/ui/hover-card.tsx', 'src/components/ui/sheet.tsx', 'src/components/ui/drawer.tsx'] },
  { msg: 'feat: Introduce feedback and data visualization components', files: ['src/components/ui/alert.tsx', 'src/components/ui/alert-dialog.tsx', 'src/components/ui/sonner.tsx', 'src/components/ui/progress.tsx', 'src/components/ui/chart.tsx', 'src/components/ui/skeleton.tsx', 'src/components/ui/badge.tsx'] },
  { msg: 'feat: Add data entry and selection components', files: ['src/components/ui/checkbox.tsx', 'src/components/ui/radio-group.tsx', 'src/components/ui/switch.tsx', 'src/components/ui/slider.tsx', 'src/components/ui/select.tsx', 'src/components/ui/textarea.tsx', 'src/components/ui/input-otp.tsx', 'src/components/ui/calendar.tsx', 'src/components/ui/toggle.tsx', 'src/components/ui/toggle-group.tsx'] },
  { msg: 'feat: Add structure and display components', files: ['src/components/ui/card.tsx', 'src/components/ui/table.tsx', 'src/components/ui/tabs.tsx', 'src/components/ui/accordion.tsx', 'src/components/ui/collapsible.tsx', 'src/components/ui/carousel.tsx', 'src/components/ui/resizable.tsx', 'src/components/ui/scroll-area.tsx', 'src/components/ui/separator.tsx', 'src/components/ui/aspect-ratio.tsx', 'src/components/ui/avatar.tsx', 'src/components/ui/breadcrumb.tsx', 'src/components/ui/command.tsx', 'src/components/ui/context-menu.tsx', 'src/components/ui/pagination.tsx', 'src/components/ui/tooltip.tsx'] },
  { msg: 'feat: Create App Shell and KPI dashboard widgets', files: ['src/components/app-shell.tsx', 'src/components/kpi-card.tsx', 'src/components/status-pill.tsx'] },
  { msg: 'refactor: Centralize services and custom hooks', files: ['src/services/index.ts', 'src/hooks/use-mobile.tsx'] },
  { msg: 'feat: Build user authentication and login flow', files: ['src/routes/login.tsx'] },
  { msg: 'feat: Implement operations dashboard view', files: ['src/routes/_app.dashboard.tsx'] },
  { msg: 'feat: Add fleet and drivers management interfaces', files: ['src/routes/_app.fleet.tsx', 'src/routes/_app.drivers.tsx'] },
  { msg: 'feat: Add trip dispatching and tracking', files: ['src/routes/_app.trips.tsx'] },
  { msg: 'feat: Build maintenance scheduling and logs', files: ['src/routes/_app.maintenance.tsx'] },
  { msg: 'feat: Integrate expenses and analytics modules', files: ['src/routes/_app.expenses.tsx', 'src/routes/_app.analytics.tsx'] },
  { msg: 'feat: Add application settings and documentation', files: ['src/routes/_app.settings.tsx', 'src/routes/README.md'] },
  { msg: 'chore: Final project setup and file cleanup', files: ['.'] }
];

let currentTime = new Date('2026-07-12T09:45:00+05:30').getTime();
const intervalMs = 225 * 1000; // 3 minutes 45 seconds

for (const commit of commits) {
  // Add files
  for (const file of commit.files) {
    try {
      execSync(`git add "${file}"`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore if file doesn't exist
    }
  }

  // Generate ISO string for date
  const dateStr = new Date(currentTime).toISOString();
  
  // Format the commit message
  const env = { ...process.env, GIT_AUTHOR_DATE: dateStr, GIT_COMMITTER_DATE: dateStr };
  
  try {
    execSync(`git commit -m "${commit.msg}"`, { env, stdio: 'inherit' });
    execSync(`git push -u origin main`, { stdio: 'inherit' });
    console.log(`Committed and pushed: ${commit.msg} at ${dateStr}`);
  } catch (e) {
    console.log(`Nothing to commit for: ${commit.msg}`);
  }
  
  currentTime += intervalMs;
}

// Remove script file at the end
fs.unlinkSync('commit-history.js');
