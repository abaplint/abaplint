import {StructureNode, StatementNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {FlowGraph} from "./flow_graph";
import {Token} from "../1_lexer/tokens/_token";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, (MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE)
//
// Loop branching: LOOP, DO, WHILE, SELECT(loop), WITH, PROVIDE
//
// Branching: IF, CASE, CASE TYPE OF, TRY, ON, CATCH SYSTEM-EXCEPTIONS, AT
//
// Conditional exits: CHECK, ASSERT
//
// Exits: RETURN, EXIT, RAISE(not RESUMABLE), MESSAGE(type E and A?), CONTINUE, REJECT, RESUME, STOP
//
// Not handled? INCLUDE + malplaced macro calls

/////////////////////////////////////

// TODO: handling static exceptions(only static), refactor some logic from UncaughtException to common file
// TODO: RAISE

interface IContext {
  procedureEnd: string;
  loopStart?: string;
  loopEnd?: string;
}

export class StatementFlow {
  private counter = 0;

  public build(stru: StructureNode): FlowGraph[] {
    const ret: FlowGraph[] = [];
    const forms = stru.findAllStructures(Structures.Form);
    for (const f of forms) {
      const formName = "FORM " + f.findFirstExpression(Expressions.FormName)?.concatTokens();
      this.counter = 1;
      const graph = this.traverseBody(this.findBody(f), {procedureEnd: "end#1"});
      graph.setLabel(formName);
      ret.push(graph);
    }
    const methods = stru.findAllStructures(Structures.Method);
    for (const f of methods) {
      const methodName = "METHOD " + f.findFirstExpression(Expressions.MethodName)?.concatTokens();
      this.counter = 1;
      const graph = this.traverseBody(this.findBody(f), {procedureEnd: "end#1"});
      graph.setLabel(methodName);
      ret.push(graph);
    }
    return ret.map(f => f.reduce());
  }

////////////////////

  private findBody(f: StructureNode): readonly (StatementNode | StructureNode)[] {
    return f.findDirectStructure(Structures.Body)?.getChildren() || [];
  }

  private buildName(statement: StatementNode): string {
    let token: Token | undefined = undefined;
    const colon = statement.getColon();
    if (colon === undefined) {
      token = statement.getFirstToken();
    } else {
      for (const t of statement.getTokens()) {
        if (t.getStart().isAfter(colon.getEnd())) {
          token = t;
          break;
        }
      }
    }
    if (token === undefined) {
      return "tokenError";
    }
    return statement.get().constructor.name +
      ":" + token.getRow() +
      "," + token.getCol();
  }

  private traverseBody(children: readonly (StatementNode | StructureNode)[], context: IContext): FlowGraph {
    const graph = new FlowGraph(this.counter++);
    if (children.length === 0) {
      graph.addEdge(graph.getStart(), graph.getEnd());
      return graph;
    }

    let current = graph.getStart();

    for (const c of children) {
      if (c.get() instanceof Structures.Normal) {
        const firstChild = c.getFirstChild(); // "Normal" only has one child
        if (firstChild instanceof StatementNode) {
          const name = this.buildName(firstChild);
          graph.addEdge(current, name);
          current = name;
          if (firstChild.get() instanceof Statements.Check) {
            if (context.loopStart) {
              graph.addEdge(name, context.loopStart);
            } else {
              graph.addEdge(name, context.procedureEnd);
            }
          } else if (firstChild.get() instanceof Statements.Assert) {
            graph.addEdge(name, context.procedureEnd);
          } else if (firstChild.get() instanceof Statements.Continue && context.loopStart) {
            graph.addEdge(name, context.loopStart);
            return graph;
          } else if (firstChild.get() instanceof Statements.Exit) {
            if (context.loopEnd) {
              graph.addEdge(name, context.loopEnd);
            } else {
              graph.addEdge(name, context.procedureEnd);
            }
            return graph;
          } else if (firstChild.get() instanceof Statements.Return) {
            graph.addEdge(name, context.procedureEnd);
            return graph;
          }
        } else if(firstChild instanceof StructureNode) {
          const sub = this.traverseStructure(firstChild, context);
          current = graph.addGraph(current, sub);
        }
      }
    }

    graph.addEdge(current, graph.getEnd());
    return graph;
  }

  private traverseStructure(n: StructureNode | undefined, context: IContext): FlowGraph {
    const graph = new FlowGraph(this.counter++);
    if (n === undefined) {
      return graph;
    }

    let current = graph.getStart();

    const type = n.get();
    if (type instanceof Structures.If) {
      const ifName = this.buildName(n.findDirectStatement(Statements.If)!);
      const sub = this.traverseBody(this.findBody(n), context);
      graph.addEdge(current, ifName);
      graph.addGraph(ifName, sub);
      graph.addEdge(sub.getEnd(), graph.getEnd());
      current = ifName;

      for (const e of n.findDirectStructures(Structures.ElseIf)) {
        const elseifst = e.findDirectStatement(Statements.ElseIf);
        if (elseifst === undefined) {
          continue;
        }

        const elseIfName = this.buildName(elseifst);
        const sub = this.traverseBody(this.findBody(e), context);
        graph.addEdge(current, elseIfName);
        graph.addGraph(elseIfName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
        current = elseIfName;
      }

      const els = n.findDirectStructure(Structures.Else);
      const elsest = els?.findDirectStatement(Statements.Else);
      if (els && elsest) {
        const elseName = this.buildName(elsest);
        const sub = this.traverseBody(this.findBody(els), context);
        graph.addEdge(current, elseName);
        graph.addGraph(elseName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
      } else {
        graph.addEdge(ifName, graph.getEnd());
      }
    } else if (type instanceof Structures.Loop
      || type instanceof Structures.While
      || type instanceof Structures.With
      || type instanceof Structures.Provide
      || type instanceof Structures.Select
      || type instanceof Structures.Do) {
      const loopName = this.buildName(n.getFirstStatement()!);
      const sub = this.traverseBody(this.findBody(n), {...context, loopStart: loopName, loopEnd: graph.getEnd()});

      graph.addEdge(current, loopName);
      graph.addGraph(loopName, sub);
      graph.addEdge(sub.getEnd(), loopName);
      graph.addEdge(loopName, graph.getEnd());
    } else if (type instanceof Structures.Try) {
      const tryName = this.buildName(n.getFirstStatement()!);

      const body = this.traverseBody(this.findBody(n), context);
      graph.addEdge(current, tryName);
      graph.addGraph(tryName, body);
      graph.addEdge(body.getEnd(), graph.getEnd());

      for (const c of n.findDirectStructures(Structures.Catch)) {
        const catchName = this.buildName(c.getFirstStatement()!);
        const catchBody = this.traverseBody(this.findBody(c), context);
// TODO: this does not take exceptions into account
        graph.addEdge(body.getEnd(), catchName);
        graph.addGraph(catchName, catchBody);
        graph.addEdge(catchBody.getEnd(), graph.getEnd());
      }
// TODO, handle CLEANUP
    } else if (type instanceof Structures.Case) {
      const caseName = this.buildName(n.getFirstStatement()!);
      graph.addEdge(current, caseName);
      let othersFound = false;
      for (const w of n.findDirectStructures(Structures.When)) {
        const first = w.getFirstStatement();
        if (first === undefined) {
          continue;
        }
        if (first.get() instanceof Statements.WhenOthers) {
          othersFound = true;
        }
        const firstName = this.buildName(first);

        const sub = this.traverseBody(this.findBody(w), context);
        graph.addEdge(caseName, firstName);
        graph.addGraph(firstName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
      }
      if (othersFound === false) {
        graph.addEdge(caseName, graph.getEnd());
      }
    } else if (type instanceof Structures.CaseType) {
      const caseName = this.buildName(n.getFirstStatement()!);
      graph.addEdge(current, caseName);
      let othersFound = false;
      for (const w of n.findDirectStructures(Structures.WhenType)) {
        const first = w.getFirstStatement();
        if (first === undefined) {
          continue;
        }
        if (first.get() instanceof Statements.WhenOthers) {
          othersFound = true;
        }
        const firstName = this.buildName(first);

        const sub = this.traverseBody(this.findBody(w), context);
        graph.addEdge(caseName, firstName);
        graph.addGraph(firstName, sub);
        graph.addEdge(sub.getEnd(), graph.getEnd());
      }
      if (othersFound === false) {
        graph.addEdge(caseName, graph.getEnd());
      }
    } else {
      console.dir("StatementFlow,todo, " + n.get().constructor.name);
    }

    return graph;
  }

}