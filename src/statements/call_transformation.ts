import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class CallTransformation extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = seq(str("OPTIONS"), Reuse.field(), str("="), Reuse.source());

    let field = seq(Reuse.field(), str("="), alt(Reuse.field(), Reuse.field_symbol()));

    let source2 = seq(str("XML"), Reuse.source());
    let source = seq(str("SOURCE"), alt(field, source2, Reuse.dynamic()));

    let result2 = seq(str("XML"), Reuse.target());
    let result = seq(str("RESULT"), alt(field, result2, Reuse.dynamic()));

    let call = seq(str("CALL TRANSFORMATION"),
                   Reuse.field(),
                   opt(options),
                   source,
                   result);
    return call;
  }

}