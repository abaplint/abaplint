import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Normal} from "./normal";

export class Method implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Method),
                    star(sub(new Normal())),
                    sta(Statements.EndMethod));
  }

}