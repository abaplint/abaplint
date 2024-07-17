import {DataDefinition, Table, View} from "../../../objects";
import {ExpressionNode} from "../../nodes";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export type DatabaseTableSource = Table | DataDefinition | View | undefined;

export class DatabaseTable {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): DatabaseTableSource {
    const token = node.getFirstToken();
    const name = token.getStr();
    if (name === "(") {
      // dynamic
      return undefined;
    }

    const found = input.scope.getDDIC().lookupTableOrView2(name);
    if (found === undefined && input.scope.getDDIC().inErrorNamespace(name) === true) {
      throw new Error("Database table or view \"" + name + "\" not found");
    } else if (found === undefined) {
      input.scope.addReference(token, undefined, ReferenceType.TableVoidReference, input.filename);
    } else {
      input.scope.addReference(token, found.getIdentifier(), ReferenceType.TableReference, input.filename);
      input.scope.getDDICReferences().addUsing(input.scope.getParentObj(), {object: found, token: token, filename: input.filename});
    }

    return found;
  }
}