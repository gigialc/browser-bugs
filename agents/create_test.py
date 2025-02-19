from playwright.sync_api import sync_playwright
import json
import sys
from typing import Dict, Any

def create_test(name: str, instructions: str) -> Dict[str, Any]:
    """
    Create a test case and demonstrate browser automation.
    
    Args:
        name: Name of the test
        instructions: Test instructions/steps
        
    Returns:
        Dict containing test details and results
    """
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)  # Set headless=False to see the browser
        page = browser.new_page()
        
        # Create test results
        test_data = {
            "id": "test_" + str(hash(name))[-10:],  # Generate a unique ID
            "name": name,
            "instructions": instructions,
            "status": "created",
            "browser_info": {
                "browser": "chromium",
                "user_agent": page.evaluate("navigator.userAgent"),
                "viewport": page.viewport_size
            }
        }
        
        # Close browser
        browser.close()
        return test_data

def main():
    try:
        # Read input from command line arguments
        if len(sys.argv) != 3:
            print("Usage: python create_test.py <test_name> <test_instructions>")
            sys.exit(1)
            
        name = sys.argv[1]
        instructions = sys.argv[2]
        
        # Create test and get results
        test_data = create_test(name, instructions)
        
        # Output results as JSON
        print(json.dumps(test_data, indent=2))
        sys.exit(0)
        
    except Exception as e:
        error_data = {
            "error": str(e),
            "status": "failed"
        }
        print(json.dumps(error_data, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main() 