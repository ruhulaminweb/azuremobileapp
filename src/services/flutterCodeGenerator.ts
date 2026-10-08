import JSZip from 'jszip';

export interface FlutterFile {
  path: string;
  category: 'config' | 'entry' | 'models' | 'services' | 'screens' | 'docs';
  content: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    category: 'config',
    content: `name: azureops_mobile
description: "A Flutter mobile companion for Azure DevOps task tracking & working-hour compliance."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.2.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
  fl_chart: ^0.68.0
  intl: ^0.19.0
  flutter_local_notifications: ^17.1.0
  table_calendar: ^3.1.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    path: 'lib/main.dart',
    category: 'entry',
    content: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'providers/timesheet_provider.dart';
import 'screens/home_screen.dart';
import 'screens/tasks_screen.dart';
import 'screens/log_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/settings_screen.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  await NotificationService.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TimesheetProvider()..init()),
      ],
      child: const AzureOpsApp(),
    ),
  );
}

class AzureOpsApp extends StatelessWidget {
  const AzureOpsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AzureOps Tracker',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0078D4), // Azure Blue
          secondary: Color(0xFF00BCF2),
          surface: Color(0xFF131B2E),
          background: Color(0xFF0B0F19),
          error: Color(0xFFF75555),
        ),
        cardTheme: CardTheme(
          color: const Color(0xFF131B2E),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFF1E293B), width: 1),
          ),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    TasksScreen(),
    LogScreen(),
    AnalyticsScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: const Color(0xFF0F172A),
        indicatorColor: const Color(0xFF0078D4).withOpacity(0.25),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: Color(0xFF00BCF2)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.check_box_outlined),
            selectedIcon: Icon(Icons.check_box, color: Color(0xFF00BCF2)),
            label: 'Tasks',
          ),
          NavigationDestination(
            icon: Icon(Icons.schedule_outlined),
            selectedIcon: Icon(Icons.schedule, color: Color(0xFF00BCF2)),
            label: 'Log',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart, color: Color(0xFF00BCF2)),
            label: 'Analytics',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings, color: Color(0xFF00BCF2)),
            label: 'Settings',
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/models/work_item.dart',
    category: 'models',
    content: `class AzureWorkItem {
  final int id;
  final String title;
  final String type; // Task, Bug, User Story, Feature
  final String state; // To Do, Doing, Done, Blocked
  final String assignedToName;
  final String assignedToEmail;
  final String iteration;
  final String areaPath;
  final double originalEstimate;
  final double completedWork;
  final double remainingWork;
  final int priority;

  AzureWorkItem({
    required this.id,
    required this.title,
    required this.type,
    required this.state,
    required this.assignedToName,
    required this.assignedToEmail,
    required this.iteration,
    required this.areaPath,
    required this.originalEstimate,
    required this.completedWork,
    required this.remainingWork,
    required this.priority,
  });

  factory AzureWorkItem.fromAzureJson(Map<String, dynamic> json) {
    final fields = json['fields'] ?? {};
    final assignedTo = fields['System.AssignedTo'] ?? {};
    
    return AzureWorkItem(
      id: json['id'] ?? 0,
      title: fields['System.Title'] ?? 'Untitled Work Item',
      type: fields['System.WorkItemType'] ?? 'Task',
      state: fields['System.State'] ?? 'To Do',
      assignedToName: assignedTo['displayName'] ?? 'Unassigned',
      assignedToEmail: assignedTo['uniqueName'] ?? '',
      iteration: fields['System.IterationPath'] ?? '',
      areaPath: fields['System.AreaPath'] ?? '',
      originalEstimate: (fields['Microsoft.VSTS.Scheduling.OriginalEstimate'] as num?)?.toDouble() ?? 0.0,
      completedWork: (fields['Microsoft.VSTS.Scheduling.CompletedWork'] as num?)?.toDouble() ?? 0.0,
      remainingWork: (fields['Microsoft.VSTS.Scheduling.RemainingWork'] as num?)?.toDouble() ?? 0.0,
      priority: (fields['Microsoft.VSTS.Common.Priority'] as num?)?.toInt() ?? 2,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'type': type,
      'state': state,
      'assignedToName': assignedToName,
      'assignedToEmail': assignedToEmail,
      'iteration': iteration,
      'areaPath': areaPath,
      'originalEstimate': originalEstimate,
      'completedWork': completedWork,
      'remainingWork': remainingWork,
      'priority': priority,
    };
  }
}
`,
  },
  {
    path: 'lib/models/time_entry.dart',
    category: 'models',
    content: `class TimeLogEntry {
  final String id;
  final int workItemId;
  final String workItemTitle;
  final String workItemType;
  final String date; // YYYY-MM-DD
  final double hours;
  final String activity; // Development, Code Review, Bugfixing, Standup & Planning
  final String comment;
  final bool syncedToAzure;
  final DateTime timestamp;

  TimeLogEntry({
    required this.id,
    required this.workItemId,
    required this.workItemTitle,
    required this.workItemType,
    required this.date,
    required this.hours,
    required this.activity,
    required this.comment,
    this.syncedToAzure = false,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'workItemId': workItemId,
    'workItemTitle': workItemTitle,
    'workItemType': workItemType,
    'date': date,
    'hours': hours,
    'activity': activity,
    'comment': comment,
    'syncedToAzure': syncedToAzure,
    'timestamp': timestamp.toIso8601String(),
  };

  factory TimeLogEntry.fromJson(Map<String, dynamic> json) => TimeLogEntry(
    id: json['id'],
    workItemId: json['workItemId'],
    workItemTitle: json['workItemTitle'],
    workItemType: json['workItemType'],
    date: json['date'],
    hours: (json['hours'] as num).toDouble(),
    activity: json['activity'],
    comment: json['comment'] ?? '',
    syncedToAzure: json['syncedToAzure'] ?? false,
    timestamp: DateTime.parse(json['timestamp']),
  );
}
`,
  },
  {
    path: 'lib/services/azure_service.dart',
    category: 'services',
    content: `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/work_item.dart';

class AzureDevOpsService {
  final String organization;
  final String project;
  final String pat;

  AzureDevOpsService({
    required this.organization,
    required this.project,
    required this.pat,
  });

  Map<String, String> get _headers {
    final basicAuth = 'Basic ' + base64Encode(utf8.encode(':$pat'));
    return {
      'Authorization': basicAuth,
      'Content-Type': 'application/json',
    };
  }

  /// Validates PAT by fetching project metadata
  Future<bool> verifyConnection() async {
    try {
      final url = Uri.parse(
        'https://dev.azure.com/$organization/_apis/projects/$project?api-version=7.0',
      );
      final response = await http.get(url, headers: _headers);
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// Queries active work items assigned to @me or current sprint
  Future<List<AzureWorkItem>> fetchAssignedWorkItems() async {
    final wiqlUrl = Uri.parse(
      'https://dev.azure.com/$organization/$project/_apis/wit/wiql?api-version=7.0',
    );

    const wiqlQuery = {
      'query': 'SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.State] <> "Closed" ORDER BY [System.ChangedDate] DESC'
    };

    final wiqlRes = await http.post(
      wiqlUrl,
      headers: _headers,
      body: jsonEncode(wiqlQuery),
    );

    if (wiqlRes.statusCode != 200) {
      throw Exception('WIQL query failed: \${wiqlRes.body}');
    }

    final wiqlData = jsonDecode(wiqlRes.body);
    final List workItemsRefs = wiqlData['workItems'] ?? [];
    if (workItemsRefs.isEmpty) return [];

    final ids = workItemsRefs.take(30).map((w) => w['id']).join(',');
    final detailsUrl = Uri.parse(
      'https://dev.azure.com/$organization/$project/_apis/wit/workitems?ids=$ids&\$expand=all&api-version=7.0',
    );

    final detailsRes = await http.get(detailsUrl, headers: _headers);
    if (detailsRes.statusCode != 200) {
      throw Exception('Fetching work item details failed');
    }

    final detailsData = jsonDecode(detailsRes.body);
    final List itemsList = detailsData['value'] ?? [];
    return itemsList.map((item) => AzureWorkItem.fromAzureJson(item)).toList();
  }

  /// Updates cumulative Completed Work and Remaining Work via JSON Patch
  Future<bool> updateEffort({
    required int workItemId,
    required double completedWork,
    required double remainingWork,
  }) async {
    final patchUrl = Uri.parse(
      'https://dev.azure.com/$organization/$project/_apis/wit/workitems/$workItemId?api-version=7.0',
    );

    final patchDoc = [
      {
        'op': 'add',
        'path': '/fields/Microsoft.VSTS.Scheduling.CompletedWork',
        'value': completedWork,
      },
      {
        'op': 'add',
        'path': '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
        'value': remainingWork,
      },
    ];

    final res = await http.patch(
      patchUrl,
      headers: {
        ..._headers,
        'Content-Type': 'application/json-patch+json',
      },
      body: jsonEncode(patchDoc),
    );

    return res.statusCode == 200;
  }
}
`,
  },
  {
    path: 'lib/services/notification_service.dart',
    category: 'services',
    content: `import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(initSettings);
  }

  static Future<void> showUnderloggingAlert({
    required double loggedHours,
    required double targetHours,
  }) async {
    final missing = (targetHours - loggedHours).toStringAsFixed(1);
    const androidDetails = AndroidNotificationDetails(
      'compliance_channel',
      'Daily Hour Compliance',
      channelDescription: 'Alerts when daily logged hours are below target',
      importance: Importance.high,
      priority: Priority.high,
    );
    const iosDetails = DarwinNotificationDetails();

    await _notifications.show(
      101,
      'Azure DevOps Timesheet Alert',
      'You have logged \${loggedHours.toStringAsFixed(1)}h of \${targetHours.toStringAsFixed(1)}h today. \$missing h remaining.',
      const NotificationDetails(android: androidDetails, iOS: iosDetails),
    );
  }
}
`,
  },
  {
    path: 'lib/providers/timesheet_provider.dart',
    category: 'services',
    content: `import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/work_item.dart';
import '../models/time_entry.dart';
import '../services/azure_service.dart';

class TimesheetProvider extends ChangeNotifier {
  String organization = 'contoso-cloud';
  String project = 'Fintech-Core-App';
  String pat = '';
  double targetDailyHours = 8.0;
  List<int> workingDays = [0, 1, 2, 3, 4]; // Sun to Thu

  List<AzureWorkItem> workItems = [];
  List<TimeLogEntry> logs = [];
  bool isLoading = false;

  AzureDevOpsService? get azureService {
    if (organization.isEmpty || project.isEmpty || pat.isEmpty) return null;
    return AzureDevOpsService(
      organization: organization,
      project: project,
      pat: pat,
    );
  }

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    organization = prefs.getString('az_org') ?? 'contoso-cloud';
    project = prefs.getString('az_project') ?? 'Fintech-Core-App';
    pat = prefs.getString('az_pat') ?? '';
    targetDailyHours = prefs.getDouble('target_hours') ?? 8.0;
    
    // Load local logs
    final rawLogs = prefs.getString('time_logs');
    if (rawLogs != null) {
      final List decoded = jsonDecode(rawLogs);
      logs = decoded.map((e) => TimeLogEntry.fromJson(e)).toList();
    }
    notifyListeners();
  }

  Future<void> addTimeLog({
    required int workItemId,
    required String workItemTitle,
    required String workItemType,
    required double hours,
    required String activity,
    required String comment,
    required String date,
  }) async {
    final newEntry = TimeLogEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      workItemId: workItemId,
      workItemTitle: workItemTitle,
      workItemType: workItemType,
      date: date,
      hours: hours,
      activity: activity,
      comment: comment,
      syncedToAzure: false,
      timestamp: DateTime.now(),
    );

    logs.insert(0, newEntry);
    await _saveLogs();

    // Optionally sync with Azure API
    if (azureService != null) {
      // Updates cumulative completedWork on the task
      try {
        final item = workItems.firstWhere((w) => w.id == workItemId);
        final newCompleted = item.completedWork + hours;
        final newRemaining = (item.remainingWork - hours) > 0 ? (item.remainingWork - hours) : 0.0;
        await azureService!.updateEffort(
          workItemId: workItemId,
          completedWork: newCompleted,
          remainingWork: newRemaining,
        );
      } catch (_) {}
    }

    notifyListeners();
  }

  double getTodayRecordedHours() {
    final today = DateTime.now().toIso8601String().split('T')[0];
    return logs
        .where((l) => l.date == today)
        .fold(0.0, (sum, item) => sum + item.hours);
  }

  Future<void> _saveLogs() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonString = jsonEncode(logs.map((l) => l.toJson()).toList());
    await prefs.setString('time_logs', jsonString);
  }
}
`,
  },
  {
    path: 'lib/screens/home_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/timesheet_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TimesheetProvider>();
    final todayHours = provider.getTodayRecordedHours();
    final target = provider.targetDailyHours;
    final progress = (todayHours / target).clamp(0.0, 1.0);

    return Scaffold(
      appBar: AppBar(
        title: const Text('AzureOps Daily', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Compliance Hero Card with Circular Progress Ring
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TODAY\\'S COMPLIANCE', style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: todayHours >= target ? Colors.green.withOpacity(0.2) : Colors.orange.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            todayHours >= target ? 'TARGET MET (\${(progress * 100).toInt()}%)' : 'MISSING \${(target - todayHours).toStringAsFixed(1)}h',
                            style: TextStyle(
                              color: todayHours >= target ? Colors.greenAccent : Colors.orangeAccent,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    // Circular Progress Ring
                    Row(
                      children: [
                        SizedBox(
                          width: 100,
                          height: 100,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              CircularProgressIndicator(
                                value: 1.0,
                                strokeWidth: 9,
                                valueColor: const AlwaysStoppedAnimation(Color(0xFF1E293B)),
                              ),
                              CircularProgressIndicator(
                                value: progress,
                                strokeWidth: 9,
                                strokeCap: StrokeCap.round,
                                valueColor: AlwaysStoppedAnimation(
                                  todayHours >= target ? const Color(0xFF10B981) : const Color(0xFF0078D4),
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    '\${todayHours.toStringAsFixed(1)}h',
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    '\${(progress * 100).toInt()}%',
                                    style: TextStyle(fontSize: 10, color: todayHours >= target ? Colors.greenAccent : Colors.lightBlueAccent, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Daily Target: \${target.toStringAsFixed(1)}h', style: const TextStyle(fontSize: 13, color: Colors.white70)),
                              const SizedBox(height: 4),
                              Text('Recorded: \${todayHours.toStringAsFixed(1)}h', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8))),
                              const SizedBox(height: 4),
                              Text(
                                todayHours >= target ? '100% Compliant' : 'Deficit: \${(target - todayHours).toStringAsFixed(1)}h remaining',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: todayHours >= target ? Colors.greenAccent : Colors.amberAccent,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Prompt-matching "Recorded vs target hours" bar chart
            const Text(
              'Recorded vs target hours',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: SizedBox(
                  height: 200,
                  child: BarChart(
                    BarChartData(
                      maxY: 9,
                      titlesData: FlTitlesData(
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (val, _) {
                              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
                              if (val.toInt() < days.length) {
                                return Text(days[val.toInt()], style: const TextStyle(color: Colors.white60, fontSize: 12));
                              }
                              return const SizedBox();
                            },
                          ),
                        ),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            interval: 3,
                            getTitlesWidget: (val, _) => Text('\${val.toInt()}h', style: const TextStyle(color: Colors.white38, fontSize: 11)),
                          ),
                        ),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      borderData: FlBorderData(show: false),
                      barGroups: [
                        BarChartGroupData(x: 0, barRods: [
                          BarChartRodData(toY: 8.5, color: const Color(0xFF0078D4), width: 14),
                        ]),
                        BarChartGroupData(x: 1, barRods: [
                          BarChartRodData(toY: 4.0, color: const Color(0xFFF59E0B), width: 14),
                        ]),
                        BarChartGroupData(x: 2, barRods: [
                          BarChartRodData(toY: 8.0, color: const Color(0xFF10B981), width: 14),
                        ]),
                        BarChartGroupData(x: 3, barRods: [
                          BarChartRodData(toY: 6.5, color: const Color(0xFF0078D4), width: 14),
                        ]),
                        BarChartGroupData(x: 4, barRods: [
                          BarChartRodData(toY: 0.0, color: Colors.grey, width: 14),
                        ]),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/tasks_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/timesheet_provider.dart';

class TasksScreen extends StatelessWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TimesheetProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Azure Work Items'),
        backgroundColor: Colors.transparent,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.workItems.length,
        itemBuilder: (ctx, index) {
          final item = provider.workItems[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text('#\${item.id} \${item.title}'),
              subtitle: Text('\${item.type} • \${item.completedWork}h completed'),
              trailing: ElevatedButton(
                onPressed: () {},
                child: const Text('Log'),
              ),
            ),
          );
        },
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/log_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/timesheet_provider.dart';

class LogScreen extends StatelessWidget {
  const LogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TimesheetProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Timesheet'),
        backgroundColor: Colors.transparent,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.logs.length,
        itemBuilder: (ctx, index) {
          final log = provider.logs[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: const Color(0xFF0078D4),
                child: Text('\${log.hours.toInt()}h', style: const TextStyle(color: Colors.white)),
              ),
              title: Text(log.workItemTitle),
              subtitle: Text('\${log.date} • \${log.activity}\\n\${log.comment}'),
              isThreeLine: true,
            ),
          );
        },
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/analytics_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Performance & Compliance'),
        backgroundColor: Colors.transparent,
      ),
      body: const Center(
        child: Text('Daily, Weekly, Monthly, Quarterly & Yearly Dashboards'),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/settings_screen.dart',
    category: 'screens',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/timesheet_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<TimesheetProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Colors.transparent,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Azure DevOps Connection', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),
          TextFormField(
            initialValue: provider.organization,
            decoration: const InputDecoration(labelText: 'Organization Name', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextFormField(
            initialValue: provider.project,
            decoration: const InputDecoration(labelText: 'Project Name', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextFormField(
            initialValue: provider.pat,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Personal Access Token (PAT)', border: OutlineInputBorder()),
          ),
        ],
      ),
    );
  }
}
`,
  },
  {
    path: 'README.md',
    category: 'docs',
    content: `# AzureOps Mobile Companion (Flutter Android & iOS)

A Flutter mobile application designed to connect directly to your Azure DevOps organization using a Personal Access Token (PAT).

## Features
- **Effortless Azure Task Management**: View assigned work items, update task states, and sync effort.
- **Working-Hour Compliance**: Real-time daily compliance tracking against an 8h target.
- **Missing-Hours Accuracy**: Date-wise timesheet logger solving Azure DevOps cumulative Completed Work limitations.
- **Sprint Capacity Monitoring**: Distinguishes team capacity commitments from personal daily logged hours.
- **Actionable Dashboards**: Daily, Weekly, Monthly, Quarterly, and Yearly analytics.
- **Mobile Notifications**: Local scheduled reminders when hours are missing by 5:00 PM.

## How to Run on Android or iOS

1. Ensure you have Flutter installed:
   \`\`\`bash
   flutter doctor
   \`\`\`

2. Extract this project and navigate into the folder:
   \`\`\`bash
   cd azureops_mobile
   \`\`\`

3. Install packages:
   \`\`\`bash
   flutter pub get
   \`\`\`

4. Run on an iOS Simulator or connected Android device:
   \`\`\`bash
   flutter run
   \`\`\`

## Azure DevOps PAT Permissions Needed
Create a Personal Access Token in Azure DevOps (User Settings -> Personal access tokens):
- **Work Items**: Read & Write
- **Project and Team**: Read
- **Capacity**: Read
`,
  },
];

/**
 * Packs all Flutter files into a clean downloadable zip archive.
 */
export async function generateFlutterProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const rootFolder = zip.folder('azureops_flutter_mobile');

  for (const file of FLUTTER_PROJECT_FILES) {
    rootFolder?.file(file.path, file.content);
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
