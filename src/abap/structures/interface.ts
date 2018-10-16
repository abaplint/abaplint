import * as Statements from "../statements";
import {seq, opt, star, beginEnd, alt, sta, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";

export class Interface extends Structure {

  public getMatcher(): IStructureRunnable {
    let definitions = star(alt(sta(Statements.MethodDef), sta(Statements.Data), sta(Statements.Type)));

    let body = seq(opt(seq(sta(Statements.Public), definitions)),
                   opt(seq(sta(Statements.Protected), definitions)),
                   opt(seq(sta(Statements.Private), definitions)));

    return beginEnd(sta(Statements.Interface), body, sta(Statements.EndInterface));
  }

}