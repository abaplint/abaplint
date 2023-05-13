import {IMSAGReferences} from "./_imsag_references";
import {Token} from "./abap/1_lexer/tokens/_token";
import {IObject} from "./objects/_iobject";

export class MSAGReferences implements IMSAGReferences {
  private readonly nameNumberIndex: { [messageClass: string]: { [number: string]: {filename: string, token: Token}[] } } = {};
  private readonly filenameIndex: { [filename: string]: {token: Token, messageClass: string, number: string}[] } = {};

  public addUsing(filename: string, token: Token, messageClass: string, number: string): void {
    if (this.filenameIndex[filename] === undefined) {
      this.filenameIndex[filename] = [];
    }
    this.filenameIndex[filename].push({
      token: token,
      messageClass: messageClass,
      number: number,
    });

    if (this.nameNumberIndex[messageClass] === undefined) {
      this.nameNumberIndex[messageClass] = {};
    }
    if (this.nameNumberIndex[messageClass][number] === undefined) {
      this.nameNumberIndex[messageClass][number] = [];
    }
    this.nameNumberIndex[messageClass][number].push({
      filename: filename,
      token: token,
    });
  }

  public clear(obj: IObject): void {
    for (const file of obj.getFiles()) {
      const filename = file.getFilename();
      for (const fIndex of this.filenameIndex[filename] || []) {
// this should be okay for performance, each message should be referenced less than 10 times typically
        this.nameNumberIndex[fIndex.messageClass][fIndex.number] =
          this.nameNumberIndex[fIndex.messageClass][fIndex.number].filter(i => i.filename !== filename);
      }
      delete this.filenameIndex[filename];
    }
  }

  public listByFilename(filename: string): { token: Token; messageClass: string; number: string; }[] {
    return this.filenameIndex[filename] || [];
  }

  public listByMessage(messageClass: string, number: string): { filename: string; token: Token; }[] {
    return this.nameNumberIndex[messageClass]?.[number] || [];
  }
}