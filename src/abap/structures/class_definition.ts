import * as Statements from "../statements";
import {seq, opt, star, beginEnd, alt, sta, sub, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";
import {Types, Data, Constants} from ".";

export class ClassDefinition extends Structure {

  public getMatcher(): IStructureRunnable {
    let definitions = star(alt(sta(Statements.MethodDef),
                               sta(Statements.InterfaceDef),
                               sta(Statements.Data),
                               sta(Statements.Constant),
                               sta(Statements.Aliases),
                               sub(new Types()),
                               sub(new Constants()),
                               sub(new Data()),
                               sta(Statements.Type)));

    let body = seq(opt(seq(sta(Statements.Public), definitions)),
                   opt(seq(sta(Statements.Protected), definitions)),
                   opt(seq(sta(Statements.Private), definitions)));

    return beginEnd(sta(Statements.ClassDefinition), body, sta(Statements.EndClass));
  }

}