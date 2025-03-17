# Browser Bugs - AI-Powered Browser Testing Platform

A comprehensive platform for creating and running automated UI tests using natural language instructions and AI-powered browser automation.

## Project Overview

Browser Bugs is designed to simplify web application testing by allowing tests to be written in natural language. The platform leverages AI to interpret these instructions and automate browser interactions, making test creation accessible to non-technical users while maintaining powerful testing capabilities.

## Repository Structure

```
browser-bugs/
├── agents/              # Root level agent scripts
│   ├── run_test.py     # CLI test runner
│   └── create_test.py  # Test creation utility
│
├── bugs/               # Main application directory
│   ├── app/            # Next.js frontend
│   │   ├── components/ # Reusable UI components
│   │   ├── settings/   # Settings page
│   │   └── tests/      # Test flows management UI
│   │
│   ├── agents/         # Python-based test automation
│   │   ├── browser_agent.py # Browser automation implementation
│   │   ├── config_handler.py # Settings management
│   │   ├── test_manager.py # Test flows management
│   │   └── ...
│   │
│   ├── public/         # Static assets
│   ├── types/          # TypeScript type definitions
│   └── ...
```

## Key Features

- 🗣️ **Natural Language Testing**: Create tests using simple English instructions
- 🤖 **AI-Powered Automation**: Intelligent interpretation of test steps
- 🔍 **Visual Verification**: Uses GPT-4V for visual element recognition
- 📊 **Detailed Reporting**: Comprehensive test execution logs
- 🔐 **Authentication Handling**: Built-in support for login flows
- ⚙️ **Configurable Settings**: Easily adjust test parameters
- 📱 **Responsive Testing**: Test across different device viewports

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Automation**: Puppeteer, OpenAI API
- **Languages**: TypeScript, JavaScript, Python

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/browser-bugs.git
cd browser-bugs
```

2. Set up the frontend:
```bash
cd bugs
npm install
```

3. Set up the Python environment:
```bash
cd bugs/agents
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
# In bugs/.env
OPENAI_API_KEY=your-openai-api-key
```

5. Start the development server:
```bash
cd bugs
npm run dev
```

6. Run a test:
```bash
# From the root level
python agents/run_test.py

# Or from the bugs/agents directory
cd bugs/agents
python run_test.py
```

## Creating Tests

Tests can be created either through the web UI or programmatically:

```python
# Example of creating a test programmatically
from agents.test_manager import TestManager

manager = TestManager()
test = manager.create_test(
    name="Login Flow",
    instructions="""
    Go to the login page
    Type "testuser@example.com" into the email field
    Type "password123" into the password field
    Click the login button
    Wait until the dashboard loads
    Verify the welcome message contains "Hello, Test User"
    """
)
```

## License

MIT 