declare module 'imap-simple' {
  export interface ImapConfig {
    imap: {
      host: string;
      port: number;
      tls: boolean;
      tlsOptions?: { rejectUnauthorized: boolean };
      authTimeout?: number;
      connTimeout?: number;
    };
    user: string;
    password: string;
  }

  export interface MessageAttributes {
    uid?: number;
    flags?: string[];
  }

  export interface MessagePart {
    which: string;
    body: string;
  }

  export interface ImapMessage {
    attributes: MessageAttributes;
    parts: MessagePart[];
  }

  export interface ImapConnection {
    openBox(boxName: string): Promise<void>;
    search(criteria: any[], options: any): Promise<ImapMessage[]>;
    addFlags(uid: string, flag: string): Promise<void>;
    expunge(): Promise<void>;
    getBoxes(): Promise<Record<string, any>>;
    end(): Promise<void>;
  }

  export function connect(config: ImapConfig): Promise<ImapConnection>;
}

declare module 'mailparser' {
  export interface ParsedMail {
    subject?: string;
    from?: {
      value: Array<{
        address: string;
        name?: string;
      }>;
    };
    to?: {
      value: Array<{
        address: string;
        name?: string;
      }>;
    };
    text?: string;
    html?: string;
    date?: Date;
  }

  export function simpleParser(input: string | Buffer): Promise<ParsedMail>;
}
