import {IStatement} from "./_statement";
import {opts, seqs} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seqs("STRUCTURE", NamespaceSimpleName);

    const ret = seqs("TYPES", "END OF", "ENUM", NamespaceSimpleName, opts(structure));

    return ret;
  }

}