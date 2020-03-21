import {Statement} from "./_statement";
import {verNot, str, seq, IStatementRunnable, alt} from "../combi";
import {Source, Field} from "../expressions";
import {Version} from "../../../version";

export class DeleteMemory extends Statement {

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