import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, seq, opt, sub} from "./_combi";
import {Catch} from "./catch";
import {IStructureRunnable} from "./_structure_runnable";
import {Body} from "./body";
import {Cleanup} from "./cleanup";

export class Try implements IStructure {

  public getMatcher(): IStructureRunnable {
    const block = seq(opt(sub(Body)), star(sub(Catch)), opt(sub(Cleanup)));

    return beginEnd(sta(Statements.Try),
                    block,
                    sta(Statements.EndTry));
  }

}