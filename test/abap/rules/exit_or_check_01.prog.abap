REPORT exit_or_check_01.

DATA: lt_usr02 TYPE TABLE OF usr02,
      ls_usr02 LIKE LINE OF lt_usr02.

LOOP AT lt_usr02 INTO ls_usr02.
  EXIT.
ENDLOOP.