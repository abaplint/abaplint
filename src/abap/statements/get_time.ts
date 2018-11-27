import {Statement} from "./_statement";
import {str, seq, alt, opt, IStatementRunnable} from "../combi";
import {Target} from "../expressions";

export class GetTime extends Statement {

  public getMatcher(): IStatementRunnable {
    const options = seq(alt(str("STAMP FIELD"), str("FIELD")), new Target());

    return seq(str("GET TIME"), opt(options));
  }

}