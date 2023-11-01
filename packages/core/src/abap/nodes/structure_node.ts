import {AbstractNode} from "./_abstract_node";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";
import {IStatement} from "../2_statements/statements/_statement";
import {IStructure} from "../3_structures/structures/_structure";
import {IStatementRunnable} from "../2_statements/statement_runnable";
import {StatementNode} from "./statement_node";
import {ExpressionNode} from "./expression_node";

export class StructureNode extends AbstractNode<StructureNode | StatementNode> {
  private readonly structure: IStructure;

  public constructor(structure: IStructure) {
    super();
    this.structure = structure;
  }

  public get() {
    return this.structure;
  }

  // todo, remove this method, the logic should never go up in the tree
  public findParent(node: StatementNode): StructureNode | undefined {
    for (const child of this.getChildren()) {
      if (child === node) {
        return this;
      } else if (child instanceof StatementNode) {
        continue;
      } else {
        const res = child.findParent(node);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  public concatTokens(): string {
    let concat = "";
    for (const child of this.getChildren()) {
      concat = concat + child.concatTokens();
    }
    return concat;
  }

  public findDirectStatement(type: new () => IStatement): StatementNode | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode && child.get() instanceof type) {
        return child;
      }
    }
    return undefined;
  }

  public findDirectStatements(type: new () => IStatement): StatementNode[] {
    const ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findDirectStructures(type: new () => IStructure): StructureNode[] {
    const ret: StructureNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StructureNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findFirstStatement(type: new () => IStatement): StatementNode | undefined {
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StatementNode;
      } else if (child instanceof StatementNode) {
        continue;
      } else {
        const res = child.findFirstStatement(type);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

  public findFirstExpression(type: new () => IStatementRunnable): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      const res = child.findFirstExpression(type);
      if (res) {
        return res;
      }
    }
    return undefined;
  }

  public getFirstStatement(): StatementNode | undefined {
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        return child;
      }
      return child.getFirstStatement();
    }
    return undefined;
  }

  public getFirstToken(): AbstractToken {
    const child = this.getFirstChild();

    if (child !== undefined) {
      return child.getFirstToken();
    }

    throw new Error("StructureNode, getFirstToken, unexpected type");
  }

  public getLastToken(): AbstractToken {
    const child = this.getLastChild();

    if (child !== undefined) {
      return child.getLastToken();
    }

    throw new Error("StructureNode, getLastToken, unexpected type");
  }

  public findAllExpressions(type: new () => IStatementRunnable): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      ret.push(...child.findAllExpressions(type));
    }
    return ret;
  }

  public findAllExpressionsRecursive(type: new () => IStatementRunnable): ExpressionNode[] {
    const ret: ExpressionNode[] = [];

    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        ret.push(...child.findAllExpressionsRecursive(type));
      } else {
        ret.push(...child.findAllExpressionsRecursive(type));
      }
    }
    return ret;
  }

  public findAllExpressionsMulti(type: (new () => IStatementRunnable)[]): ExpressionNode[] {
    const ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      ret.push(...child.findAllExpressionsMulti(type));
    }
    return ret;
  }

  public findAllStatements(type: new () => IStatement): StatementNode[] {
    const ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StructureNode) {
        ret.push(...child.findAllStatements(type));
      } else if (child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findAllStatementNodes(): StatementNode[] {
    const ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        ret.push(child);
      } else {
        ret.push(...child.findAllStatementNodes());
      }
    }
    return ret;
  }

  public findAllStructuresRecursive(type: new () => IStructure): StructureNode[] {
    const ret: StructureNode[] = [];

    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      }
      ret.push(...child.findAllStructuresRecursive(type));
    }
    return ret;
  }

  public findAllStructuresMulti(type: (new () => IStructure)[]): StructureNode[] {
    const ret: StructureNode[] = [];
    for (const t of type) {
      if (this.get() instanceof t) {
        return [this];
      }
    }
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        continue;
      }

      let found = false;
      for (const t of type) {
        if (this.get() instanceof t) {
          ret.push(child);
          found = true;
        }
      }
      if (found === false) {
        ret.push(...child.findAllStructuresMulti(type));
      }
    }
    return ret;
  }

  public findAllStructures(type: new () => IStructure): StructureNode[] {
    const ret: StructureNode[] = [];
    if (this.get() instanceof type) {
      return [this];
    }
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        continue;
      } else if (child.get() instanceof type) {
        ret.push(child);
      } else {
        ret.push(...child.findAllStructures(type));
      }
    }
    return ret;
  }

  public findDirectStructure(type: new () => IStructure): StructureNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StructureNode;
      }
    }
    return undefined;
  }

  public findFirstStructure(type: new () => IStructure): StructureNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        continue;
      } else if (child.get() instanceof type) {
        return child;
      } else {
        const res = child.findFirstStructure(type);
        if (res) {
          return res;
        }
      }
    }
    return undefined;
  }

}