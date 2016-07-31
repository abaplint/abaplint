import { Statement } from "./statement";
import { Token } from "../tokens/";
import * as Combi from "../combi";
import Reuse from "./reuse";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;

export class InterfaceDef extends Statement {

  public static get_matcher(): Combi.IRunnable {
    return seq(str("INTERFACES"),
               Reuse.field(),
               opt(seq(str("ABSTRACT METHODS"), Reuse.field())));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new InterfaceDef(tokens);
    }
    return undefined;
  }

}