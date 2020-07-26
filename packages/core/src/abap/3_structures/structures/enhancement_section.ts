import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, sub, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Normal} from "./normal";

export class EnhancementSection implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.EnhancementSection),
                    star(sub(new Normal())),
                    sta(Statements.EndEnhancementSection));
  }

}