import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, per, plus, IRunnable} from "../combi";
import {Target} from "../expressions";

export class CallTransformation extends Statement {

  public static get_matcher(): IRunnable {
    let field = seq(new Reuse.Field(), str("="), new Reuse.Source());

    let options = seq(str("OPTIONS"), plus(field));
    let parameters = seq(str("PARAMETERS"), alt(plus(field), new Reuse.Dynamic()));
    let objects = seq(str("OBJECTS"), alt(plus(field), new Reuse.Dynamic()));

    let source2 = seq(str("XML"), new Reuse.Source());
    let source = seq(str("SOURCE"), alt(plus(field), source2, new Reuse.Dynamic()));

    let result2 = seq(str("XML"), new Target());
    let result = seq(str("RESULT"), alt(plus(field), result2, new Reuse.Dynamic()));

    let call = seq(str("CALL TRANSFORMATION"),
                   alt(new Reuse.Field(), new Reuse.Dynamic()),
                   per(options,
                       parameters,
                       objects,
                       source,
                       result));
    return call;
  }

}