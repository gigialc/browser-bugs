from langchain_openai import ChatOpenAI
from pydantic import SecretStr, BaseModel
import asyncio
import json
from datetime import datetime
import os
from typing import List, Optional
from pyppeteer import launch
from config_handler import ConfigHandler

class TestResult(BaseModel):
    status: str
    issues: List[str]
    execution_time: float
    timestamp: str

class BrowserAgent:
    def __init__(
        self,
        openai_api_key: str,
        instructions: str,
        credentials: Optional[dict] = None,
        use_vision: bool = True,
        save_logs: bool = True,
        headless: bool = True
    ):
        self.llm = ChatOpenAI(
            model="gpt-4",
            api_key=SecretStr(openai_api_key),
            base_url="https://api.openai.com/v1"
        )
        self.instructions = instructions
        self.config = ConfigHandler().load_config()
        if not self.config.target_url:
            raise ValueError("Target URL not configured in settings")
        self.target_url = self.config.target_url
        self.credentials = credentials
        self.use_vision = use_vision
        self.save_logs = save_logs
        self.headless = headless
        self.logs_dir = "logs"
        
        if save_logs and not os.path.exists(self.logs_dir):
            os.makedirs(self.logs_dir)

    def parse_instructions(self, instructions: str):
        steps = []
        lines = [line.strip().lower() for line in instructions.split('\n') if line.strip()]

        for line in lines:
            if 'go to' in line or 'navigate to' in line:
                # If the step mentions a specific page/route, append it to the target URL
                route = line.split('go to')[-1].strip() if 'go to' in line else line.split('navigate to')[-1].strip()
                if route.startswith('http'):
                    target = route  # Use full URL if provided
                else:
                    # Remove leading slash if present and append to target URL
                    route = route.lstrip('/')
                    target = f"{self.target_url.rstrip('/')}/{route}"
                steps.append({"type": "navigate", "target": target})
            
            elif 'click' in line:
                target = line.split('click')[-1].strip()
                steps.append({"type": "click", "target": target})
            
            elif 'type' in line or 'enter' in line:
                parts = line.split(' into ')
                if len(parts) == 2:
                    value = parts[0].split('"')[1] if '"' in parts[0] else parts[0].split("'")[1]
                    target = parts[1].strip()
                    steps.append({"type": "type", "target": target, "value": value})
            
            elif 'wait' in line:
                try:
                    timeout = int(''.join(filter(str.isdigit, line)))
                    steps.append({"type": "wait", "timeout": timeout})
                except ValueError:
                    continue
            
            elif any(word in line for word in ['verify', 'check', 'assert']):
                for word in ['verify', 'check', 'assert']:
                    if word in line:
                        target = line.split(word)[-1].strip()
                        steps.append({"type": "assert", "target": target})
                        break

        return steps

    async def execute_step(self, page, step: dict) -> Optional[str]:
        try:
            if step["type"] == "navigate":
                await page.goto(step["target"], {"waitUntil": "networkidle0"})
            
            elif step["type"] == "click":
                await page.click(step["target"])
            
            elif step["type"] == "type":
                await page.type(step["target"], step["value"])
            
            elif step["type"] == "wait":
                await asyncio.sleep(step["timeout"] / 1000)  # Convert to seconds
            
            elif step["type"] == "assert":
                try:
                    await page.waitForSelector(step["target"], {"timeout": 5000})
                except Exception as e:
                    return f"Assertion failed: {step['target']} - {str(e)}"
            
            return None
        except Exception as e:
            return f"Step failed: {json.dumps(step)} - {str(e)}"

    async def run(self) -> TestResult:
        start_time = datetime.now()
        issues = []

        # Launch browser
        browser = await launch({"headless": self.headless})
        page = await browser.newPage()
        
        try:
            # Set viewport
            await page.setViewport({"width": 1280, "height": 800})
            
            # Navigate to target URL
            await page.goto(self.target_url, {"waitUntil": "networkidle0"})

            # Handle authentication if provided
            if self.credentials:
                await page.type('#username, [name="username"], [type="email"]', self.credentials.get("username", ""))
                await page.type('#password, [name="password"]', self.credentials.get("password", ""))
                await page.click('[type="submit"], .login-button, .submit-button')
                await page.waitForNavigation({"waitUntil": "networkidle0"})

            # Execute test steps
            steps = self.parse_instructions(self.instructions)
            for step in steps:
                if error := await self.execute_step(page, step):
                    issues.append(error)

                if self.use_vision:
                    # Take screenshot after each step for visual verification
                    screenshot = await page.screenshot({"encoding": "base64"})
                    # Here you could send the screenshot to GPT-4V for analysis
                    pass

        except Exception as e:
            issues.append(f"Execution error: {str(e)}")
        finally:
            await browser.close()

        # Calculate execution time
        execution_time = (datetime.now() - start_time).total_seconds()

        # Save logs if enabled
        if self.save_logs:
            log_file = os.path.join(self.logs_dir, f"test_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            with open(log_file, "w") as f:
                json.dump({
                    "instructions": self.instructions,
                    "target_url": self.target_url,
                    "execution_time": execution_time,
                    "issues": issues,
                    "status": "passed" if not issues else "failed",
                    "timestamp": datetime.now().isoformat()
                }, f, indent=2)

        return TestResult(
            status="passed" if not issues else "failed",
            issues=issues,
            execution_time=execution_time,
            timestamp=datetime.now().isoformat()
        ) 