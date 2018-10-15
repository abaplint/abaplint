import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, opt, seq, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";

export class If extends Structure {

  public getMatcher(): IStructureRunnable {
    let body = star(sub(new Normal()));
    let els = seq(sta(Statements.Else), body);
    let elseif = seq(sta(Statements.ElseIf), body);
    let contents = seq(body, star(elseif), opt(els));

    return beginEnd(sta(Statements.If),
                    contents,
                    sta(Statements.EndIf));
  }

}