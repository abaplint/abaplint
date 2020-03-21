import {IStatement} from "./_statement";
import {str, seq, alt, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = seq(alt(str("STAMP FIELD"), str("FIELD")), new Target());

    return seq(str("GET TIME"), opt(options));
  }

}