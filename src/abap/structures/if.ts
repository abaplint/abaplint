import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, opt, seq, beginEnd, sub} from "./_combi";
import {Body} from "./body";
import {ElseIf} from "./elseif";
import {Else} from "./else";

export class If extends Structure {

  public getMatcher(): IStructureRunnable {
    const contents = seq(opt(sub(new Body())),
                         star(sub(new ElseIf())),
                         opt(sub(new Else())));

    return beginEnd(sta(Statements.If),
                    contents,
                    sta(Statements.EndIf));
  }

}