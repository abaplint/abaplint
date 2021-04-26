import {IStatement} from "./_statement";
import {opt, seq, ver} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TypeEnumBegin implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const base = seq("BASE TYPE", NamespaceSimpleName);

    const em = seq("ENUM", NamespaceSimpleName, opt(structure), opt(base));

    const ret = ver(Version.v751, seq("TYPES", "BEGIN OF", em));

    return ret;
  }

}