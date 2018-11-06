import * as Statements from "../statements";
import {seq, opt, beginEnd, sta, sub, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";
import {PrivateSection} from "./private_section";
import {ProtectedSection} from "./protected_section";
import {PublicSection} from "./public_section";

export class ClassDefinition extends Structure {

  public getMatcher(): IStructureRunnable {
    let body = seq(opt(sub(new PublicSection())),
                   opt(sub(new ProtectedSection())),
                   opt(sub(new PrivateSection())));

    return beginEnd(sta(Statements.ClassDefinition), body, sta(Statements.EndClass));
  }

}