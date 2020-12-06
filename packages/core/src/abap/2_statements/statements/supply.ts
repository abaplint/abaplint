import {IStatement} from "./_statement";
import {verNot, seq, pluss} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Supply implements IStatement {

  public getMatcher(): IStatementRunnable {
    const field = seq(Field, "=", Source);

    const ret = seq("SUPPLY",
                    pluss(field),
                    "TO CONTEXT",
                    Field);

    return verNot(Version.Cloud, ret);
  }

}