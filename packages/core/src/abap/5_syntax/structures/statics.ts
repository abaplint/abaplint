import * as Expressions from "../../2_statements/expressions";
import * as Statements from "../../2_statements/statements";
import * as Structures from "../../3_structures/structures";
import {StatementNode, StructureNode} from "../../nodes";
import {TypedIdentifier} from "../../types/_typed_identifier";
import * as Basic from "../../types/basic";
import {IStructureComponent} from "../../types/basic";
import {Static} from "../statements/static";
import {CheckSyntaxKey, SyntaxInput, syntaxIssue} from "../_syntax_input";

// todo, this is much like DATA, refactor?
export class Statics {
  public runSyntax(node: StructureNode, input: SyntaxInput): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.DefinitionName)!.getFirstToken();
    let table: boolean = false;

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Static) {
        const found = new Static().runSyntax(c, input);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StructureNode && ctyp instanceof Structures.Statics) {
        const found = new Statics().runSyntax(c, input);
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
        let found = input.scope.findType(typeName)?.getType();
        if (found === undefined) {
          const f = input.scope.getDDIC().lookupTableOrView(typeName).type;
          if (f instanceof TypedIdentifier) {
            found = f.getType();
          } else {
            found = f;
          }
        }
        if (found instanceof Basic.VoidType) {
          if (table === true) {
            const ttyp = new Basic.TableType(found, {withHeader: true, keyType: Basic.TableKeyType.default});
            return new TypedIdentifier(name, input.filename, ttyp);
          } else {
            return new TypedIdentifier(name, input.filename, found);
          }
        }
        if (found instanceof Basic.UnknownType) {
          return new TypedIdentifier(name, input.filename, new Basic.UnknownType("unknown type, " + typeName));
        }
        if (!(found instanceof Basic.StructureType)) {
          const message = "not structured, " + typeName;
          input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
          return new TypedIdentifier(name, input.filename, Basic.VoidType.get(CheckSyntaxKey));
        }
        for (const c of found.getComponents()) {
          components.push(c);
        }
      }
    }

    if (table === true) {
      const ttyp = new Basic.TableType(new Basic.StructureType(components), {withHeader: true, keyType: Basic.TableKeyType.default});
      return new TypedIdentifier(name, input.filename, ttyp);
    } else {
      return new TypedIdentifier(name, input.filename, new Basic.StructureType(components));
    }
  }
}