import {IStatement} from "./_statement";
import {opt, seq} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const base = seq("BASE TYPE", NamespaceSimpleName);

    const em = seq("ENUM", NamespaceSimpleName, opt(structure), opt(base));

    const ret = seq("TYPES", "BEGIN OF", em);

    return ret;
  }

}