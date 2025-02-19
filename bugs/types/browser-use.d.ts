declare module 'browser-use' {
    export class BrowserUse {
      start(): Promise<void>;
      stop(): Promise<void>;
      goto(url: string): Promise<void>;
      click(selector: string): Promise<void>;
      type(selector: string, text: string): Promise<void>;
      wait(ms: number): Promise<void>;
      assert(selector: string): Promise<void>;
    }
}