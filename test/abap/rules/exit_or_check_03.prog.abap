REPORT exit_or_check_03.

SELECT kunnr
    INTO CORRESPONDING FIELDS OF <entity>
    FROM kna1.
  CHECK sy-dbcnt > is_paging-skip.
ENDSELECT.