import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Identifier} from "./_identifier";
import {StructureNode, StatementNode} from "../../abap/nodes";

export class FormDefinition extends Identifier {
  private readonly node: StatementNode;

  constructor(node: StructureNode | StatementNode, filename: string) {
    const st = node instanceof StructureNode ? node.findFirstStatement(Statements.Form)! : node;
    const name = st.findFirstExpression(Expressions.FormName)!.getFirstToken();
    super(name, filename);
    this.node = st;
  }

  public getParameters(): Identifier[] {
    const res: Identifier[] = [];
    for (const param of this.node.findAllExpressions(Expressions.FormParam)) {
      const token = param.getFirstToken();
      res.push(new Identifier(token, this.filename));
    }
    return res;
  }

}