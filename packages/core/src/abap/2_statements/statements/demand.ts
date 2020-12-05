import {IStatement} from "./_statement";
import {verNot, seqs, opt, plus} from "../combi";
import {Target, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Demand implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seqs(Field, "=", Target);

    const messages = seqs("MESSAGES INTO", Target);

    const ret = seqs("DEMAND",
                     plus(field),
                     "FROM CONTEXT",
                     Field,
                     opt(messages));

    return verNot(Version.Cloud, ret);
  }

}