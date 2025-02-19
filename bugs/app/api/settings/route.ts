import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'agents', 'config.json');

export async function GET() {
  try {
    // Create agents directory if it doesn't exist
    const agentsDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }

    // Return default settings if file doesn't exist
    if (!fs.existsSync(CONFIG_FILE)) {
      const defaultConfig = {
        target_url: '',
        auto_run: false,
      };
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
      return NextResponse.json(defaultConfig);
    }

    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate target URL
    if (typeof data.target_url !== 'string') {
      return NextResponse.json(
        { error: 'Target URL must be a string' },
        { status: 400 }
      );
    }

    // Validate URL format if provided
    if (data.target_url && !data.target_url.match(/^https?:\/\/.+/)) {
      return NextResponse.json(
        { error: 'Invalid URL format. URL must start with http:// or https://' },
        { status: 400 }
      );
    }

    // Create agents directory if it doesn't exist
    const agentsDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }

    // Save the config
    const config = {
      target_url: data.target_url.trim(),
      auto_run: Boolean(data.auto_run),
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
} 