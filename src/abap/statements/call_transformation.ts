import {Statement} from "./_statement";
import {str, seq, alt, per, plus, IRunnable} from "../combi";
import {Target, Field, Source, Dynamic} from "../expressions";

export class CallTransformation extends Statement {

  public getMatcher(): IRunnable {
    let field = seq(new Field(), str("="), new Source());

    let options = seq(str("OPTIONS"), plus(field));
    let parameters = seq(str("PARAMETERS"), alt(plus(field), new Dynamic()));
    let objects = seq(str("OBJECTS"), alt(plus(field), new Dynamic()));

    let source2 = seq(str("XML"), new Source());
    let source = seq(str("SOURCE"), alt(plus(field), source2, new Dynamic()));

    let result2 = seq(str("XML"), new Target());
    let result = seq(str("RESULT"), alt(plus(field), result2, new Dynamic()));

    let call = seq(str("CALL TRANSFORMATION"),
                   alt(new Field(), new Dynamic()),
                   per(options,
                       parameters,
                       objects,
                       source,
                       result));
    return call;
  }

}