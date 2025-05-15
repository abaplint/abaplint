import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class DynproLoop implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DynproLoop),
                    star(sta(Statements.Module)),
                    sta(Statements.EndLoop));
  }

}