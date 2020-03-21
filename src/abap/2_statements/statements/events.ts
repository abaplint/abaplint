import {Statement} from "./_statement";
import {str, seq, opt, alt, plus, IStatementRunnable} from "../combi";
import {Field, MethodParamOptional} from "../expressions";

export class Events extends Statement {

  public getMatcher(): IStatementRunnable {

    const exporting = seq(str("EXPORTING"), plus(new MethodParamOptional()));

    return seq(alt(str("CLASS-EVENTS"), str("EVENTS")), new Field(), opt(exporting));
  }

}