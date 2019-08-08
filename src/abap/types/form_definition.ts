import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Identifier} from "./_identifier";
import {StructureNode} from "../../abap/nodes";

export class FormDefinition extends Identifier {
  private node: StructureNode;

  constructor(node: StructureNode) {
    if (!(node.get() instanceof Structures.Form)) {
      throw new Error("FormDefinition, unexpected node type");
    }
    const name = node.findFirstStatement(Statements.Form)!.findFirstExpression(Expressions.FormName)!.getFirstToken();
    super(name);

    this.node = node;
  }

  public getParameters(): Identifier[] {
    const form = this.node.findFirstStatement(Statements.Form);
    if (form === undefined) { return []; }
    const res: Identifier[] = [];
    for (const param of form.findAllExpressions(Expressions.FormParam)) {
      const token = param.getFirstToken();
      res.push(new Identifier(token));
    }
    return res;
  }

}