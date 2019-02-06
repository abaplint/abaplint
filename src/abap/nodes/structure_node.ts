import {BasicNode} from "./_basic_node";
import {Structure} from "../structures/_structure";
import {StatementNode} from "./statement_node";
import {Statement} from "../statements/_statement";
import {Token} from "../tokens/_token";
import {Expression} from "../combi";
import {ExpressionNode} from "./expression_node";

export class StructureNode extends BasicNode {
  private structure: Structure;

  public constructor(structure: Structure) {
    super();
    this.structure = structure;
  }

  public get() {
    return this.structure;
  }

  public findParent(node: StatementNode): StructureNode | undefined {
    for (const child of this.getChildren()) {
      if (child === node) {
        return this;
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        const res = child.findParent(node);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findParent, unexpected type");
      }
    }
    return undefined;
  }

  public findDirectStatements(type: new () => Statement): StatementNode[] {
    const ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode && child.get() instanceof type) {
        ret.push(child);
      }
    }
    return ret;
  }

  public findFirstStatement(type: new () => Statement): StatementNode | undefined {
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StatementNode;
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        const res = child.findFirstStatement(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstStatement, unexpected type");
      }
    }
    return undefined;
  }

  public findFirstExpression(type: new () => Expression): ExpressionNode | undefined {
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as ExpressionNode;
      } else if (child instanceof StatementNode) {
        const res = child.findFirstExpression(type);
        if (res) {
          return res;
        }
      } else if (child instanceof StructureNode) {
        const res = child.findFirstExpression(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstStatement, unexpected type");
      }
    }
    return undefined;
  }

  public getFirstToken(): Token {
    const child = this.getFirstChild();

    if (child instanceof StatementNode) {
      return child.getFirstToken();
    } else if (child instanceof StructureNode) {
      return child.getFirstToken();
    }

    throw new Error("getFirstToken, unexpected type");
  }

  public getLastToken(): Token {
    const child = this.getLastChild();

    if (child instanceof StatementNode) {
      return child.getLastToken();
    } else if (child instanceof StructureNode) {
      return child.getLastToken();
    }

    throw new Error("getLastToken, unexpected type");
  }

  public findAllExpressions(type: new () => Expression): ExpressionNode[] {
    let ret: ExpressionNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        ret = ret.concat(child.findAllExpressions(type));
      } else if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllExpressions(type));
      } else {
        throw new Error("findAllExpressions, unexpected type");
      }
    }
    return ret;
  }

  public findAllStatements(type: new () => Statement): StatementNode[] {
    let ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        ret.push(child as StatementNode);
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllStatements(type));
      } else {
        throw new Error("findFirstStructure, unexpected type");
      }
    }
    return ret;
  }

  public findAllStatementNodes(): StatementNode[] {
    let ret: StatementNode[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof StatementNode) {
        ret.push(child as StatementNode);
      } else if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllStatementNodes());
      } else {
        throw new Error("findAllStatementNodes, unexpected type");
      }
    }
    return ret;
  }

  public findAllStructures(type: new () => Structure): StructureNode[] {
    let ret: StructureNode[] = [];
    if (this.get() instanceof type) {
      return [this];
    }
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        ret.push(child as StructureNode);
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        ret = ret.concat(child.findAllStructures(type));
      } else {
        throw new Error("findAllStructures, unexpected type");
      }
    }
    return ret;
  }

  public findFirstStructure(type: new () => Structure): StructureNode | undefined {
    if (this.get() instanceof type) {
      return this;
    }
    for (const child of this.getChildren()) {
      if (child.get() instanceof type) {
        return child as StructureNode;
      } else if (child instanceof StatementNode) {
        continue;
      } else if (child instanceof StructureNode) {
        const res = child.findFirstStructure(type);
        if (res) {
          return res;
        }
      } else {
        throw new Error("findFirstStructure, unexpected type");
      }
    }
    return undefined;
  }

}