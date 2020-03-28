import {testRule} from "./_utils";
import {PrefixIsCurrentClass, PrefixIsCurrentClassConf} from "../../src/rules";

const defaultConfigTests = [

  {
    // static reference to own class type
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                TYPES: BEGIN OF ty_foo,
                         foo TYPE i,
                       END OF ty_foo.
                METHODS foobar RETURNING VALUE(rv_string) TYPE zcl_foo=>ty_foo.
            ENDCLASS.`, cnt: 1,
  },
  {
    // static reference to own class type without class name
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                TYPES: BEGIN OF ty_foo,
                         foo TYPE i,
                       END OF ty_foo.
                METHODS foobar RETURNING VALUE(rv_string) TYPE ty_foo.
              PROTECTED SECTION.
                DATA mv_foo TYPE i.
            ENDCLASS.`, cnt: 0,
  },
  {
    // static reference to own class in string and comment
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS foobar.
            ENDCLASS.
            CLASS zcl_foo IMPLEMENTATION.
              METHOD foobar.
                DATA(_string) = |zcl_foo=>foo( )|.
                WRITE: 'zcl_foo=>foo( )'.
                WRITE: 'foo'. " zcl_foo=>foo( )
              ENDMETHOD.
            ENDCLASS.`, cnt: 0,
  },
  {
    // static reference to own class in string template source
    abap: ` CLASS lcl_moo DEFINITION.
            PUBLIC SECTION.
              METHODS abc.
            PROTECTED SECTION.
              CLASS-DATA mv_abc TYPE i.
          ENDCLASS.
          CLASS lcl_moo IMPLEMENTATION.
            METHOD abc.
              WRITE: | { lcl_moo=>mv_abc } |.
              WRITE: | { mv_abc } |.
              WRITE: |lcl_moo=>mv_abc{ 2 }lcl_moo=>mv_abc{ 3 }lcl_moo=>mv_abc{ 4 }|.
            ENDMETHOD.
          ENDCLASS.`, cnt: 1,
  },
  {
    // static reference to own class class-method
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS foobar.
                CLASS-METHODS moobar.
              PROTECTED SECTION.
                DATA mv_foo TYPE i.
            ENDCLASS.
            CLASS zcl_foo IMPLEMENTATION.
              METHOD foobar.
                zcl_foo=>moobar( ).
              ENDMETHOD.

              METHOD moobar.
                WRITE: '1'.
              ENDMETHOD.
            ENDCLASS.`, cnt: 1,
  },
  {
    // me-> reference instance method
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS foobar.
                METHODS moobar.
              PROTECTED SECTION.
                DATA mv_foo TYPE i.
            ENDCLASS.
            CLASS zcl_foo IMPLEMENTATION.
              METHOD foobar.
                me->moobar( ).
              ENDMETHOD.

              METHOD moobar.
                WRITE: '1'.
              ENDMETHOD.
            ENDCLASS.`, cnt: 1,
  },
  {
    // me-> reference instance attribute
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS foobar.
              PROTECTED SECTION.
                DATA mv_foo TYPE i.
            ENDCLASS.
            CLASS zcl_foo IMPLEMENTATION.
              METHOD foobar.
                me->mv_foo = 1.
              ENDMETHOD.
            ENDCLASS.`, cnt: 0,
  },
];

testRule(defaultConfigTests, PrefixIsCurrentClass);

const meReferenceAllowedTests = [
  {
    // me-> reference instance method
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS foobar.
                METHODS moobar.
              PROTECTED SECTION.
                DATA mv_foo TYPE i.
            ENDCLASS.
            CLASS zcl_foo IMPLEMENTATION.
              METHOD foobar.
                me->moobar( ).
              ENDMETHOD.

              METHOD moobar.
                WRITE: '1'.
              ENDMETHOD.
            ENDCLASS.`, cnt: 0,
  },
  {
    // me-> reference instance attribute
    abap: ` CLASS zcl_foo DEFINITION PUBLIC.
              PUBLIC SECTION.
                METHODS foobar.
              PROTECTED SECTION.
                DATA mv_foo TYPE i.
            ENDCLASS.
            CLASS zcl_foo IMPLEMENTATION.
              METHOD foobar.
                me->mv_foo = 1.
              ENDMETHOD.
            ENDCLASS.`, cnt: 0,
  },
];

const confMeAllowed = new PrefixIsCurrentClassConf();
confMeAllowed.omitMeInstanceCalls = false;

testRule(meReferenceAllowedTests, PrefixIsCurrentClass, confMeAllowed);