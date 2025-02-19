export interface TestStep {
  type: 'click' | 'type' | 'navigate' | 'wait' | 'assert';
  target?: string;
  value?: string;
  timeout?: number;
}

export interface TestFlow {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
  updatedAt?: string;
  lastRun?: string;
  status?: 'passed' | 'failed' | 'running' | 'not_run';
  credentials?: {
    username?: string;
    password?: string;
  };
} 