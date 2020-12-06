import {IStatement} from "./_statement";
import {seq, alts, opts} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = seq(alts("STAMP FIELD", "FIELD"), Target);

    return seq("GET TIME", opts(options));
  }

}