import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, opt, seq, beginEnd, sub} from "./_combi";
import {Body} from "./body";
import {ElseIf} from "./elseif";
import {Else} from "./else";
import {IStructureRunnable} from "./_structure_runnable";

export class If implements IStructure {

  public getMatcher(): IStructureRunnable {
    const contents = seq(opt(sub(new Body())),
                         star(sub(new ElseIf())),
                         opt(sub(new Else())));

    return beginEnd(sta(Statements.If),
                    contents,
                    sta(Statements.EndIf));
  }

}