import 'package:flutter/material.dart';

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
    return Directionality( // RTL support
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: Center(
          child: Card(
            margin: EdgeInsets.all(24),
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Text('RASHA — ورود', style: TextStyle(fontSize: 20)),
                TextField(controller: codeCtrl, decoration: InputDecoration(labelText: 'کد پرسنلی')),
                TextField(controller: passCtrl, decoration: InputDecoration(labelText: 'رمز عبور'), obscureText: true),
                SizedBox(height: 12),
                ElevatedButton(onPressed: () {
                  // TODO: call API /api/auth/login
                  Navigator.push(context, MaterialPageRoute(builder: (_) => HomePage()));
                }, child: Text('ورود'))
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

class HomePage extends StatefulWidget {
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int idx = 0;
  final pages = [Center(child: Text('داشبورد')), Center(child: Text('ثبت شمارش')), Center(child: Text('گزارش‌ها')), Center(child: Text('چت')), Center(child: Text('حساب کاربری'))];
  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: pages[idx],
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: idx,
          onTap: (i) => setState(() => idx = i),
          items: [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'داشبورد'),
            BottomNavigationBarItem(icon: Icon(Icons.edit), label: 'ثبت شمارش'),
            BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'گزارش‌ها'),
            BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'چت'),
            BottomNavigationBarItem(icon: Icon(Icons.person), label: 'حساب کاربری'),
          ],
        ),
      ),
    );
  }
}
