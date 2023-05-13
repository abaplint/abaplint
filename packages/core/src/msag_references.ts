import {IMSAGReferences} from "./_imsag_references";
import {Token} from "./abap/1_lexer/tokens/_token";
import {IObject} from "./objects/_iobject";

export class MSAGReferences implements IMSAGReferences {

  public addUsing(_filename: string, _token: Token, _messageClass: string, _number: number): void {
    throw new Error("Method not implemented.");
  }

  public clear(_obj: IObject): void {
    // todo
    return;
  }

  public listByFilename(_filename: string): { token: Token; messageClass: string; number: number; }[] {
    throw new Error("Method not implemented.");
  }

  public listByMessage(_messageClass: string, _number: number): { filename: string; token: Token; }[] {
    throw new Error("Method not implemented.");
  }
}