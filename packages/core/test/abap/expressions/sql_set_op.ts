import {expect} from "chai";
import {parse} from "../_utils";
import {Config} from "../../../src/config";
import * as Statements from "../../../src/abap/2_statements/statements";
import {statementToTuple, assertASTEqual} from "./_ast_utils";

function parseSelect(abap: string) {
  const file = parse(abap + ".", Config.getDefault());
  const stmt = file.getStatements()[0];
  expect(stmt.get()).to.be.instanceof(Statements.Select);
  return stmt;
}

describe("Test expression, SQLSetOp", () => {

  it("UNION SELECT: INTO is at top-level Select", () => {
    const stmt = parseSelect("SELECT zcol FROM ztab UNION SELECT zcol FROM ztab2 INTO TABLE @DATA(res)");
    assertASTEqual(
      ["Select", {}, [
        ["Select", {}, [
          ["Identifier", {text: "SELECT"}, []],
          ["SQLFieldList", {}, [
            ["SQLFieldList", {}, [
              ["SQLField", {}, [
                ["SQLFieldName", {}, [
                  ["Identifier", {text: "zcol"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLFrom", {}, [
            ["Identifier", {text: "FROM"}, []],
            ["SQLFromSource", {}, [
              ["DatabaseTable", {}, [
                ["Identifier", {text: "ztab"}, []],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "UNION"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab2"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLIntoTable", {}, [
            ["Identifier", {text: "INTO"}, []],
            ["Identifier", {text: "TABLE"}, []],
            ["SQLTarget", {}, [
              ["WAt", {text: "@"}, []],
              ["Target", {}, [
                ["InlineData", {}, [
                  ["Identifier", {text: "DATA"}, []],
                  ["ParenLeft", {text: "("}, []],
                  ["TargetField", {}, [
                    ["Field", {}, [
                      ["Identifier", {text: "res"}, []],
                    ]],
                  ]],
                  ["ParenRightW", {text: ")"}, []],
                ]],
              ]],
            ]],
          ]],
        ]],
        ["Punctuation", {text: "."}, []],
      ]],
      statementToTuple(stmt),
    );
  });

  it("UNION ALL SELECT: INTO is at top-level Select", () => {
    const stmt = parseSelect("SELECT zcol FROM ztab UNION ALL SELECT zcol FROM ztab2 INTO TABLE @DATA(res)");
    assertASTEqual(
      ["Select", {}, [
        ["Select", {}, [
          ["Identifier", {text: "SELECT"}, []],
          ["SQLFieldList", {}, [
            ["SQLFieldList", {}, [
              ["SQLField", {}, [
                ["SQLFieldName", {}, [
                  ["Identifier", {text: "zcol"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLFrom", {}, [
            ["Identifier", {text: "FROM"}, []],
            ["SQLFromSource", {}, [
              ["DatabaseTable", {}, [
                ["Identifier", {text: "ztab"}, []],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "UNION"}, []],
            ["Identifier", {text: "ALL"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab2"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLIntoTable", {}, [
            ["Identifier", {text: "INTO"}, []],
            ["Identifier", {text: "TABLE"}, []],
            ["SQLTarget", {}, [
              ["WAt", {text: "@"}, []],
              ["Target", {}, [
                ["InlineData", {}, [
                  ["Identifier", {text: "DATA"}, []],
                  ["ParenLeft", {text: "("}, []],
                  ["TargetField", {}, [
                    ["Field", {}, [
                      ["Identifier", {text: "res"}, []],
                    ]],
                  ]],
                  ["ParenRightW", {text: ")"}, []],
                ]],
              ]],
            ]],
          ]],
        ]],
        ["Punctuation", {text: "."}, []],
      ]],
      statementToTuple(stmt),
    );
  });

  it("INTERSECT SELECT: INTO is at top-level Select", () => {
    const stmt = parseSelect("SELECT zcol FROM ztab INTERSECT SELECT zcol FROM ztab2 INTO TABLE @DATA(res)");
    assertASTEqual(
      ["Select", {}, [
        ["Select", {}, [
          ["Identifier", {text: "SELECT"}, []],
          ["SQLFieldList", {}, [
            ["SQLFieldList", {}, [
              ["SQLField", {}, [
                ["SQLFieldName", {}, [
                  ["Identifier", {text: "zcol"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLFrom", {}, [
            ["Identifier", {text: "FROM"}, []],
            ["SQLFromSource", {}, [
              ["DatabaseTable", {}, [
                ["Identifier", {text: "ztab"}, []],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "INTERSECT"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab2"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLIntoTable", {}, [
            ["Identifier", {text: "INTO"}, []],
            ["Identifier", {text: "TABLE"}, []],
            ["SQLTarget", {}, [
              ["WAt", {text: "@"}, []],
              ["Target", {}, [
                ["InlineData", {}, [
                  ["Identifier", {text: "DATA"}, []],
                  ["ParenLeft", {text: "("}, []],
                  ["TargetField", {}, [
                    ["Field", {}, [
                      ["Identifier", {text: "res"}, []],
                    ]],
                  ]],
                  ["ParenRightW", {text: ")"}, []],
                ]],
              ]],
            ]],
          ]],
        ]],
        ["Punctuation", {text: "."}, []],
      ]],
      statementToTuple(stmt),
    );
  });

  it("EXCEPT SELECT: INTO is at top-level Select", () => {
    const stmt = parseSelect("SELECT zcol FROM ztab EXCEPT SELECT zcol FROM ztab2 INTO TABLE @DATA(res)");
    assertASTEqual(
      ["Select", {}, [
        ["Select", {}, [
          ["Identifier", {text: "SELECT"}, []],
          ["SQLFieldList", {}, [
            ["SQLFieldList", {}, [
              ["SQLField", {}, [
                ["SQLFieldName", {}, [
                  ["Identifier", {text: "zcol"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLFrom", {}, [
            ["Identifier", {text: "FROM"}, []],
            ["SQLFromSource", {}, [
              ["DatabaseTable", {}, [
                ["Identifier", {text: "ztab"}, []],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "EXCEPT"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab2"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLIntoTable", {}, [
            ["Identifier", {text: "INTO"}, []],
            ["Identifier", {text: "TABLE"}, []],
            ["SQLTarget", {}, [
              ["WAt", {text: "@"}, []],
              ["Target", {}, [
                ["InlineData", {}, [
                  ["Identifier", {text: "DATA"}, []],
                  ["ParenLeft", {text: "("}, []],
                  ["TargetField", {}, [
                    ["Field", {}, [
                      ["Identifier", {text: "res"}, []],
                    ]],
                  ]],
                  ["ParenRightW", {text: ")"}, []],
                ]],
              ]],
            ]],
          ]],
        ]],
        ["Punctuation", {text: "."}, []],
      ]],
      statementToTuple(stmt),
    );
  });

  it("chained UNION ALL ... UNION: INTO is at top-level Select", () => {
    const stmt = parseSelect("SELECT zcol FROM ztab UNION ALL SELECT zcol FROM ztab UNION SELECT zcol FROM ztab2 INTO TABLE @DATA(res)");
    assertASTEqual(
      ["Select", {}, [
        ["Select", {}, [
          ["Identifier", {text: "SELECT"}, []],
          ["SQLFieldList", {}, [
            ["SQLFieldList", {}, [
              ["SQLField", {}, [
                ["SQLFieldName", {}, [
                  ["Identifier", {text: "zcol"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLFrom", {}, [
            ["Identifier", {text: "FROM"}, []],
            ["SQLFromSource", {}, [
              ["DatabaseTable", {}, [
                ["Identifier", {text: "ztab"}, []],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "UNION"}, []],
            ["Identifier", {text: "ALL"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "UNION"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab2"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLIntoTable", {}, [
            ["Identifier", {text: "INTO"}, []],
            ["Identifier", {text: "TABLE"}, []],
            ["SQLTarget", {}, [
              ["WAt", {text: "@"}, []],
              ["Target", {}, [
                ["InlineData", {}, [
                  ["Identifier", {text: "DATA"}, []],
                  ["ParenLeft", {text: "("}, []],
                  ["TargetField", {}, [
                    ["Field", {}, [
                      ["Identifier", {text: "res"}, []],
                    ]],
                  ]],
                  ["ParenRightW", {text: ")"}, []],
                ]],
              ]],
            ]],
          ]],
        ]],
        ["Punctuation", {text: "."}, []],
      ]],
      statementToTuple(stmt),
    );
  });

  it("A UNION (B UNION C) UNION D: nested group with sibling", () => {
    const stmt = parseSelect("SELECT zcol FROM ztab UNION ( SELECT zcol FROM ztab2 UNION SELECT zcol FROM ztab3 ) UNION SELECT zcol FROM ztab4 INTO TABLE @DATA(res)");
    assertASTEqual(
      ["Select", {}, [
        ["Select", {}, [
          ["Identifier", {text: "SELECT"}, []],
          ["SQLFieldList", {}, [
            ["SQLFieldList", {}, [
              ["SQLField", {}, [
                ["SQLFieldName", {}, [
                  ["Identifier", {text: "zcol"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLFrom", {}, [
            ["Identifier", {text: "FROM"}, []],
            ["SQLFromSource", {}, [
              ["DatabaseTable", {}, [
                ["Identifier", {text: "ztab"}, []],
              ]],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "UNION"}, []],
            ["SQLSetOpGroup", {}, [
              ["WParenLeftW", {text: "("}, []],
              ["Identifier", {text: "SELECT"}, []],
              ["SQLFieldList", {}, [
                ["SQLFieldList", {}, [
                  ["SQLField", {}, [
                    ["SQLFieldName", {}, [
                      ["Identifier", {text: "zcol"}, []],
                    ]],
                  ]],
                ]],
              ]],
              ["SQLFrom", {}, [
                ["Identifier", {text: "FROM"}, []],
                ["SQLFromSource", {}, [
                  ["DatabaseTable", {}, [
                    ["Identifier", {text: "ztab2"}, []],
                  ]],
                ]],
              ]],
              ["SQLSetOp", {}, [
                ["Identifier", {text: "UNION"}, []],
                ["Identifier", {text: "SELECT"}, []],
                ["SQLFieldList", {}, [
                  ["SQLFieldList", {}, [
                    ["SQLField", {}, [
                      ["SQLFieldName", {}, [
                        ["Identifier", {text: "zcol"}, []],
                      ]],
                    ]],
                  ]],
                ]],
                ["SQLFrom", {}, [
                  ["Identifier", {text: "FROM"}, []],
                  ["SQLFromSource", {}, [
                    ["DatabaseTable", {}, [
                      ["Identifier", {text: "ztab3"}, []],
                    ]],
                  ]],
                ]],
              ]],
              ["WParenRightW", {text: ")"}, []],
            ]],
          ]],
          ["SQLSetOp", {}, [
            ["Identifier", {text: "UNION"}, []],
            ["Identifier", {text: "SELECT"}, []],
            ["SQLFieldList", {}, [
              ["SQLFieldList", {}, [
                ["SQLField", {}, [
                  ["SQLFieldName", {}, [
                    ["Identifier", {text: "zcol"}, []],
                  ]],
                ]],
              ]],
            ]],
            ["SQLFrom", {}, [
              ["Identifier", {text: "FROM"}, []],
              ["SQLFromSource", {}, [
                ["DatabaseTable", {}, [
                  ["Identifier", {text: "ztab4"}, []],
                ]],
              ]],
            ]],
          ]],
          ["SQLIntoTable", {}, [
            ["Identifier", {text: "INTO"}, []],
            ["Identifier", {text: "TABLE"}, []],
            ["SQLTarget", {}, [
              ["WAt", {text: "@"}, []],
              ["Target", {}, [
                ["InlineData", {}, [
                  ["Identifier", {text: "DATA"}, []],
                  ["ParenLeft", {text: "("}, []],
                  ["TargetField", {}, [
                    ["Field", {}, [
                      ["Identifier", {text: "res"}, []],
                    ]],
                  ]],
                  ["ParenRightW", {text: ")"}, []],
                ]],
              ]],
            ]],
          ]],
        ]],
        ["Punctuation", {text: "."}, []],
      ]],
      statementToTuple(stmt),
    );
  });

});
