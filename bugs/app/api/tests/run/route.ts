import { NextResponse } from 'next/server';
import path from 'path';
import { spawn } from 'child_process';

const PYTHON_PATH = path.join(process.cwd(), 'venv', 'bin', 'python3');

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    // Run the Python script to execute the test
    const pythonProcess = spawn(PYTHON_PATH, [
      path.join(process.cwd(), 'agents', 'run_test.py'),
      data.testId
    ]);

    return new Promise((resolve) => {
      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('Python script output:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
        console.error('Python script error:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        console.log('Python process exited with code:', code);
        if (code === 0) {
          resolve(NextResponse.json({ success: true, output }));
        } else {
          resolve(NextResponse.json(
            { error: error || 'Failed to run test' },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('Error in POST /api/tests/run:', error);
    return NextResponse.json(
      { error: 'Failed to run test' },
      { status: 500 }
    );
  }
} 