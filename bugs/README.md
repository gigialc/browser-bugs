# Browser Bugs - Automated UI Testing Platform

A platform for creating and running automated UI tests using natural language instructions and AI-powered browser automation.

## Structure

```
bugs/
├── app/                    # Next.js frontend
│   ├── components/        # Reusable UI components
│   ├── settings/         # Settings page
│   ├── tests/           # Test flows management UI
│   └── ...
├── agents/               # Python-based test automation
│   ├── browser_agent.py # Browser automation implementation
│   ├── config_handler.py # Settings management
│   ├── test_manager.py  # Test flows management
│   └── run_test.py      # CLI interface
└── ...
```

## Setup

1. Install dependencies:
```bash
# Frontend
npm install

# Python agents
cd agents
pip install -r requirements.txt
```

2. Configure environment:
```bash
# Create .env file with:
OPENAI_API_KEY=your-key-here
```

3. Start development:
```bash
# Frontend
npm run dev

# Run a test
cd agents
python run_test.py
```

## Features

- Natural language test instructions
- AI-powered browser automation
- Visual verification with GPT-4V
- Detailed test logging
- Authentication handling
- Configurable target URLs
- Real-time test status updates

## Test Flow Example

```python
test = test_manager.create_test(
    name="Login Flow Test",
    instructions="""
    Go to the login page
    Type "testuser@example.com" into the email field
    Type "password123" into the password field
    Click the login button
    Wait 2000
    Verify the dashboard heading
    """,
    credentials={
        "username": "testuser@example.com",
        "password": "password123"
    }
)
```

## License

MIT
