import 'package:flutter/material.dart';

import 'widgets/rtl_scaffold.dart';

void main() {
  runApp(RashaApp());
}

class RashaApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RASHA Warehouse',
      theme: ThemeData(
        primarySwatch: Colors.indigo,
      ),
      home: LoginPage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class LoginPage extends StatefulWidget {
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController codeCtrl = TextEditingController();
  final TextEditingController passCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return RtlScaffold(
      body: Center(
        child: Card(
          margin: EdgeInsets.all(24),
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text('RASHA — ورود', style: TextStyle(fontSize: 20)),
              LabeledField(controller: codeCtrl, label: 'کد پرسنلی'),
              LabeledField(controller: passCtrl, label: 'رمز عبور', obscureText: true),
              SizedBox(height: 12),
              ElevatedButton(onPressed: () {
                // TODO: call API /api/auth/login
                Navigator.push(context, MaterialPageRoute(builder: (_) => HomePage()));
              }, child: Text('ورود'))
            ]),
          ),
        ),
      ),
    );
  }
}

class HomeTab {
  const HomeTab(this.icon, this.label);

  final IconData icon;
  final String label;
}

const List<HomeTab> homeTabs = [
  HomeTab(Icons.dashboard, 'داشبورد'),
  HomeTab(Icons.edit, 'ثبت شمارش'),
  HomeTab(Icons.bar_chart, 'گزارش‌ها'),
  HomeTab(Icons.chat, 'چت'),
  HomeTab(Icons.person, 'حساب کاربری'),
];

class HomePage extends StatefulWidget {
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int idx = 0;

  @override
  Widget build(BuildContext context) {
    return RtlScaffold(
      body: Center(child: Text(homeTabs[idx].label)),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: idx,
        onTap: (i) => setState(() => idx = i),
        items: [
          for (final tab in homeTabs) BottomNavigationBarItem(icon: Icon(tab.icon), label: tab.label),
        ],
      ),
    );
  }
}
