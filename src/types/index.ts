export type WorkItemType = 'Task' | 'Bug' | 'User Story' | 'Feature';
export type WorkItemState = 'To Do' | 'Doing' | 'Done' | 'Blocked';
export type ActivityType = 
  | 'Development' 
  | 'Code Review' 
  | 'Bugfixing' 
  | 'Standup & Planning' 
  | 'Testing' 
  | 'Documentation';

export interface AzureAssignee {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface WorkItem {
  id: number;
  title: string;
  type: WorkItemType;
  state: WorkItemState;
  assignedTo: AzureAssignee;
  iteration: string;
  areaPath: string;
  originalEstimate: number; // in hours
  completedWork: number;    // in hours (cumulative effort in Azure)
  remainingWork: number;    // in hours
  priority: 1 | 2 | 3 | 4;
  tags: string[];
  description: string;
  createdDate: string;
  changedDate: string;
}

export interface TimeLogEntry {
  id: string;
  workItemId: number;
  workItemTitle: string;
  workItemType: WorkItemType;
  date: string; // YYYY-MM-DD
  hours: number;
  activity: ActivityType;
  comment: string;
  syncedToAzure: boolean;
  timestamp: string;
}

export interface AzureConfig {
  org: string;
  project: string;
  pat: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  connected: boolean;
  lastSyncTime?: string;
  demoMode: boolean;
}

export interface UserSettings {
  dailyTargetHours: number; // e.g. 8.0
  workingDays: number[];     // e.g. [1, 2, 3, 4, 5] (1=Mon, 5=Fri) or [0, 1, 2, 3, 4] (Sun-Thu)
  notificationsEnabled: boolean;
  reminderTime: string;      // "17:00"
  underloggingAlert: boolean;
  theme: 'dark' | 'azure';
  deviceFrame: boolean;
}

export type NavTab = 'home' | 'tasks' | 'log' | 'analytics' | 'settings';
export type AnalyticsTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface DayCompliance {
  date: string; // YYYY-MM-DD
  dayName: string;
  isWorkingDay: boolean;
  targetHours: number;
  recordedHours: number;
  status: 'compliant' | 'missing' | 'partial' | 'overtime' | 'weekend';
  entriesCount: number;
}

export interface SprintCapacity {
  teamName: string;
  sprintName: string;
  startDate: string;
  endDate: string;
  totalTeamCapacityHours: number;
  personalCapacityHours: number;
  personalDailyCapacity: number;
  loggedHoursInSprint: number;
}
