import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from ".";

export class Loop implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Loop),
                    star(sub(Body)),
                    sta(Statements.EndLoop));
  }

}