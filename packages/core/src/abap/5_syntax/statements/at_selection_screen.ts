import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {StatementSyntax} from "../_statement_syntax";
import {SyntaxInput} from "../_syntax_input";
import {ReferenceType} from "../_reference";
import {SourceField} from "../expressions/source_field";

export class AtSelectionScreen implements StatementSyntax {
  public runSyntax(node: StatementNode, input: SyntaxInput): void {
    // "AT SELECTION-SCREEN ON <field>", "ON VALUE-REQUEST FOR <field>",
    // "ON HELP-REQUEST FOR <field>" and "ON END OF <field>" all reference
    // a parameter or select-option, register these as read references so
    // they are not reported as unused.
    const fields = [
      ...node.findAllExpressions(Expressions.FieldSub),
      ...node.findAllExpressions(Expressions.Field),
    ];

    for (const field of fields) {
      const token = field.getFirstToken();
      if (input.scope.findVariable(token.getStr()) !== undefined) {
        SourceField.runSyntax(field, input, ReferenceType.DataReadReference, false);
      }
    }
  }
}
