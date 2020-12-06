import {IStatement} from "./_statement";
import {opts, seqs} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seqs("STRUCTURE", NamespaceSimpleName);

    const base = seqs("BASE TYPE", NamespaceSimpleName);

    const em = seqs("ENUM", NamespaceSimpleName, opts(structure), opts(base));

    const ret = seqs("TYPES", "BEGIN OF", em);

    return ret;
  }

}