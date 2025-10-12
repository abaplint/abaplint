import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from ".";

export class LoopExtract implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.LoopExtract),
                    star(sub(Body)),
                    sta(Statements.EndLoop));
  }

}