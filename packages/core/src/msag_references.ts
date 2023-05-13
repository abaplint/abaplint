import {IMSAGReferences} from "./_imsag_references";
import {Token} from "./abap/1_lexer/tokens/_token";
import {IObject} from "./objects/_iobject";

export class MSAGReferences implements IMSAGReferences {
  private readonly nameNumberIndex: { [messageClass: string]: { [number: number]: {filename: string, token: Token}[] } } = {};
  private readonly filenameIndex: { [filename: string]: {token: Token, messageClass: string, number: number}[] } = {};

  public addUsing(_filename: string, _token: Token, _messageClass: string, _number: number): void {
    throw new Error("Method not implemented.");
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

  public listByFilename(filename: string): { token: Token; messageClass: string; number: number; }[] {
    return this.filenameIndex[filename] || [];
  }

  public listByMessage(messageClass: string, number: number): { filename: string; token: Token; }[] {
    return this.nameNumberIndex[messageClass]?.[number] || [];
  }
}