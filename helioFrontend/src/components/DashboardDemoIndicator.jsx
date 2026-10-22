import { dashboardDemoEnabled } from '../api/dashboardRequest';

export default function DashboardDemoIndicator() {
  return dashboardDemoEnabled ? (
    <span role="status" className="fixed bottom-3 right-3 z-[100] rounded-full bg-[#17213F] px-3 py-1 text-[10px] font-medium text-white">
      Demo Data
    </span>
  ) : null;
}
