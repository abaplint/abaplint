import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {sta, beginEnd, sub, opt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from ".";

export class LoopAtScreen implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.LoopAtScreen),
                    opt(sub(Body)),
                    sta(Statements.EndLoop));
  }

}