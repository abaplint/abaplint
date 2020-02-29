import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Identifier} from "./_identifier";
import {StructureNode, StatementNode, ExpressionNode} from "../../abap/nodes";
import {Expression} from "../combi";
import {TypedIdentifier} from "./_typed_identifier";
import {CurrentScope} from "../syntax/_current_scope";

export class FormDefinition extends Identifier {
  private readonly node: StatementNode;

  public constructor(node: StructureNode | StatementNode, filename: string) {
    const st = node instanceof StructureNode ? node.findFirstStatement(Statements.Form)! : node;
    const name = st.findFirstExpression(Expressions.FormName)!.getFirstToken();
    super(name, filename);
    this.node = st;
  }

  public getParameters(scope: CurrentScope): TypedIdentifier[] {
    return this.findParams(this.node, scope);
  }

  public getTablesParameters(scope: CurrentScope): TypedIdentifier[] {
    return this.findType(Expressions.FormTables, scope);
  }

  public getUsingParameters(scope: CurrentScope): TypedIdentifier[] {
    return this.findType(Expressions.FormUsing, scope);
  }

  public getChangingParameters(scope: CurrentScope): TypedIdentifier[] {
    return this.findType(Expressions.FormChanging, scope);
  }

  private findType(type: new () => Expression, scope: CurrentScope): TypedIdentifier[] {
    const found = this.node.findFirstExpression(type);
    if (found === undefined) {
      return [];
    }
    return this.findParams(found, scope);
  }

  private findParams(node: ExpressionNode | StatementNode, scope: CurrentScope) {
    const res: TypedIdentifier[] = [];
    for (const param of node.findAllExpressions(Expressions.FormParam)) {
      const para = param.get() as Expressions.FormParam;
      res.push(para.runSyntax(param, scope, this.filename));
    }
    return res;
  }

}