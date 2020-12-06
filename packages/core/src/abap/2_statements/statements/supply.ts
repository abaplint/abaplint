import {IStatement} from "./_statement";
import {verNot, seqs, plus} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Supply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seqs(Field, "=", Source);

    const ret = seqs("SUPPLY",
                     plus(field),
                     "TO CONTEXT",
                     Field);

    return verNot(Version.Cloud, ret);
  }

}