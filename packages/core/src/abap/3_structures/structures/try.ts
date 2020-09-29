import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, seq, opt, sub} from "./_combi";
import {Normal} from "./normal";
import {Catch} from "./catch";
import {IStructureRunnable} from "./_structure_runnable";

export class Try implements IStructure {

  public getMatcher(): IStructureRunnable {
    const normal = star(sub(Normal));
    const cleanup = seq(sta(Statements.Cleanup), normal);
    const block = seq(normal, star(sub(Catch)), opt(cleanup));

    return beginEnd(sta(Statements.Try),
                    block,
                    sta(Statements.EndTry));
  }

}