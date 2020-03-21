import {IStatement} from "./_statement";
import {str, seq, opt, alt} from "../combi";
import {Target, Source} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Clear implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq(str("WITH"), new Source());

    const mode = alt(str("IN CHARACTER MODE"),
                     str("IN BYTE MODE"));

    return seq(str("CLEAR"),
               new Target(),
               opt(wit),
               opt(mode));
  }

}