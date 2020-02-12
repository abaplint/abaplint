import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt} from "./_combi";
import {StatementNode, StructureNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import * as Basic from "../types/basic";
import {IStructureComponent} from "../types/basic";
import {IStructureRunnable} from "./_structure_runnable";

export class Statics implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.StaticBegin),
                    star(alt(sta(Statements.Static), sta(Statements.IncludeType))),
                    sta(Statements.StaticEnd));
  }

  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Static) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      }
      // todo, nested structures and INCLUDES
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }

}