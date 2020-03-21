import {IStatement} from "./_statement";
import {verNot, str, seq, alt} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class DeleteMemory implements IStatement {

  public getMatcher(): IStatementRunnable {
    const memory = seq(str("MEMORY ID"), new Source());

    const id = seq(str("ID"), new Source());
    const shared = seq(str("SHARED MEMORY"),
                       new Field(),
                       str("("),
                       new Field(),
                       str(")"),
                       id);

    const ret = seq(str("DELETE FROM"), alt(memory, shared));

    return verNot(Version.Cloud, ret);
  }

}