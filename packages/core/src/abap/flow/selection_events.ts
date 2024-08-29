import * as Statements from "../2_statements/statements";

export const SELECTION_EVENTS = [
  Statements.StartOfSelection,
  Statements.AtSelectionScreen,
  Statements.AtLineSelection,
  Statements.AtUserCommand,
  Statements.EndOfSelection,
  Statements.Initialization,
  Statements.TopOfPage,
  Statements.EndOfPage,
];