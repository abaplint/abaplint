import {CurrentScope} from "./_current_scope";
import {StatementNode} from "../nodes";
import * as Expressions from "../2_statements/expressions";

export class Inline {
  private readonly scope: CurrentScope;

  public constructor(scope: CurrentScope) {
    this.scope = scope;
  }

  // todo
  public addReadWriteReferences(node: StatementNode, filename: string) {
    const targets = node.findAllExpressions(Expressions.TargetField).concat(node.findAllExpressions(Expressions.TargetFieldSymbol));
    for (const target of targets) {
      const token = target.getFirstToken();
      const resolved = this.scope.findVariable(token.getStr());
      if (resolved !== undefined) {
// todo, refactor "add write" should be done after or inside scope lookups
        this.scope.addWrite(token, resolved, filename);
      }
    }

    const sources = node.findAllExpressions(Expressions.SourceField).concat(node.findAllExpressions(Expressions.SourceFieldSymbol));
    for (const source of sources) {
      const token = source.getFirstToken();
      const resolved = this.scope.findVariable(token.getStr());
      if (resolved !== undefined) {
// todo, refactor "add reads" should be done after or inside scope lookups
        this.scope.addRead(token, resolved, filename);
      }
    }
  }

}