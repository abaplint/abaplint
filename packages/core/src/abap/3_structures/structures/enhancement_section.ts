import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {opt, sta, sub, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from "./body";

export class EnhancementSection implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.EnhancementSection),
                    opt(sub(Body)),
                    sta(Statements.EndEnhancementSection));
  }

}