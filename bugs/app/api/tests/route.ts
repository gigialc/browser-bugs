import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const TEST_FLOWS_FILE = path.join(process.cwd(), 'agents', 'test_flows.json');
const PYTHON_PATH = path.join(process.cwd(), 'venv', 'bin', 'python3');

export async function GET() {
  try {
    if (!fs.existsSync(TEST_FLOWS_FILE)) {
      return NextResponse.json([]);
    }

    const testData = fs.readFileSync(TEST_FLOWS_FILE, 'utf8');
    const tests = JSON.parse(testData);
    
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error in GET /api/tests:', error);
    return NextResponse.json(
      { error: 'Failed to load test flows' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received test creation request:', data);
    
    // Validate required fields
    if (!data.name || !data.instructions) {
      console.error('Missing required fields:', { name: !!data.name, instructions: !!data.instructions });
      return NextResponse.json(
        { error: 'Name and instructions are required' },
        { status: 400 }
      );
    }

    // Ensure agents directory exists
    const agentsDir = path.dirname(TEST_FLOWS_FILE);
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }

    console.log('Using Python path:', PYTHON_PATH);
    console.log('Script path:', path.join(process.cwd(), 'agents', 'create_test.py'));

    // Run the Python script to create the test
    const pythonProcess = spawn(PYTHON_PATH, [
      path.join(process.cwd(), 'agents', 'create_test.py'),
      JSON.stringify({
        name: data.name,
        instructions: data.instructions,
        credentials: data.credentials || {}
      })
    ]);

    return new Promise((resolve, reject) => {
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

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        reject(NextResponse.json(
          { error: 'Failed to start test creation process' },
          { status: 500 }
        ));
      });

      pythonProcess.on('close', (code) => {
        console.log('Python process exited with code:', code);
        if (code === 0 && output) {
          try {
            const result = JSON.parse(output);
            resolve(NextResponse.json(result));
          } catch (err) {
            console.error('Failed to parse Python output:', err);
            resolve(NextResponse.json(
              { error: 'Invalid response from test creation' },
              { status: 500 }
            ));
          }
        } else {
          console.error('Python process failed:', { code, error });
          resolve(NextResponse.json(
            { error: error || 'Failed to create test' },
            { status: 500 }
          ));
        }
      });
    });
  } catch (error) {
    console.error('Error in POST /api/tests:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
} 