import os
from dotenv import load_dotenv
from browser_use import Agent
from langchain_openai import ChatOpenAI
from test_manager import TestManager
from config_handler import ConfigHandler
import sys
import asyncio
from pydantic import SecretStr
import json
import re
from typing import Dict, Any

# Load environment variables
load_dotenv()

def analyze_result(result: str) -> Dict[str, Any]:
    """Analyze the agent's result for various types of issues."""
    result_lower = str(result).lower()
    
    # Basic error keywords
    error_keywords = ['error', 'failed', 'could not', 'unable to', '404', '500', 'not found']
    
    # Patterns indicating repeated attempts or inconsistent behavior
    repeated_patterns = [
        r'attempt.*(?:unsuccessful|failed)',
        r'tried .*(?:times|attempts)',
        r'repeated(?:ly)?.*(?:attempt|try)',
        r'multiple.*(?:attempt|try)',
        r'not (?:redirecting|redirected)',
        r'inconsistent',
        r'unexpected.*behavior'
    ]
    
    # Check for basic errors
    has_error = any(keyword in result_lower for keyword in error_keywords)
    
    # Check for repeated attempts or inconsistent behavior
    has_repeated_issues = any(re.search(pattern, result_lower) for pattern in repeated_patterns)
    
    if has_repeated_issues:
        return {
            "error": "Test execution failed",
            "details": str(result),
            "type": "frontend_issue",
            "subtype": "inconsistent_behavior",
            "description": "The application showed inconsistent behavior or required multiple attempts to perform actions"
        }
    elif has_error:
        return {
            "error": "Test execution failed",
            "details": str(result),
            "type": "frontend_issue",
            "subtype": "error_response",
            "description": "The application returned an error or failed to complete the requested action"
        }
    else:
        return {
            "status": "passed",
            "details": str(result)
        }

async def run_test(test_id: str):
    # Initialize managers
    test_manager = TestManager()
    config_handler = ConfigHandler()
    
    # Get test and config
    test = test_manager.get_test(test_id)
    if not test:
        print(f"Test {test_id} not found")
        return
    
    config = config_handler.load_config()
    if not config.target_url:
        print("Error: Target URL not configured. Please set the target URL in the settings page.")
        test_manager.update_test_status(test_id, "failed")
        return

    # Update test status to running
    test_manager.update_test_status(test_id, "running")

    try:
        # Initialize LLM
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
            
        llm = ChatOpenAI(
            model="gpt-4o",
            api_key=SecretStr(api_key),
            base_url="https://api.openai.com/v1",
            max_tokens=4096
        )
        
        # Initialize agent with test instructions
        agent = Agent(
            task=f"On the website {config.target_url}, {test.instructions}",
            llm=llm,
            use_vision=True,
            save_conversation_path="logs/test_run.json"
        )
        
        # Run the test
        result = await agent.run()
        
        # Analyze the result
        analysis = analyze_result(str(result))
        
        if "error" in analysis:
            # Found an issue, mark as failed
            test_manager.update_test_status(test_id, "failed")
            print(json.dumps(analysis, indent=2))
        else:
            # Test passed successfully
            test_manager.update_test_status(test_id, "passed")
            print(json.dumps(analysis, indent=2))
            
    except Exception as e:
        error_details = {
            "error": "Test execution error",
            "details": str(e),
            "type": "execution_error",
            "subtype": "runtime_error",
            "description": "An error occurred while executing the test"
        }
        print(json.dumps(error_details, indent=2), file=sys.stderr)
        test_manager.update_test_status(test_id, "failed")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_test.py <test_id>")
        sys.exit(1)
        
    test_id = sys.argv[1]
    asyncio.run(run_test(test_id)) 