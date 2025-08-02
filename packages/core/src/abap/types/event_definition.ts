import {Identifier} from "../4_file_information/_identifier";
import {IEventDefinition} from "./_event_definition";
import * as Expressions from "../2_statements/expressions";
import {Visibility} from "../4_file_information/visibility";
import {StatementNode} from "../nodes/statement_node";
import {Events} from "../2_statements/statements/events";
import {TypedIdentifier} from "./_typed_identifier";
import {MethodParam as MethodParamExpression} from "../2_statements/expressions";
import {MethodParam} from "../5_syntax/expressions/method_param";
import {SyntaxInput} from "../5_syntax/_syntax_input";

export class EventDefinition extends Identifier implements IEventDefinition {
  private readonly parameters: TypedIdentifier[];
  private readonly is_static: boolean;

  public constructor(node: StatementNode, _visibility: Visibility, input: SyntaxInput) {
    if (!(node.get() instanceof Events)) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    const found = node.findFirstExpression(Expressions.EventName);
    if (found === undefined) {
      throw new Error("MethodDefinition, expected MethodDef as part of input node");
    }
    super(found.getFirstToken(), input.filename);

    this.parameters = [];
    this.parse(node, input);

    this.is_static = node.getFirstToken().getStr().toUpperCase() === "CLASS";
  }

  public getParameters(): readonly TypedIdentifier[] {
    return this.parameters;
  }

  public isStatic(): boolean {
    return this.is_static;
  }

///////////////

  private parse(node: StatementNode, input: SyntaxInput) {
    for (const e of node.findAllExpressions(MethodParamExpression)) {
      this.parameters.push(MethodParam.runSyntax(e, input, []));
    }
  }

}