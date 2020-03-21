import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "COMMUNICATION INIT ID c DESTINATION dest.",
  "COMMUNICATION ALLOCATE ID c.",
  "COMMUNICATION SEND ID c BUFFER connect.",
  "COMMUNICATION DEALLOCATE ID c.",
  "COMMUNICATION SEND ID c BUFFER <output> LENGTH slenx.",
  "COMMUNICATION RECEIVE ID c BUFFER input DATAINFO dinf STATUSINFO sinf RECEIVED rlen.",
  "COMMUNICATION ACCEPT ID c.",
  "COMMUNICATION RECEIVE ID id BUFFER buffer LENGTH length DATAINFO datainfo STATUSINFO statusinfo RECEIVED received.",
];

statementType(tests, "COMMUNICATION", Statements.Communication);