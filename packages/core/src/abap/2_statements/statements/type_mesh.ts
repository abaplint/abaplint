import {IStatement} from "./_statement";
import {opt, plus, seq, star, ver} from "../combi";
import {NamespaceSimpleName, TypeName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TypeMesh implements IStatement {

  public getMatcher(): IStatementRunnable {
    const on = seq("ON", NamespaceSimpleName, "=", NamespaceSimpleName, star(seq("AND", NamespaceSimpleName, "=", NamespaceSimpleName)));

    const using = seq("USING KEY", NamespaceSimpleName);

    const association = seq("ASSOCIATION", NamespaceSimpleName, "TO", NamespaceSimpleName, plus(on));

    const ret = ver(Version.v751, seq("TYPES", NamespaceSimpleName, "TYPE", opt("REF TO"), TypeName, plus(association), opt(using)));

    return ret;
  }

}