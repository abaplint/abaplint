import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {Field, SimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Aliases implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("ALIASES",
                SimpleName,
                "FOR",
                Field);
  }

}