import {IStatement} from "./_statement";
import {seq, alt, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = seq(alt("STAMP FIELD", "FIELD"), Target);

    return seq("GET TIME", opt(options));
  }

}