import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {WhenType} from "./when_type";

export class CaseType implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.CaseType),
                    star(sub(WhenType)),
                    sta(Statements.EndCase));
  }

}