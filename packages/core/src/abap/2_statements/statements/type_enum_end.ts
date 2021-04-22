import {IStatement} from "./_statement";
import {opt, seq, ver} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TypeEnumEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const structure = seq("STRUCTURE", NamespaceSimpleName);

    const ret = ver(Version.v751, seq("TYPES", "END OF", "ENUM", NamespaceSimpleName, opt(structure)));

    return ret;
  }

}