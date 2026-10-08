import { WorkItem, TimeLogEntry, AzureConfig, UserSettings, DayCompliance } from '../types';
import { INITIAL_CONFIG, INITIAL_SETTINGS, INITIAL_WORK_ITEMS, generateInitialTimeLogs } from '../data/mockData';

const STORAGE_KEYS = {
  CONFIG: 'azureops_config_v1',
  SETTINGS: 'azureops_settings_v1',
  WORK_ITEMS: 'azureops_work_items_v1',
  TIME_LOGS: 'azureops_time_logs_v1',
};

export class AzureDevOpsService {
  public static loadConfig(): AzureConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_CONFIG;
  }

  public static saveConfig(config: AzureConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  public static loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_SETTINGS;
  }

  public static saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public static loadWorkItems(): WorkItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORK_ITEMS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_WORK_ITEMS;
  }

  public static saveWorkItems(items: WorkItem[]): void {
    localStorage.setItem(STORAGE_KEYS.WORK_ITEMS, JSON.stringify(items));
  }

  public static loadTimeLogs(): TimeLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIME_LOGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const initial = generateInitialTimeLogs();
    AzureDevOpsService.saveTimeLogs(initial);
    return initial;
  }

  public static saveTimeLogs(logs: TimeLogEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
  }

  public static resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.WORK_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.TIME_LOGS);
  }

  /**
   * Test live connection to Azure DevOps REST API with Personal Access Token (PAT).
   */
  public static async testConnection(org: string, project: string, pat: string): Promise<{
    success: boolean;
    message: string;
    orgName?: string;
    projectName?: string;
    userProfile?: { name: string; email: string };
  }> {
    if (!org.trim() || !project.trim() || !pat.trim()) {
      return {
        success: false,
        message: 'Organization, Project name, and PAT are all required.',
      };
    }

    const cleanOrg = org.trim().replace(/^https:\/\/dev\.azure\.com\//, '').replace(/\/$/, '');
    const cleanProject = encodeURIComponent(project.trim());
    const authHeader = `Basic ${btoa(`:${pat.trim()}`)}`;

    try {
      // 1. First probe project endpoint
      const response = await fetch(`https://dev.azure.com/${cleanOrg}/_apis/projects/${cleanProject}?api-version=7.0`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `Successfully connected to project "${data.name}" in Azure DevOps organization "${cleanOrg}".`,
          orgName: cleanOrg,
          projectName: data.name,
          userProfile: {
            name: 'Azure DevOps User',
            email: `${cleanOrg}@dev.azure.com`,
          },
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed (401 Unauthorized). Please check your Personal Access Token (PAT) permissions (requires "Work Items: Read & Write" and "Project: Read").',
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: `Project "${project}" not found under organization "${cleanOrg}". Please verify the project spelling.`,
        };
      } else {
        return {
          success: false,
          message: `Azure DevOps API returned status ${response.status}: ${response.statusText}`,
        };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      // Notice: If running in browser without a server-side proxy, Azure DevOps may reject cross-origin requests
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('CORS')) {
        return {
          success: false,
          message: `Direct browser call blocked by Azure DevOps CORS security policy. The mobile Flutter companion app (iOS/Android) connects directly to Azure DevOps with no CORS restrictions. In this web simulator, you can configure your credentials and test using Enterprise Sync mode!`,
        };
      }
      return {
        success: false,
        message: `Connection error: ${errorMsg}`,
      };
    }
  }

  /**
   * Calculate date-wise compliance for a given date range
   */
  public static getDayComplianceList(
    startDate: Date,
    daysCount: number,
    timeLogs: TimeLogEntry[],
    settings: UserSettings
  ): DayCompliance[] {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: DayCompliance[] = [];

    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWorkingDay = settings.workingDays.includes(dayOfWeek);

      const dayLogs = timeLogs.filter((log) => log.date === dateStr);
      const recordedHours = dayLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);
      const targetHours = isWorkingDay ? settings.dailyTargetHours : 0;

      let status: DayCompliance['status'] = 'compliant';
      if (!isWorkingDay) {
        status = 'weekend';
      } else if (recordedHours === 0) {
        status = 'missing';
      } else if (recordedHours < targetHours) {
        status = 'partial';
      } else if (recordedHours > targetHours) {
        status = 'overtime';
      } else {
        status = 'compliant';
      }

      result.push({
        date: dateStr,
        dayName: dayNames[dayOfWeek],
        isWorkingDay,
        targetHours,
        recordedHours,
        status,
        entriesCount: dayLogs.length,
      });
    }

    return result;
  }

  /**
   * Get 7-day week compliance window (matching the prompt's Sun-Thu chart: Sun, Mon, Tue, Wed, Thu)
   */
  public static getWeekCompliance(
    anchorDate: Date,
    timeLogs: TimeLogEntry[],
    settings: UserSettings
  ): DayCompliance[] {
    // Determine start of current week (Sunday)
    const sunday = new Date(anchorDate);
    const day = sunday.getDay();
    sunday.setDate(sunday.getDate() - day);
    sunday.setHours(0, 0, 0, 0);

    return AzureDevOpsService.getDayComplianceList(sunday, 7, timeLogs, settings);
  }

  /**
   * Find all days in the current month or sprint with missing hours
   */
  public static findMissingDays(
    timeLogs: TimeLogEntry[],
    settings: UserSettings,
    daysBack: number = 14
  ): DayCompliance[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - daysBack);

    const allDays = AzureDevOpsService.getDayComplianceList(start, daysBack + 1, timeLogs, settings);
    // Filter to working days that are strictly before tomorrow and have recordedHours < targetHours
    const todayStr = today.toISOString().split('T')[0];

    return allDays.filter((d) => {
      return d.isWorkingDay && d.date <= todayStr && d.recordedHours < d.targetHours;
    });
  }
}
