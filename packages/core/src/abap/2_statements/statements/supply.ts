import {IStatement} from "./_statement";
import {verNot, seq, plus} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Supply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(Field, "=", Source);

    const ret = seq("SUPPLY",
                    plus(field),
                    "TO CONTEXT",
                    Field);

    return verNot(Version.Cloud, ret);
  }

}