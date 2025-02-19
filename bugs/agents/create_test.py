from browser_use import Agent
from langchain_openai import ChatOpenAI
import json
import sys
import asyncio
from test_manager import TestManager
from config_handler import ConfigHandler
from typing import Dict, Any
import os
from pydantic import SecretStr
import re

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
            "warning": "Validation detected potential issues",
            "details": str(result),
            "type": "frontend_issue",
            "subtype": "inconsistent_behavior",
            "description": "The application showed inconsistent behavior or required multiple attempts to perform actions"
        }
    elif has_error:
        return {
            "warning": "Validation detected potential issues",
            "details": str(result),
            "type": "frontend_issue",
            "subtype": "error_response",
            "description": "The application returned an error or failed to complete the requested action"
        }
    else:
        return {
            "status": "validated",
            "details": str(result)
        }

async def create_test(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a test case and demonstrate browser automation.
    
    Args:
        input_data: Dictionary containing test name, instructions and credentials
        
    Returns:
        Dict containing test details and results
    """
    try:
        # Validate required fields
        if not input_data.get('name') or not input_data.get('instructions'):
            raise ValueError("Name and instructions are required")
        
        # Create test using TestManager
        test_manager = TestManager()
        config_handler = ConfigHandler()
        
        # Get target URL from config
        config = config_handler.load_config()
        if not config.target_url:
            raise ValueError("Target URL not configured. Please set the target URL in the settings page.")
            
        test = test_manager.create_test(
            name=input_data['name'],
            instructions=input_data['instructions'],
            credentials=input_data.get('credentials', {})
        )
        
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
        
        # Initialize agent to validate test
        agent = Agent(
            task=f"On the website {config.target_url}, {input_data['instructions']}",
            llm=llm,
            use_vision=True,
            save_conversation_path="logs/test_creation.json"
        )
        
        validation_result = None
        validation_analysis = None
        try:
            # Run a quick validation
            validation_result = await agent.run()
            validation_analysis = analyze_result(str(validation_result))
            
            if "warning" in validation_analysis:
                print(json.dumps(validation_analysis, indent=2), file=sys.stderr)
                
        except Exception as e:
            validation_analysis = {
                "warning": "Validation failed",
                "details": str(e),
                "type": "validation_error",
                "subtype": "execution_error",
                "description": "Failed to complete validation"
            }
            print(json.dumps(validation_analysis, indent=2), file=sys.stderr)
        
        # Add browser info to test data
        test_data = test.model_dump()
        test_data["browser_info"] = {
            "browser": "browser-use",
            "status": "initialized",
            "target_url": config.target_url,
            "validation_result": validation_analysis
        }
        
        # Return the created test as JSON only
        json_output = json.dumps(test_data, indent=2)
        print(json_output)
        return test_data
            
    except Exception as e:
        error_data = {
            "error": str(e),
            "status": "failed",
            "type": "creation_error",
            "subtype": "setup_error",
            "description": "Failed to create test configuration"
        }
        json_output = json.dumps(error_data, indent=2)
        print(json_output)
        raise e

async def main():
    try:
        # Read input from command line argument
        input_data = json.loads(sys.argv[1])
        await create_test(input_data)
        sys.exit(0)
    except Exception as e:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 