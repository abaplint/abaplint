import { Statement } from "./statement";
import { Token } from "../tokens";

export class MethodDef extends Statement {

  public static match(tokens: Array<Token>): Statement {
    let str = Statement.concat(tokens).toUpperCase();
    if (/^(CLASS-)?METHOD(S?) /.test(str)) {
      return new MethodDef(tokens);
    }
    return undefined;
  }

}