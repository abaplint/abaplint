import {Identifier} from "../4_file_information/_identifier";
import {IEventDefinition} from "./_event_definition";
import * as Expressions from "../2_statements/expressions";
import {Visibility} from "../4_file_information/visibility";
import {CurrentScope} from "../5_syntax/_current_scope";
import {StatementNode} from "../nodes/statement_node";
import {Events} from "../2_statements/statements/events";
import {TypedIdentifier} from "./_typed_identifier";
import {MethodParam as MethodParamExpression} from "../2_statements/expressions";
import {MethodParam} from "../5_syntax/expressions/method_param";

export class EventDefinition extends Identifier implements IEventDefinition {
  private readonly parameters: TypedIdentifier[];

  public constructor(node: StatementNode, _visibility: Visibility, filename: string, scope: CurrentScope) {
    if (!(node.get() instanceof Events)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const found = node.findFirstExpression(Expressions.EventName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken(), filename);

    this.parameters = [];
    this.parse(node, filename, scope);
  }

  public getParameters(): readonly TypedIdentifier[] {
    return this.parameters;
  }

///////////////

  private parse(node: StatementNode, filename: string, scope: CurrentScope) {
    for (const e of node.findAllExpressions(MethodParamExpression)) {
      this.parameters.push(new MethodParam().runSyntax(e, scope, filename, []));
    }
  }

}