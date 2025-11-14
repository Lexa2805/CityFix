import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'env.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runApp(const CityFixApp());
}

class CityFixApp extends StatelessWidget {
  const CityFixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CityFix QR',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _status = 'Checking Supabase…';
  List<Map<String, dynamic>> _rows = [];

  @override
  void initState() {
    super.initState();
    _testSupabase();
  }

  Future<void> _testSupabase() async {
    try {
      final client = Supabase.instance.client;

      // Example: read from a table called `reports_test`
      final response = await client
          .from('reports_test')
          .select('*')
          .limit(5);

      setState(() {
        _status = 'Supabase connected ✔';
        _rows = (response as List)
            .cast<Map<String, dynamic>>();
      });
    } catch (e) {
      setState(() {
        _status = 'Supabase error: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CityFix QR – Mobile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _status,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: _rows.length,
                itemBuilder: (context, index) {
                  final row = _rows[index];
                  return ListTile(
                    title: Text(row.toString()),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
