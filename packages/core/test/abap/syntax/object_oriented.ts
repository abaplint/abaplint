import {expect} from "chai";
import {ObjectOriented} from "../../../src/abap/5_syntax/_object_oriented";
import {CurrentScope} from "../../../src/abap/5_syntax/_current_scope";
import {IInterfaceDefinition} from "../../../src/abap/types/_interface_definition";
import {IClassDefinition} from "../../../src/abap/types/_class_definition";

function interfaceGraph(links: {[name: string]: string[]}, supers: {[name: string]: string} = {}) {
  const calls = new Map<string, number>();
  const definitions = new Map<string, IInterfaceDefinition>();
  for (const [name, implemented] of Object.entries(links)) {
    definitions.set(name, {
      getName: () => name,
      getSuperClass: () => supers[name],
      getImplementing: () => {
        calls.set(name, (calls.get(name) || 0) + 1);
        return implemented.map(name => ({name, partial: false}));
      },
    } as unknown as IInterfaceDefinition);
  }
  const scope = {
    findInterfaceDefinition: (name: string) => definitions.get(name.toUpperCase()),
    findClassDefinition: (name: string) => definitions.get(name.toUpperCase()),
    isLocalFriend: () => false,
  } as unknown as CurrentScope;
  return {helper: new ObjectOriented(scope), root: definitions.get("ROOT")!, calls};
}

describe("ObjectOriented, recursive interface traversal", () => {
  it("expands a shared interface once in depth-first order on each independent traversal", () => {
    const {helper, root, calls} = interfaceGraph({
      ROOT: ["left", "RIGHT", "LeFt", "missing", "MISSING"],
      LEFT: ["shared", "branch"],
      RIGHT: ["SHARED", "LEAF"],
      SHARED: ["leaf"],
      BRANCH: ["LEAF"],
      LEAF: [],
    });

    for (let traversal = 1; traversal <= 2; traversal++) {
      expect(helper.listInterfacesRecursive(root)).to.deep.equal([
        "LEFT", "SHARED", "LEAF", "BRANCH", "RIGHT", "MISSING",
      ]);
      expect([...calls]).to.deep.equal([
        ["ROOT", traversal],
        ["LEFT", traversal],
        ["SHARED", traversal],
        ["LEAF", traversal],
        ["BRANCH", traversal],
        ["RIGHT", traversal],
      ]);
    }
  });

  it("terminates a cyclic interface graph without expanding an interface twice", () => {
    const {helper, root, calls} = interfaceGraph({
      ROOT: ["a"],
      A: ["b"],
      B: ["c"],
      C: ["A"],
    });

    expect(helper.listInterfacesRecursive(root)).to.deep.equal(["A", "B", "C"]);
    expect([...calls]).to.deep.equal([["ROOT", 1], ["A", 1], ["B", 1], ["C", 1]]);
  });

  it("finds shared and inherited interfaces once in breadth-first order on each traversal", () => {
    const {helper, root, calls} = interfaceGraph({
      ROOT: ["left", "RIGHT", "LeFt", "missing", "MISSING"],
      LEFT: ["shared", "branch"],
      RIGHT: ["SHARED", "LEAF"],
      SHARED: ["leaf"],
      BRANCH: ["LEAF"],
      LEAF: [],
      BASE: ["shared", "inherited"],
      INHERITED: ["LEAF"],
    }, {ROOT: "BASE", BASE: "UNKNOWN"});

    for (let traversal = 1; traversal <= 2; traversal++) {
      expect(helper.findInterfaces(root)).to.deep.equal([
        "left", "RIGHT", "missing", "shared", "branch", "LEAF", "inherited",
      ].map(name => ({name, partial: false})));
      expect([...calls]).to.deep.equal([
        ["ROOT", traversal], ["LEFT", traversal], ["RIGHT", traversal], ["SHARED", traversal],
        ["BRANCH", traversal], ["LEAF", traversal], ["BASE", traversal], ["INHERITED", traversal],
      ]);
    }
  });

  it("bounds shared interface expansion independently of the number of paths", () => {
    const graph: {[name: string]: string[]} = {ROOT: ["I30"]};
    for (let i = 0; i <= 30; i++) {
      graph["I" + i] = i < 2 ? [] : ["I" + (i - 1), "I" + (i - 2)];
    }
    const {helper, root, calls} = interfaceGraph(graph);

    expect(helper.findInterfaces(root).length).to.equal(31);
    expect(calls.size).to.equal(32);
    expect([...calls.values()].every(count => count === 1)).to.equal(true);
  });

  it("terminates interface and superclass cycles", () => {
    const {helper, root, calls} = interfaceGraph({
      ROOT: ["a"], A: ["b"], B: ["A"], BASE: ["B"],
    }, {ROOT: "BASE", BASE: "ROOT"});

    expect(helper.findInterfaces(root).map(i => i.name)).to.deep.equal(["a", "b"]);
    expect([...calls]).to.deep.equal([["ROOT", 1], ["A", 1], ["B", 1], ["BASE", 1]]);
  });

  it("preserves the partial flag of the first occurrence", () => {
    const {helper, root} = interfaceGraph({ROOT: [], A: []});
    root.getImplementing = () => [{name: "a", partial: true}, {name: "A", partial: false}];

    expect(helper.findInterfaces(root)).to.deep.equal([{name: "a", partial: true}]);
  });

  it("retains friendship through inherited nested interfaces and friend subclasses", () => {
    const {helper} = interfaceGraph({
      ROOT: ["LEFT", "RIGHT"], LEFT: ["SHARED"], RIGHT: ["SHARED"],
      SHARED: [], BASE: ["NESTED"], NESTED: ["FRIEND"], FRIEND: [],
    }, {ROOT: "BASE"});
    const owner = (friends: string[]) => ({
      getName: () => "OWNER",
      getFriends: () => friends,
    } as unknown as IClassDefinition);

    expect(helper.hasFriendship(owner(["friend"]), "ROOT")).to.equal(true);
    expect(helper.hasFriendship(owner(["base"]), "ROOT")).to.equal(true);
    expect(helper.hasFriendship(owner(["UNRELATED"]), "ROOT")).to.equal(false);
  });
});
