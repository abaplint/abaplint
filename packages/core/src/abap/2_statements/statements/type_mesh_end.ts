import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class TypeMeshEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = ver(Version.v740sp05, seq("TYPES", "END OF MESH", NamespaceSimpleName));
    return ret;
  }

}