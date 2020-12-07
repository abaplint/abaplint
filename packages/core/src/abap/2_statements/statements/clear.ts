import {IStatement} from "./_statement";
import {seq, opt, alt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Clear implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq("WITH", Source);

    const mode = alt("IN CHARACTER MODE",
                     "IN BYTE MODE");

    return seq("CLEAR",
               Target,
               opt(wit),
               opt(mode));
  }

}