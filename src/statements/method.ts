import { Statement } from "./statement";
import { Token } from "../tokens";

export class Method extends Statement {

  public static match(tokens: Array<Token>): Statement {
    let str = Statement.concat(tokens).toUpperCase();
    if (/^METHOD [\w~]+.$/.test(str)) {
      return new Method(tokens);
    }
    return undefined;
  }

}