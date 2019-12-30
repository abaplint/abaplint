import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, alt, sub} from "./_combi";
import {StatementNode, StructureNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import * as Basic from "../types/basic";
import {IStructureComponent} from "../types/basic";

export class Data extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DataBegin),
                    star(alt(sta(Statements.Data), sub(new Data()), sta(Statements.IncludeType))),
                    sta(Statements.DataEnd));
  }

  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Data) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StructureNode && ctyp instanceof Data) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      }
      // todo: INCLUDES
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }

}