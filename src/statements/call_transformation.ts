import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class CallTransformation extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = seq(str("OPTIONS"), Reuse.field(), str("="), Reuse.source());

    let source1 = seq(Reuse.field(), str("="), Reuse.field());
    let source2 = seq(str("XML"), Reuse.source());
    let source = seq(str("SOURCE"), alt(source1, source2, Reuse.dynamic()));

    let result1 = seq(Reuse.field(), str("="), Reuse.field());
    let result2 = seq(str("XML"), Reuse.target());
    let result = seq(str("RESULT"), alt(result1, result2, Reuse.dynamic()));

    let call = seq(str("CALL TRANSFORMATION"),
                   Reuse.field(),
                   opt(options),
                   source,
                   result);
    return call;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher( ), tokens, true);
    if (result === true) {
      return new CallTransformation(tokens);
    }
    return undefined;
  }

}