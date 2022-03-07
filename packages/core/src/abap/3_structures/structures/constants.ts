import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Constants implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ConstantBegin),
                    star(alt(sta(Statements.Constant),
                             sta(Statements.Include),
                             sub(Constants))),
                    sta(Statements.ConstantEnd));
  }

}