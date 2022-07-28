import * as fs from 'fs/promises';
import got from 'got';

export const HTTP_PROTOCOLS: string[] = ['http:', 'https:'];

export class UberFileSystem {
  public async load(url: string): Promise<string> {
    const parsedURL = new URL(url, 'resolve://');
    if (HTTP_PROTOCOLS.includes(parsedURL.protocol)) {
      const response = await got(url);
      
      return response.body;
    }
    
    return await fs.readFile(url, { encoding: 'utf8' });
  }
  
  public async tryLoad(url: string): Promise<string | undefined> {
    try {
      return await this.load(url);
    } catch (err: any) {
      if (err.code == 'ENOENT') {
        return undefined;
      }
      
      throw err;
    }
  }
  
  public async save(url: string, content: string): Promise<void> {
    await fs.writeFile(url, content, { encoding: 'utf8' });
  }
}
