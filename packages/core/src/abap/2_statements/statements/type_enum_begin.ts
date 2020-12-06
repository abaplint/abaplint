import {IStatement} from "./_statement";
import {opt, seqs} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seqs("STRUCTURE", NamespaceSimpleName);

    const base = seqs("BASE TYPE", NamespaceSimpleName);

    const em = seqs("ENUM", NamespaceSimpleName, opt(structure), opt(base));

    const ret = seqs("TYPES", "BEGIN OF", em);

    return ret;
  }

}