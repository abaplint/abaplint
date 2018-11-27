import {Statement} from "./_statement";
import {str, seq, alt, per, plus, IStatementRunnable} from "../combi";
import {Target, Field, Source, Dynamic} from "../expressions";

export class CallTransformation extends Statement {

  public getMatcher(): IStatementRunnable {
    const field = seq(new Field(), str("="), new Source());

    const options = seq(str("OPTIONS"), plus(field));
    const parameters = seq(str("PARAMETERS"), alt(plus(field), new Dynamic()));
    const objects = seq(str("OBJECTS"), alt(plus(field), new Dynamic()));

    const source2 = seq(str("XML"), new Source());
    const source = seq(str("SOURCE"), alt(plus(field), source2, new Dynamic()));

    const result2 = seq(str("XML"), new Target());
    const result = seq(str("RESULT"), alt(plus(field), result2, new Dynamic()));

    const call = seq(str("CALL TRANSFORMATION"),
                     alt(new Field(), new Dynamic()),
                     per(options,
                         parameters,
                         objects,
                         source,
                         result));
    return call;
  }

}