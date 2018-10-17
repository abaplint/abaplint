import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub, alt} from "./_combi";

export class Constants extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ConstantBegin),
                    star(alt(sta(Statements.Constant), sub(new Constants()))),
                    sta(Statements.ConstantEnd));
  }

}