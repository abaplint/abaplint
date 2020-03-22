import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ClassData implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ClassDataBegin),
                    star(alt(sta(Statements.ClassData), sub(new ClassData()))),
                    sta(Statements.ClassDataEnd));
  }

}