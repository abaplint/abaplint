import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let per = Combi.per;
let plus = Combi.plus;

export class CallTransformation extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let options = seq(str("OPTIONS"), new Reuse.Field(), str("="), new Reuse.Source());

    let field = seq(new Reuse.Field(), str("="), new Reuse.Source());

    let source2 = seq(str("XML"), new Reuse.Source());
    let source = seq(str("SOURCE"), alt(plus(field), source2, new Reuse.Dynamic()));

    let result2 = seq(str("XML"), new Reuse.Target());
    let result = seq(str("RESULT"), alt(field, result2, new Reuse.Dynamic()));

    let call = seq(str("CALL TRANSFORMATION"),
                   alt(new Reuse.Field(), new Reuse.Dynamic()),
                   per(options,
                       source,
                       result));
    return call;
  }

}