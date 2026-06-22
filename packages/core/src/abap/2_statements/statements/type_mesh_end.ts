import {IStatement} from "./_statement";
import {seq, ver} from "../combi";
import {NamespaceSimpleName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class TypeMeshEnd implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = ver(Release.v740sp05, seq("TYPES", "END OF MESH", NamespaceSimpleName));
    return ret;
  }

}