import {Statement} from "./_statement";
import {str, seq, opt, alt, plus, IStatementRunnable} from "../combi";
import {MethodParam, Field} from "../expressions";

export class Events extends Statement {

  public getMatcher(): IStatementRunnable {
    const par = seq(new MethodParam(), opt(str("OPTIONAL")));

    const exporting = seq(str("EXPORTING"), plus(par));

    return seq(alt(str("CLASS-EVENTS"), str("EVENTS")), new Field(), opt(exporting));
  }

}