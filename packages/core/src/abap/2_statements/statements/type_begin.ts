import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeBegin implements IStatement {

  public getMatcher(): IStatementRunnable {

    const ret = seqs("TYPES", "BEGIN OF", NamespaceSimpleName);

    return ret;
  }

}