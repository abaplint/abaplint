import {StructureNode, StatementNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {FLOW_EDGE_TYPE, FlowGraph} from "./flow_graph";
import {AbstractToken} from "../1_lexer/tokens/abstract_token";

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
    const structures = stru.findAllStructuresMulti([Structures.Form, Structures.Method, Structures.FunctionModule]);
    for (const s of structures) {
      let name = "";
      if (s.get() instanceof Structures.Form) {
        name = "FORM " + s.findFirstExpression(Expressions.FormName)?.concatTokens();
      } else if (s.get() instanceof Structures.Method) {
        name = "METHOD " + s.findFirstExpression(Expressions.MethodName)?.concatTokens();
      } else if (s.get() instanceof Structures.FunctionModule) {
        name = "FUNCTION " + s.findFirstExpression(Expressions.Field)?.concatTokens();
      } else {
        throw new Error("StatementFlow, unknown structure");
      }
      this.counter = 1;
      const graph = this.traverseBody(this.findBody(s), {procedureEnd: "end#1"});
      graph.setLabel(name);
      ret.push(graph);
    }
    return ret.map(f => f.reduce());
  }

////////////////////

  private findBody(f: StructureNode): readonly (StatementNode | StructureNode)[] {
    return f.findDirectStructure(Structures.Body)?.getChildren() || [];
  }

  private buildName(statement: StatementNode): string {
    let token: AbstractToken | undefined = undefined;
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
      graph.addEdge(graph.getStart(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      return graph;
    }

    let current = graph.getStart();

    for (const c of children) {
      if (c.get() instanceof Structures.Normal) {
        const firstChild = c.getFirstChild(); // "Normal" only has one child
        if (firstChild instanceof StatementNode) {
          const name = this.buildName(firstChild);
          graph.addEdge(current, name, FLOW_EDGE_TYPE.undefined);
          current = name;
          if (firstChild.get() instanceof Statements.Check) {
            if (context.loopStart) {
              graph.addEdge(name, context.loopStart, FLOW_EDGE_TYPE.undefined);
            } else {
              graph.addEdge(name, context.procedureEnd, FLOW_EDGE_TYPE.undefined);
            }
          } else if (firstChild.get() instanceof Statements.Assert) {
            graph.addEdge(name, context.procedureEnd, FLOW_EDGE_TYPE.undefined);
          } else if (firstChild.get() instanceof Statements.Continue && context.loopStart) {
            graph.addEdge(name, context.loopStart, FLOW_EDGE_TYPE.undefined);
            return graph;
          } else if (firstChild.get() instanceof Statements.Exit) {
            if (context.loopEnd) {
              graph.addEdge(name, context.loopEnd, FLOW_EDGE_TYPE.undefined);
            } else {
              graph.addEdge(name, context.procedureEnd, FLOW_EDGE_TYPE.undefined);
            }
            return graph;
          } else if (firstChild.get() instanceof Statements.Return) {
            graph.addEdge(name, context.procedureEnd, FLOW_EDGE_TYPE.undefined);
            return graph;
          }
        } else if(firstChild instanceof StructureNode) {
          const sub = this.traverseStructure(firstChild, context);
          current = graph.addGraph(current, sub, FLOW_EDGE_TYPE.undefined);
        }
      }
    }

    graph.addEdge(current, graph.getEnd(), FLOW_EDGE_TYPE.undefined);
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
      graph.addEdge(current, ifName, FLOW_EDGE_TYPE.undefined);
      graph.addGraph(ifName, sub, FLOW_EDGE_TYPE.undefined);
      graph.addEdge(sub.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      current = ifName;

      for (const e of n.findDirectStructures(Structures.ElseIf)) {
        const elseifst = e.findDirectStatement(Statements.ElseIf);
        if (elseifst === undefined) {
          continue;
        }

        const elseIfName = this.buildName(elseifst);
        const sub = this.traverseBody(this.findBody(e), context);
        graph.addEdge(current, elseIfName, FLOW_EDGE_TYPE.undefined);
        graph.addGraph(elseIfName, sub, FLOW_EDGE_TYPE.undefined);
        graph.addEdge(sub.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
        current = elseIfName;
      }

      const els = n.findDirectStructure(Structures.Else);
      const elsest = els?.findDirectStatement(Statements.Else);
      if (els && elsest) {
        const elseName = this.buildName(elsest);
        const sub = this.traverseBody(this.findBody(els), context);
        graph.addEdge(current, elseName, FLOW_EDGE_TYPE.undefined);
        graph.addGraph(elseName, sub, FLOW_EDGE_TYPE.undefined);
        graph.addEdge(sub.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      } else {
        graph.addEdge(ifName, graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      }
    } else if (type instanceof Structures.Loop
      || type instanceof Structures.While
      || type instanceof Structures.With
      || type instanceof Structures.Provide
      || type instanceof Structures.Select
      || type instanceof Structures.LoopAtScreen
      || type instanceof Structures.Do) {
      const loopName = this.buildName(n.getFirstStatement()!);
      const sub = this.traverseBody(this.findBody(n), {...context, loopStart: loopName, loopEnd: graph.getEnd()});

      graph.addEdge(current, loopName, FLOW_EDGE_TYPE.undefined);
      graph.addGraph(loopName, sub, FLOW_EDGE_TYPE.undefined);
      graph.addEdge(sub.getEnd(), loopName, FLOW_EDGE_TYPE.undefined);
      graph.addEdge(loopName, graph.getEnd(), FLOW_EDGE_TYPE.undefined);
    } else if (type instanceof Structures.Data
        || type instanceof Structures.Types) {
// these doesnt affect control flow, so just take the first statement
      const statement = n.getFirstStatement()!;
      const name = this.buildName(statement);
      graph.addEdge(current, name, FLOW_EDGE_TYPE.undefined);
      graph.addEdge(name, graph.getEnd(), FLOW_EDGE_TYPE.undefined);

    } else if (type instanceof Structures.AtFirst
        || type instanceof Structures.AtLast
        || type instanceof Structures.At
        || type instanceof Structures.OnChange) {
      const name = this.buildName(n.getFirstStatement()!);

      const body = this.traverseBody(this.findBody(n), context);
      graph.addEdge(current, name, FLOW_EDGE_TYPE.undefined);
      graph.addGraph(name, body, FLOW_EDGE_TYPE.undefined);
      graph.addEdge(body.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      graph.addEdge(current, graph.getEnd(), FLOW_EDGE_TYPE.undefined);

    } else if (type instanceof Structures.Try) {
      const tryName = this.buildName(n.getFirstStatement()!);

      const body = this.traverseBody(this.findBody(n), context);
      graph.addEdge(current, tryName, FLOW_EDGE_TYPE.undefined);
      graph.addGraph(tryName, body, FLOW_EDGE_TYPE.undefined);
      graph.addEdge(body.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);

      for (const c of n.findDirectStructures(Structures.Catch)) {
        const catchName = this.buildName(c.getFirstStatement()!);
        const catchBody = this.traverseBody(this.findBody(c), context);
// TODO: this does not take exceptions into account
        graph.addEdge(body.getEnd(), catchName, FLOW_EDGE_TYPE.undefined);
        graph.addGraph(catchName, catchBody, FLOW_EDGE_TYPE.undefined);
        graph.addEdge(catchBody.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      }
// TODO, handle CLEANUP
    } else if (type instanceof Structures.Case) {
      const caseName = this.buildName(n.getFirstStatement()!);
      graph.addEdge(current, caseName, FLOW_EDGE_TYPE.undefined);
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
        graph.addEdge(caseName, firstName, FLOW_EDGE_TYPE.undefined);
        graph.addGraph(firstName, sub, FLOW_EDGE_TYPE.undefined);
        graph.addEdge(sub.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      }
      if (othersFound === false) {
        graph.addEdge(caseName, graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      }
    } else if (type instanceof Structures.CaseType) {
      const caseName = this.buildName(n.getFirstStatement()!);
      graph.addEdge(current, caseName, FLOW_EDGE_TYPE.undefined);
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
        graph.addEdge(caseName, firstName, FLOW_EDGE_TYPE.undefined);
        graph.addGraph(firstName, sub, FLOW_EDGE_TYPE.undefined);
        graph.addEdge(sub.getEnd(), graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      }
      if (othersFound === false) {
        graph.addEdge(caseName, graph.getEnd(), FLOW_EDGE_TYPE.undefined);
      }
    } else {
      console.dir("StatementFlow,todo, " + n.get().constructor.name);
    }

    return graph;
  }

}