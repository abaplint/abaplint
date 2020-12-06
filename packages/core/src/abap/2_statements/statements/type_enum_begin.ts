import {IStatement} from "./_statement";
import {opts, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const base = seq("BASE TYPE", NamespaceSimpleName);

    const em = seq("ENUM", NamespaceSimpleName, opts(structure), opts(base));

    const ret = seq("TYPES", "BEGIN OF", em);

    return ret;
  }

}