import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Identifier} from "./_identifier";
import {StructureNode, StatementNode, ExpressionNode} from "../../abap/nodes";
import {Expression} from "../combi";
import {TypedIdentifier} from "./_typed_identifier";
import {Scope} from "../syntax/_scope";

export class FormDefinition extends Identifier {
  private readonly node: StatementNode;

  constructor(node: StructureNode | StatementNode, filename: string) {
    const st = node instanceof StructureNode ? node.findFirstStatement(Statements.Form)! : node;
    const name = st.findFirstExpression(Expressions.FormName)!.getFirstToken();
    super(name, filename);
    this.node = st;
  }

  public getParameters(): TypedIdentifier[] {
    return this.findParams(this.node);
  }

  public getTablesParameters(): TypedIdentifier[] {
    return this.findType(Expressions.FormTables);
  }

  public getUsingParameters(): TypedIdentifier[] {
    return this.findType(Expressions.FormUsing);
  }

  public getChangingParameters(): TypedIdentifier[] {
    return this.findType(Expressions.FormChanging);
  }

  private findType(type: new () => Expression): TypedIdentifier[] {
    const found = this.node.findFirstExpression(type);
    if (found === undefined) {
      return [];
    }
    return this.findParams(found);
  }

  private findParams(node: ExpressionNode | StatementNode) {
    const res: TypedIdentifier[] = [];
    for (const param of node.findAllExpressions(Expressions.FormParam)) {
      const para = param.get() as Expressions.FormParam;
      res.push(para.runSyntax(param, new Scope(), this.filename));
    }
    return res;
  }

}