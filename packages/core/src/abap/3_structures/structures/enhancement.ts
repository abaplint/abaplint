import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, sub, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Normal} from "./normal";

export class Enhancement implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Enhancement),
                    star(sub(Normal)),
                    sta(Statements.EndEnhancement));
  }

}