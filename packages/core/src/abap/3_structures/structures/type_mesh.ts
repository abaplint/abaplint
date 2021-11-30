import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class TypeMesh implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TypeMeshBegin),
                    star(alt(sta(Statements.TypeMesh), sta(Statements.Type))),
                    sta(Statements.TypeMeshEnd));
  }

}