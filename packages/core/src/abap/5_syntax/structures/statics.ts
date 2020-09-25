import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StatementNode, StructureNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {TypedIdentifier} from "../../types/_typed_identifier";
import * as Basic from "../../types/basic";
import {IStructureComponent} from "../../types/basic";
import {Static} from "../statements/static";

// todo, this is much like DATA, refactor?
export class Statics {
  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
    let table: boolean = false;

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Static) {
        const found = new Static().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Statics) {
        const found = new Statics().runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.StaticBegin) {
        if (c.findDirectTokenByText("OCCURS")) {
          table = true;
        }
      } else if (c instanceof StatementNode && ctyp instanceof Statements.IncludeType) {
        // INCLUDES
        const typeName = c.findFirstExpression(Expressions.TypeName)?.getFirstToken().getStr();
        let found = scope.findType(typeName)?.getType();
        if (found === undefined) {
          const f = scope.getDDIC().lookupTableOrView(typeName);
          if (f instanceof TypedIdentifier) {
            found = f.getType();
          } else {
            found = f;
          }
        }
        if (found instanceof Basic.VoidType) {
          if (table === true) {
            return new TypedIdentifier(name, filename, new Basic.TableType(found, true));
          } else {
            return new TypedIdentifier(name, filename, found);
          }
        }
        if (found instanceof Basic.UnknownType) {
          return new TypedIdentifier(name, filename, new Basic.UnknownType("unknown type, " + typeName));
        }
        if (!(found instanceof Basic.StructureType)) {
          throw new Error("not structured, " + typeName);
        }
        for (const c of found.getComponents()) {
          components.push(c);
        }
      }
    }

    if (table === true) {
      return new TypedIdentifier(name, filename, new Basic.TableType(new Basic.StructureType(components), true));
    } else {
      return new TypedIdentifier(name, filename, new Basic.StructureType(components));
    }
  }
}