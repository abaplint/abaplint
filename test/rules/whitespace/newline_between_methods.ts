import {NewlineBetweenMethods} from "../../../src/rules/whitespace/newline_between_methods";
import {testRule} from "../_utils";

const tests = [
  {
    abap: `
    CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.


      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
    ENDCLASS.`,
    cnt: 1,
  },
  {
    abap: `
    CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.
      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
    ENDCLASS.`,
    cnt: 1,
  },
  {
    abap: `
    CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.

      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
    ENDCLASS.`,
    cnt: 0,
  },
  {
    abap: `
    CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.

      METHOD abc.
        WRITE '1'.
      ENDMETHOD.

    ENDCLASS.`,
    cnt: 0,
  },
  {
    abap: `
    CLASS lcl_foo DEFINITION CREATE PUBLIC.
    PUBLIC SECTION.
      METHODS foo.
      METHODS abc.
      METHODS bar.
    ENDCLASS.
    CLASS lcl_foo IMPLEMENTATION.
      METHOD foo.
        WRITE '4'.
      ENDMETHOD.


      METHOD abc.
        WRITE '1'.
      ENDMETHOD.
      METHOD bar.
        WRITE '2'.
      ENDMETHOD.
    ENDCLASS.`,
    cnt: 2,
  },
];

testRule(tests, NewlineBetweenMethods);
