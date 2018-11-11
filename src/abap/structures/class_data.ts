import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, alt, sub} from "./_combi";

export class ClassData extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ClassDataBegin),
                    star(alt(sta(Statements.ClassData), sub(new ClassData()))),
                    sta(Statements.ClassDataEnd));
  }

}