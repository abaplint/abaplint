import { Statement } from "./statement";
import { Token } from "../tokens/";

export class While extends Statement {

  public static match(tokens: Array<Token>): Statement {
    let str = Statement.concat(tokens).toUpperCase();
    if (/^WHILE /.test(str)) {
      return new While(tokens);
    }
    return undefined;
  }

}