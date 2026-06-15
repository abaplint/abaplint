/* eslint-disable max-len */
import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `with +cte1 as ( select 1 as col1 from ztab1 where col26 = @sy-mandt ),
         +cte2( col2 ) as ( select 1 from +cte1 union all
                              select 2 from +cte1 union all
                              select 3 from +cte1 union all
                              select 4 from +cte1 union all
                              select 5 from +cte1 union all
                              select 6 from +cte1 union all
                              select 7 from +cte1 union all
                              select 8 from +cte1 ),
        +cte3( col3, col4 ) as ( select t1~col2, t2~col2 from +cte2 as t1 cross join +cte2 as t2 ),
        +cte4( col5 ) as ( select @lv_1 from +cte1 union all
                                   select @lv_2 from +cte1 union all
                                   select @lv_3 from +cte1 union all
                                   select @lv_4 from +cte1 union all
                                   select @lv_5 from +cte1 union all
                                   select @lv_6 from +cte1 ),
        +cte5( col6 ) as ( select @lv_7 from +cte1 union all
                              select @lv_8 from +cte1 ),
        +cte6( col6, col5, col7, col8, col9, col10, col11, col12, col13, col14, col15, col16, col17, col18 ) as ( select from +cte5 as t3
         cross join +cte4 as t4
         cross join +cte3 as t5
         inner join +cte3 as t6 on
         case col5
           when @lv_1 then
              case when ( abs( t5~col3 - t6~col3 ) <= 1 and
                          abs( t5~col4 - t6~col4 ) <= 1 and not
                          ( t5~col3 = t6~col3 and t5~col4 = t6~col4 ) ) or
                        ( col6 = @lv_7 and t5~col3 = 5
                          and t5~col4 = 1 and t6~col3 = 7 and t6~col4 = 1 ) or
                        ( col6 = @lv_7 and t5~col3 = 5
                          and t5~col4 = 1 and t6~col3 = 3 and t6~col4 = 1 ) or
                        ( col6 = @lv_8 and t5~col3 = 5
                          and t5~col4 = 8 and t6~col3 = 7 and t6~col4 = 1 ) or
                        ( col6 = @lv_8 and t5~col3 = 5
                          and t5~col4 = 8 and t6~col3 = 3 and t6~col4 = 1 )
              then 1 else 0 end
           when @lv_2 then
              case when ( abs( t6~col4 - t5~col4 ) = abs( t6~col3 - t5~col3 ) or
                          t6~col3 = t5~col3 or
                          t6~col4 = t5~col4 ) and not
                        ( t5~col3 = t6~col3 and t5~col4 = t6~col4 )
              then 1 else 0 end
           when @lv_3 then
              case when ( t6~col3 = t5~col3 or
                          t6~col4 = t5~col4 ) and not
                        ( t5~col3 = t6~col3 and t5~col4 = t6~col4 )
              then 1 else 0 end
           when @lv_4 then
              case when ( abs( t6~col3 - t5~col3 ) = 1 and
                          abs( t6~col4 - t5~col4 ) = 2 ) or
                        ( abs( t6~col3 - t5~col3 ) = 2 and
                          abs( t6~col4 - t5~col4 ) = 1 )
              then 1 else 2 end
           when @lv_5 then
              case when abs( t6~col4 - t5~col4 ) = abs( t6~col3 - t5~col3 ) and not
                       ( t5~col3 = t6~col3 and t5~col4 = t6~col4 )
              then 1 else 0 end
           when @lv_6 then
              case when ( col6 = @lv_7 and
                          t6~col4 = t5~col4 + 1 and
                          abs( t6~col3 - t5~col3 ) <= 1 and
                          t5~col4 > 1
                        ) or
                        ( col6 = @lv_7 and
                          t6~col4 = 4 and
                          t5~col4 = 2 and
                          t6~col3 = t5~col3 ) or
                        ( col6 = @lv_8 and
                          t6~col4 = t5~col4 - 1 and
                          abs( t6~col3 - t5~col3 ) <= 1 and
                          t5~col4 < 8 ) or
                        ( col6 = @lv_8 and
                          t6~col4 = 5 and
                          t5~col4 = 7 and
                          t6~col3 = t5~col3 )
              then 1 else 0 end
         end = 1
       fields col6, col5, t5~col3, t5~col4, t6~col3, t6~col4,
         coalesce(
           case col5
             when @lv_1 then case when ( col6 = @lv_7 and t5~col3 = 5
                             and t5~col4 = 1 and t6~col3 = 7 and t6~col4 = 1 ) or
                            ( col6 = @lv_7 and t5~col3 = 5
                             and t5~col4 = 1 and t6~col3 = 3 and t6~col4 = 1 ) or
                            ( col6 = @lv_8 and t5~col3 = 5
                             and t5~col4 = 8 and t6~col3 = 7 and t6~col4 = 1 ) or
                            ( col6 = @lv_8 and t5~col3 = 5
                              and t5~col4 = 8 and t6~col3 = 3 and t6~col4 = 1 )
                         then @lv_9
                         end
             when @lv_6 then case when abs( t6~col3 - t5~col3 ) = 1
                                                                  then @lv_10
                                                                  else @lv_11
                                                           end
           end
         , @lv_12 ),
         coalesce(
           case col5
             when @lv_1 then case when abs( t6~col3 - t5~col3 ) > 1
                                                             then col6
                                                           end
             when @lv_6 then
               case when abs( t6~col3 - t5~col3 ) = 1 and (
                         col6 = @lv_7 and
                         t5~col4 = 5 and
                         t6~col4 = 6 )
                    then @lv_8
                    when abs( t6~col3 - t5~col3 ) = 1 and (
                      col6 = @lv_8 and
                      t5~col4 = 4 and
                      t6~col4 = 3 )
                    then @lv_7
               end
            end
            , @lv_13 ),
         coalesce(
           case col5
             when @lv_1 then case when abs( t6~col3 - t5~col3 ) > 1
                                                             then @lv_3
                                                           end
             when @lv_6 then
               case when abs( t6~col3 - t5~col3 ) = 1 and (
                         col6 = @lv_7 and
                         t5~col4 = 5 and
                         t6~col4 = 6 )
                    then @lv_6
                    when abs( t6~col3 - t5~col3 ) = 1 and (
                      col6 = @lv_8 and
                      t5~col4 = 4 and
                      t6~col4 = 3 )
                    then @lv_6
               end
            end
            , @lv_14 ),
         coalesce(
           case col5
             when @lv_1 then
               case when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 7 and t6~col4 = 1 )
                      then cast( 8 as int1 )
                    when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 3 and t6~col4 = 1 )
                      then cast( 1 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 7 and t6~col4 = 1 )
                       then cast( 8 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 3 and t6~col4 = 1 )
                       then cast( 1 as int1 )
              end
             when @lv_6 then
               case when abs( t6~col3 - t5~col3 ) = 1 and (
                         col6 = @lv_7 and
                         t5~col4 = 5 and
                         t6~col4 = 6 )
                    then t6~col3
                    when abs( t6~col3 - t5~col3 ) = 1 and (
                      col6 = @lv_8 and
                      t5~col4 = 4 and
                      t6~col4 = 3 )
                    then t6~col3
               end
            end
            , @lv_15 ),
         coalesce(
           case col5
             when @lv_1 then
               case when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 7 and t6~col4 = 1 )
                      then cast( 1 as int1 )
                    when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 3 and t6~col4 = 1 )
                      then cast( 1 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 7 and t6~col4 = 1 )
                       then cast( 8 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 3 and t6~col4 = 1 )
                       then cast( 8 as int1 )
              end
             when @lv_6 then
               case when abs( t6~col3 - t5~col3 ) = 1 and (
                         col6 = @lv_7 and
                         t5~col4 = 5 and
                         t6~col4 = 6 )
                    then cast( 7 as int1 )
                    when abs( t6~col3 - t5~col3 ) = 1 and (
                      col6 = @lv_8 and
                      t5~col4 = 4 and
                      t6~col4 = 3 )
                    then cast( 2 as int1 )
               end
            end
            , @lv_15 ),
         coalesce(
           case col5
             when @lv_1 then
               case when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 7 and t6~col4 = 1 )
                      then cast( 6 as int1 )
                    when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 3 and t6~col4 = 1 )
                      then cast( 4 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 7 and t6~col4 = 1 )
                       then cast( 6 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 3 and t6~col4 = 1 )
                       then cast( 4 as int1 )
              end
             when @lv_6 then
               case when abs( t6~col3 - t5~col3 ) = 1 and (
                         col6 = @lv_7 and
                         t5~col4 = 5 and
                         t6~col4 = 6 )
                    then t6~col3
                    when abs( t6~col3 - t5~col3 ) = 1 and (
                      col6 = @lv_8 and
                      t5~col4 = 4 and
                      t6~col4 = 3 )
                    then t6~col3
               end
            end
            , @lv_15 ),
         coalesce(
           case col5
             when @lv_1 then
               case when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 7 and t6~col4 = 1 )
                      then cast( 1 as int1 )
                    when ( col6 = @lv_7 and t5~col3 = 5
                           and t5~col4 = 1 and t6~col3 = 3 and t6~col4 = 1 )
                      then cast( 1 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 7 and t6~col4 = 1 )
                       then cast( 8 as int1 )
                    when ( col6 = @lv_8 and t5~col3 = 5
                           and t5~col4 = 8 and t6~col3 = 3 and t6~col4 = 1 )
                       then cast( 8 as int1 )
              end
             when @lv_6 then
               case when abs( t6~col3 - t5~col3 ) = 1 and (
                         col6 = @lv_7 and
                         t5~col4 = 5 and
                         t6~col4 = 6 )
                    then cast( 5 as int1 )
                    when abs( t6~col3 - t5~col3 ) = 1 and (
                      col6 = @lv_8 and
                      t5~col4 = 4 and
                      t6~col4 = 3 )
                    then cast( 4 as int1 )
               end
            end
            , @lv_15 ),
         case col5
           when @lv_6 then
             case when ( t6~col4 = 1 and col6 = @lv_8 ) or
                       ( t6~col4 = 8 and col6 = @lv_7 )
                  then @abap_true
                  else @abap_false
             end
           else @abap_false
         end
     ),
    +cte7 as ( select from ztab2
                           fields col19, col20, col5, col6, col21, col22, col23, col24,
                                  case when col23 = col21 and col24 = col22 then @abap_false
                                       when col23 < 1 or col23 > 8 then @abap_false
                                       when col24 < 1 or col24 > 8 then @abap_false
                                       else @abap_true end as col25 ),
    +cte8 as ( select from ( ztab3 as t7
                               inner join +cte7 as t5 on t7~col19 = t5~col19 )
                               inner join +cte6 as t8 on t5~col6    = t8~col6    and
                                                               t5~col5 = t8~col5 and
                                                               t5~col21        = t8~col7   and
                                                               t5~col22        = t8~col8
                               left outer join +cte7 as t9 on t9~col19 = t5~col19 and
                                                                             t9~col20 = t5~col20 and
                                                                             t9~col21 = t8~col9 and
                                                                             t9~col22 = t8~col10
                               left outer join +cte7 as t10    on t10~col19   = t5~col19 and
                                                                             t10~col20    = t5~col20   and
                                                                             t10~col25 = @abap_true
                       fields t5~col19, t5~col20, t5~col6, t5~col5, t5~col21 as col7,
                              t5~col22 as col8, t8~col9, t8~col10, t8~col11, t8~col12,
                              t8~col13, t8~col14, t8~col15, t8~col16, t8~col17,
                              t8~col18,
                              case when t7~col27 = @abap_true then @abap_true
                                   when t5~col6 = @lv_8 and
                                        t5~col5 = @lv_1 then @abap_true
                                   when t5~col6 = @lv_8 and
                                        t5~col5 = @lv_3 and
                                        t5~col21  = 1 and
                                        t5~col22  = 8 then @abap_true
                                   end as col27,
                              case when t7~col28 = @abap_true then @abap_true
                                   when t5~col6 = @lv_8 and
                                        t5~col5 = @lv_1 then @abap_true
                                   when t5~col6 = @lv_8 and
                                        t5~col5 = @lv_3 and
                                        t5~col21  = 8 and
                                        t5~col22  = 8 then @abap_true end as col28,
                            case when t7~col29 = @abap_true then @abap_true
                                 when t5~col6 = @lv_7 and
                                      t5~col5 = @lv_1 then @abap_true
                                 when t5~col6 = @lv_7 and
                                      t5~col5 = @lv_3 and
                                      t5~col21  = 1 and t5~col22  = 1 then @abap_true end as col29,
                            case when t7~col30 = @abap_true then @abap_true
                                 when t5~col6 = @lv_7 and
                                      t5~col5 = @lv_1 then @abap_true
                                 when t5~col6 = @lv_7 and
                                      t5~col5 = @lv_3 and
                                      t5~col21  = 8 and
                                      t5~col22  = 1 then @abap_true end as col30,
                                      t10~col5 as col31,
                                      t10~col6 as col32,
                                      t10~col23 as col33,
                                      t10~col24 as col34,
                                      t10~col21 as col35,
                                      t10~col22 as col36
                       where t5~col6 = t7~col6 and
                            ( t9~col6 is null or t9~col6 <> t5~col6 ) and
                            ( t8~col11 = @abap_false or
                              t8~col11 = 'P' or
                              t8~col11 = 'E' ) and
                            (
                              t8~col11 <> 'P' or
                              t9~col6 is not null                     or
                              (
                                t10~col5 = t8~col13 and
                                t10~col6    = t8~col12    and
                                t10~col23 = t8~col14   and
                                t10~col24 = t8~col15   and
                                t10~col21        = t8~col16     and
                                t10~col22        = t8~col17
                              )
                            )
                            and
                          (
                            t8~col11 <> 'E' or
                            t9~col6 is null
                          )
    ),
    +cte9 as ( select from +cte8 as t8
                             inner join +cte7 as t11 on t11~col19 = t8~col19 and
                                                                  t11~col20  = t8~col20
                        fields t8~col19, t8~col20, t8~col6, t8~col5,
                               t8~col7, t8~col8, t8~col9, t8~col10,
                               t11~col6 as col43, t11~col21 as col44,
                               t11~col22 as col45, t8~col11,
                               t8~col12, t8~col13, t8~col14,
                               t8~col15, t8~col16, t8~col17,
                               t8~col18,
                               ( t8~col9 - t8~col7 ) * ( t11~col22 - t8~col8 ) as col46,
                               ( t11~col21 - t8~col7 ) * ( t8~col10 - t8~col8 ) as col47,
                               case when t8~col7 < t11~col21 then -1
                                    when t8~col7 = t11~col21 then  0
                                    else                                 1
                               end as col48,
                               case when t8~col9  < t11~col21 then -1
                                    when t8~col9 = t11~col21  then  0
                                    else                                1
                               end as col49,
                               case when t8~col8 < t11~col22 then -1
                                    when t8~col8 = t11~col22 then  0
                                    else                                 1
                               end as col50,
                               case when t8~col10  < t11~col22 then -1
                                    when t8~col10 = t11~col22  then  0
                                    else                                1 end as col51
                               where not ( t11~col5 = t8~col5 and
                                           t11~col6    = t8~col6    and
                                           t11~col21        = t8~col7   and
                                           t11~col22        = t8~col8  )
    ),
    +cte10 as ( select from +cte9 as t5
     fields t5~col19, t5~col20, t5~col6, t5~col5, t5~col7,
            t5~col8, t5~col9, t5~col10, t5~col43, t5~col44,
            t5~col45, t5~col11, t5~col12, t5~col13,
            t5~col14, t5~col15, t5~col16, t5~col17, t5~col18,
            t5~col46,  t5~col47,
            abs( t5~col48 + t5~col49 ) as col52,
            abs( t5~col50 + t5~col51 ) as col53 ),
    +cte11 as ( select from +cte10 as t5
                 fields t5~col19, t5~col20, t5~col6, t5~col5,
                        t5~col7, t5~col8, t5~col9, t5~col10
                 where  t5~col5 <> @lv_4 and
                        t5~col46 = t5~col47 and
                        t5~col52  <= 1 and
                        t5~col53 <= 1 and not
                  (
                     t5~col6 <> t5~col43 and
                     t5~col9  = t5~col44      and
                     t5~col10  = t5~col45
                  )
    ),
    +cte12 as ( select from +cte8 as t29 left outer join +cte11 as t30
                             on  t29~col19 = t30~col19 and
                                 t29~col20  = t30~col20  and
                                 t29~col6    = t30~col6    and
                                 t29~col5 = t30~col5 and
                                 t29~col7   = t30~col7   and
                                 t29~col8   = t30~col8   and
                                 t29~col9     = t30~col9     and
                                 t29~col10     = t30~col10
                        fields t29~*
                         where t30~col19 is null
    ),
    +cte13 as ( select from ztab3 as t7
                         left outer join +cte7 as t13
                            on t7~col19 = t13~col19 and
                               t7~col20  = t13~col20  and
                               t13~col21          = 1           and
                               t13~col22          = 8
                            left outer join +cte7 as t14
                            on t7~col19 = t14~col19 and
                               t7~col20  = t14~col20  and
                               t14~col21          = 2           and
                               t14~col22          = 8
                            left outer join +cte7 as t15
                            on t7~col19 = t15~col19 and
                               t7~col20  = t15~col20  and
                               t15~col21          = 3           and
                               t15~col22          = 8
                            left outer join +cte7 as t16
                            on t7~col19 = t16~col19 and
                               t7~col20  = t16~col20  and
                               t16~col21          = 4           and
                               t16~col22          = 8
                            left outer join +cte7 as t17
                            on t7~col19 = t17~col19 and
                            t7~col20  = t17~col20  and
                            t17~col21          = 5           and
                            t17~col22          = 8
                 fields t7~col19, t7~col20, @lv_8 as col6,
                        @lv_1 as col5, 5 as col7, 8 as col8,
                        3 as col9, 8 as col10, 'C' as col11, @lv_8 as col12,
                        @lv_3 as col13, 1 as col14, 8 as col15,
                        4 as col16, 8 as col17, @abap_false as col18,
                        @abap_true as col27, @abap_true as col28,
                        t7~col29, t7~col30
                 where t7~col27 = @abap_false and
                       t17~col6 = @lv_8 and
                       t17~col5 = @lv_1 and
                       t14~col6 is null and
                       t15~col6 is null and
                       t16~col6 is null and
                       t13~col6 = @lv_8 and
                       t13~col5 = @lv_3
    ),
    +cte14 as ( select from ztab3 as t7
                         left outer join +cte7 as t17
                         on t7~col19 = t17~col19 and
                            t7~col20  = t17~col20  and
                            t17~col21          = 5           and
                            t17~col22          = 8
                         left outer join +cte7 as t18
                         on t7~col19 = t18~col19 and
                            t7~col20  = t18~col20  and
                            t18~col21          = 6           and
                            t18~col22          = 8
                         left outer join +cte7 as t19
                         on t7~col19 = t19~col19 and
                            t7~col20  = t19~col20  and
                            t19~col21          = 7           and
                            t19~col22          = 8
                       left outer join +cte7 as t20
                         on t7~col19 = t20~col19 and
                            t7~col20  = t20~col20  and
                            t20~col21          = 8           and
                            t20~col22          = 8
                  fields t7~col19, t7~col20, @lv_8 as col6,
                         @lv_1 as col5, 5 as col7, 8 as col8,
                         7 as col9, 8 as col10, 'C' as col11, @lv_8 as col12,
                         @lv_3 as col13, 8 as col14, 8 as col15,
                         6 as col16, 8 as col17, @abap_false as col18,
                         @abap_true as col27, @abap_true as col28,
                         t7~col29, t7~col30
                 where t7~col28 = @abap_false and
                       t17~col6 = @lv_8 and
                       t17~col5 = @lv_1 and
                       t18~col6 is null and
                       t19~col6 is null and
                       t20~col6 = @lv_8 and
                       t20~col5 = @lv_3
    ),
    +cte15 as ( select from ztab3 as t7
                         left outer join +cte7 as t21
                         on t7~col19 = t21~col19 and
                            t7~col20  = t21~col20  and
                            t21~col21          = 1           and
                            t21~col22          = 1
                            left outer join +cte7 as t22
                              on t7~col19 = t22~col19 and
                                 t7~col20  = t22~col20  and
                                 t22~col21          = 2           and
                                 t22~col22          = 1
                            left outer join +cte7 as t23
                              on t7~col19 = t23~col19 and
                                 t7~col20  = t23~col20  and
                                 t23~col21          = 3           and
                                 t23~col22          = 1
                            left outer join +cte7 as t24
                              on t7~col19 = t24~col19 and
                                 t7~col20  = t24~col20  and
                                 t24~col21          = 4           and
                                 t24~col22          = 1
                            left outer join +cte7 as t25
                              on t7~col19 = t25~col19 and
                                 t7~col20  = t25~col20  and
                                 t25~col21          = 5           and
                                 t25~col22          = 1
                    fields t7~col19, t7~col20, @lv_7 as col6,
                           @lv_1 as col5, 5 as col7, 1 as col8,
                           3 as col9, 1 as col10, 'C' as col11,
                           @lv_7 as col12,
                           @lv_3 as col13,
                           1 as col14, 1 as col15, 4 as col16, 1 as col17,
                           @abap_false as col18, t7~col27,
                           t7~col28,
                           @abap_true as col29,
                           @abap_true as col30
                   where t7~col29 = @abap_false and
                         t25~col6 = @lv_7 and
                         t25~col5 = @lv_1 and
                         t22~col6 is null and
                         t23~col6 is null and
                         t24~col6 is null and
                         t21~col6 = @lv_7 and
                         t21~col5 = @lv_3
     ),
    +cte16 as ( select from ztab3 as t7
                  left outer join ztab4 as t25
                  on t7~col19 = t25~col19 and
                     t7~col20  = t25~col20  and
                     t25~col21          = 5           and
                     t25~col22          = 1
                 left outer join ztab4 as t26
                 on t7~col19 = t26~col19 and
                    t7~col20  = t26~col20  and
                    t26~col21          = 6           and
                    t26~col22          = 1
                left outer join ztab4 as t27
                  on t7~col19 = t27~col19 and
                     t7~col20  = t27~col20  and
                     t27~col21          = 7           and
                     t27~col22          = 1
                left outer join ztab4 as t28
                  on t7~col19 = t28~col19 and
                     t7~col20  = t28~col20  and
                     t28~col21          = 8           and
                     t28~col22          = 1
             fields t7~col19, t7~col20, @lv_7 as col6,
                    @lv_1 as col5, 5 as col7, 1 as col8,
                    7 as col9, 1 as col10, 'C' as col11,
                    @lv_7  as col12,
                    @lv_3 as col13,
                    8 as col14, 1 as col15, 6 as col16, 1 as col17,
                    @abap_false as col18, t7~col27, t7~col28,
                    @abap_true as col29,
                    @abap_true as col30
             where t7~col30 = @abap_false and
                   t25~col6 = @lv_7 and
                   t25~col5 = @lv_1 and
                   t26~col6 is null and
                   t27~col6 is null and
                   t28~col6 = @lv_7 and
                   t28~col5 = @lv_3
    ),
    +cte17 as ( select from +cte12 as t29
                  fields t29~col19, t29~col20, t29~col6, t29~col5,
                         t29~col7, t29~col8, t29~col9, t29~col10,
                         t29~col11,
                         case when t29~col12 <> '-'
                              then t29~col12 end as col12,
                         case when col13 <> '-'
                              then col13 end as col13,
                         t29~col14, t29~col15, t29~col16, t29~col17,
                         t29~col18, t29~col27, t29~col28,
                         t29~col29, t29~col30, @abap_false as col54,
                         @abap_false as col55, @abap_false as col56,
                         @abap_false as col57
                  union select from +cte13 fields col19, col20, col6, col5,
                                                    col7, col8, col9, col10, col11,
                                                    col12, col13, col14, col15,
                                                    col16, col17, col18, col27,
                                                    col28, col29,
                                                    col30,
                                                    @abap_true as col54,
                                                    @abap_false as col55,
                                                    @abap_false as col56,
                                                    @abap_false as col57
                  union select from +cte14 fields col19, col20, col6, col5,
                                                    col7, col8, col9, col10, col11,
                                                    col12, col13, col14, col15,
                                                    col16, col17, col18, col27,
                                                    col28, col29,
                                                    col30,
                                                    @abap_false as col54,
                                                    @abap_true as col55,
                                                    @abap_false as col56,
                                                    @abap_false as col57
                  union select from +cte15 fields col19, col20, col6, col5,
                                                    col7, col8, col9, col10, col11,
                                                    col12, col13, col14, col15,
                                                    col16, col17, col18, col27,
                                                    col28, col29,
                                                    col30,
                                                    @abap_false as col54,
                                                    @abap_false as col55,
                                                    @abap_true as col56,
                                                    @abap_false as col57
                 union select from +cte16 fields col19, col20, col6, col5,
                                                    col7, col8, col9, col10, col11,
                                                    col12, col13, col14, col15,
                                                    col16, col17, col18, col27,
                                                    col28, col29,
                                                    col30,
                                                    @abap_false as col54,
                                                    @abap_false as col55,
                                                    @abap_false as col56,
                                                    @abap_true as col57
    ),
    +cte18 as ( select from +cte17 as t8
                 inner join +cte7 as t12
                 on t8~col19 = t12~col19 and
                    t8~col20  = t12~col20
                 fields t8~col19, t8~col20, t8~col6 as col37, t8~col5 as col38,
                        t8~col7 as col39, t8~col8 as col40, t8~col9 as col41,
                        t8~col10 as col42,
                        case when t8~col18 = @abap_true and
                                  t8~col5 = t12~col5 and
                                  t8~col6    = t12~col6    and
                                  t8~col7   = t12~col21        and
                                  t8~col8   = t12~col22
                             then 'Q'
                        else t12~col5 end as col5,
                        t12~col6,
                        case when t8~col5 = t12~col5 and
                                  t8~col6    = t12~col6    and
                                  t8~col7   = t12~col21        and
                                  t8~col8   = t12~col22
                             then t8~col9
                             when t8~col11 = 'C' and
                                  t8~col13 = t12~col5 and
                                  t8~col12    = t12~col6    and
                                  t8~col14   = t12~col21        and
                                  t8~col15   = t12~col22
                             then t8~col16
                             else t12~col21 end as col21,
                        case when t8~col5 = t12~col5 and
                                  t8~col6    = t12~col6    and
                                  t8~col7   = t12~col21        and
                                  t8~col8   = t12~col22
                             then t8~col10
                             when t8~col11 = 'C' and
                                  t8~col13 = t12~col5 and
                                  t8~col12    = t12~col6    and
                                  t8~col14   = t12~col21        and
                                  t8~col15   = t12~col22
                             then t8~col17
                             else t12~col22 end as col22,
                         t12~col21 as col23,
                         t12~col22 as col24,
                         case when t8~col5 = t12~col5 and
                                   t8~col6    = t12~col6    and
                                   t8~col7   = t12~col21        and
                                   t8~col8   = t12~col22
                              then @abap_true
                              when t8~col11 = 'C' and
                                   t8~col13 = t12~col5 and
                                   t8~col12    = t12~col6    and
                                   t8~col14   = t12~col21        and
                                   t8~col15   = t12~col22
                              then @abap_true
                              else @abap_false end as col25,
                         t8~col27,
                         t8~col28,
                         t8~col29,
                         t8~col30,
                         t8~col54,
                         t8~col55,
                         t8~col56,
                         t8~col57
                 where ( not
                          ( t12~col21 = t8~col9 and t12~col22 = t8~col10 ) ) and ( not
                          ( t8~col11 = 'P' and
                            t8~col12    = t12~col6 and
                            t8~col13 = t12~col5 and
                            t8~col16     = t12~col21 and
                            t8~col17     = t12~col22 ) )
    ),
    +cte19 as ( select from ztab3 as t7 inner join +cte18 as t5 on t7~col19 = t5~col19
                        inner join +cte18 as t31 on t31~col19 = t5~col19 and
                                              t31~col20       = t5~col20   and
                                              t31~col37    = t5~col37 and
                                              t31~col38 = t5~col38 and
                                              t31~col39   = t5~col39 and
                                              t31~col40   = t5~col40 and
                                              t31~col41     = t5~col41 and
                                              t31~col42     = t5~col42 and
                                              t31~col6         = t5~col37 and
                                              t31~col5      = @lv_1
                        inner join +cte6 as t8 on t5~col6    = t8~col6    and
                                                      t5~col5 = t8~col5 and
                                                      t5~col21        = t8~col7   and
                                                      t5~col22        = t8~col8
                        left outer join +cte18 as t9 on t9~col19      = t5~col19 and
                                                                           t9~col20       = t5~col20 and
                                                                           t9~col37    = t5~col37 and
                                                                           t9~col38 = t5~col38 and
                                                                           t9~col39   = t5~col39 and
                                                                           t9~col40   = t5~col40 and
                                                                           t9~col41     = t5~col41 and
                                                                           t9~col42     = t5~col42 and
                                                                           t9~col21             = t8~col9 and
                                                                           t9~col22             = t8~col10
                        left outer join +cte18 as t10    on t10~col19      = t5~col19 and
                                                                           t10~col20       = t5~col20   and
                                                                           t10~col37    = t5~col37 and
                                                                           t10~col38 = t5~col38 and
                                                                           t10~col39   = t5~col39 and
                                                                           t10~col40   = t5~col40 and
                                                                           t10~col41     = t5~col41 and
                                                                           t10~col42     = t5~col42 and
                                                                           t10~col25    = @abap_true
                  fields t5~col19, t5~col20, t5~col37, t5~col38, t5~col39,
                         t5~col40, t5~col41, t5~col42, t5~col6, t5~col5,
                         t5~col21 as col7, t5~col22 as col8, t8~col9, t8~col10, t8~col11,
                         t8~col12, t8~col13, t8~col14, t8~col15, t8~col16,
                         t8~col17, t8~col18,
                         case when t5~col27 = @abap_true then @abap_true
                              when t5~col6 = @lv_8 and
                                   t5~col5 = @lv_1 then @abap_true
                              when t5~col6 = @lv_8 and
                                   t5~col5 = @lv_3 and
                                   t5~col21  = 1 and
                                   t5~col22  = 8 then @abap_true
                              else @abap_false end as col27,
                         case when t5~col28 = @abap_true then @abap_true
                              when t5~col6 = @lv_8 and
                                   t5~col5 = @lv_1 then @abap_true
                              when t5~col6 = @lv_8 and
                                   t5~col5 = @lv_3 and
                                   t5~col21  = 8 and
                                   t5~col22  = 8 then @abap_true
                              else @abap_false
                         end as col28,
                         case when t5~col29 = @abap_true then @abap_true
                              when t5~col6 = @lv_7 and
                                   t5~col5 = @lv_1 then @abap_true
                              when t5~col6 = @lv_7 and
                                   t5~col5 = @lv_3 and
                                   t5~col21  = 1 and
                                   t5~col22  = 1 then @abap_true
                              else @abap_false end as col29,
                         case when t5~col30 = @abap_true then @abap_true
                              when t5~col6 = @lv_7 and
                                   t5~col5 = @lv_1 then @abap_true
                              when t5~col6 = @lv_7 and
                                   t5~col5 = @lv_3 and
                                   t5~col21  = 8 and
                                   t5~col22  = 1 then @abap_true
                              else @abap_false end as col30,
                              t10~col5 as col31,
                              t10~col6 as col32,
                              t10~col23 as col33,
                              t10~col24 as col34,
                              t10~col21 as col35,
                              t10~col22 as col36
                    where
                      ( ( t5~col6 = @lv_8 and t7~col6 = @lv_7 ) or
                      ( t5~col6 = @lv_7 and t7~col6 = @lv_8 ) ) and
                      ( t9~col6 is null or t9~col6 <> t5~col6 ) and
                      ( t8~col11 = @abap_false or
                        t8~col11 = 'P' or
                        t8~col11 = 'E' ) and
                      (
                        t8~col11 <> 'P' or
                        t9~col6 is not null or
                        (
                          t10~col5 = t8~col13 and
                          t10~col6    = t8~col12    and
                          t10~col23 = t8~col14   and
                          t10~col24 = t8~col15   and
                          t10~col21        = t8~col16     and
                          t10~col22        = t8~col17
                        )
                      )
                      and
                    (
                      t8~col11 <> 'E' or
                      t9~col6 is null
                    ) and
                       ( ( t8~col9     = t31~col21    and
                            t8~col10     = t31~col22 ) or
                          ( t5~col54 = @abap_true and
                        t8~col10 = 8 and
                        ( t8~col9 = 4 or t8~col9 = 5 )
                      ) or
                      ( t5~col56 = @abap_true and
                        t8~col10 = 1 and
                        ( t8~col9 = 4 or t8~col9 = 5 )
                      ) or
                      ( t5~col55 = @abap_true and
                        t8~col10 = 8 and
                        ( t8~col9 = 5 or t8~col9 = 6 )
                      ) or
                      ( t5~col57 = @abap_true and
                        t8~col10 = 1 and
                        ( t8~col9 = 5 or t8~col9 = 6 )
                      )
                    )
                  ),
   +cte20 as ( select from +cte19 as t8
                        inner join +cte18 as t11 on t11~col19 = t8~col19 and
                                                          t11~col20  = t8~col20  and
                                                          t11~col37 = t8~col37 and
                                                          t11~col38 = t8~col38 and
                                                          t11~col39 = t8~col39 and
                                                          t11~col40 = t8~col40 and
                                                          t11~col41 = t8~col41 and
                                                          t11~col42 = t8~col42
                 fields t8~col19, t8~col20, t8~col37, t8~col38, t8~col39,
                        t8~col40, t8~col41, t8~col42, t8~col6, t8~col5,
                        t8~col7, t8~col8, t8~col9, t8~col10, t11~col6 as col43,
                        t11~col21 as col44, t11~col22 as col45, t8~col11, t8~col12,
                        t8~col13, t8~col14, t8~col15, t8~col16, t8~col17,
                        t8~col18,
                        ( t8~col9 - t8~col7 ) * ( t11~col22 - t8~col8 ) as col46,
                        ( t11~col21 - t8~col7 ) * ( t8~col10 - t8~col8 ) as col47,
                        case when t8~col7 < t11~col21 then -1
                             when t8~col7 = t11~col21 then  0
                             else                                 1
                        end as col48,
                        case when t8~col9  < t11~col21 then -1
                             when t8~col9 = t11~col21  then  0
                             else                                1
                        end as col49,
                        case when t8~col8 < t11~col22 then -1
                             when t8~col8 = t11~col22 then  0
                             else                                 1
                        end as col50,
                        case when t8~col10  < t11~col22 then -1
                             when t8~col10 = t11~col22  then  0
                             else                                1
                        end as col51
                 where not ( t11~col5 = t8~col5 and
                             t11~col6    = t8~col6    and
                             t11~col21        = t8~col7   and
                             t11~col22        = t8~col8
                           )
    ),
    +cte21 as ( select from +cte20 as t5
                          fields col19, col20, col37, col38, col39, col40, col41,
                                 col42, col6, col5, col7, col8, col9, col10, col43, col44,
                                 col45, col11, col12, col13, col14, col15, col16,
                                 col17, col18, col46, col47,
                                  abs( col48 + col49 ) as col52,
                                  abs( col50 + col51 ) as col53
    ),
    +cte22 as ( select from +cte21 as t5
                          fields col19, col20, col37, col38, col39, col40, col41,
                                 col42, col6, col5, col7, col8, col9, col10
                   where col5 <> @lv_4 and
                         col46 = t5~col47 and
                         col52  <= 1 and
                         col53 <= 1 and not
                         (
                            col6 <> t5~col43 and
                            col9  = t5~col44      and
                            col10  = t5~col45
                         )
    ),
    +cte23 as ( select from +cte19 as t29
                  left outer join +cte22 as t30
                  on  t29~col19 = t30~col19 and
                      t29~col20  = t30~col20  and
                      t29~col37 = t30~col37 and
                      t29~col38 = t30~col38 and
                      t29~col39 = t30~col39 and
                      t29~col40 = t30~col40 and
                      t29~col41 = t30~col41 and
                      t29~col42 = t30~col42 and
                      t29~col6    = t30~col6    and
                      t29~col5 = t30~col5 and
                      t29~col7   = t30~col7   and
                      t29~col8   = t30~col8   and
                      t29~col9     = t30~col9     and
                      t29~col10     = t30~col10
                fields t29~*
         where t30~col19 is null
    ),
    +cte24 as ( select from +cte17 as t29
                  left outer join +cte23 as t30
                  on  t29~col19 = t30~col19 and
                      t29~col20  = t30~col20  and
                      t29~col6 = t30~col37 and
                      t29~col5 = t30~col38 and
                      t29~col7 = t30~col39 and
                      t29~col8 = t30~col40 and
                      t29~col9 = t30~col41 and
                      t29~col10 = t30~col42
                  fields t29~*
                  where t30~col19 is null
    ),
    +cte25 as ( select from +cte24 as t8
               inner join +cte7 as t12
               on t8~col19 = t12~col19 and
                  t8~col20  = t12~col20
               fields t8~col19,
                      t8~col20,
                      t8~col6 as col37,
                      t8~col5 as col38,
                      t8~col7 as col39,
                      t8~col8 as col40,
                      t8~col9 as col41,
                      t8~col10 as col42,
                      case when t8~col18 = 'X' and
                                t8~col5 = t12~col5 and
                                t8~col6    = t12~col6    and
                                t8~col7   = t12~col21        and
                                t8~col8   = t12~col22
                      then @lv_2
                      else t12~col5 end as col5,
                      t12~col6,
                      case when t8~col5 = t12~col5 and
                                t8~col6    = t12~col6    and
                                t8~col7   = t12~col21        and
                                t8~col8   = t12~col22
                      then t8~col9
                      when t8~col11 = 'C' and
                           t8~col13 = t12~col5 and
                           t8~col12    = t12~col6    and
                           t8~col14   = t12~col21        and
                           t8~col15   = t12~col22
                      then t8~col16
                      else t12~col21 end as col21,
                      case when t8~col5 = t12~col5 and
                           t8~col6    = t12~col6    and
                           t8~col7   = t12~col21        and
                           t8~col8   = t12~col22
                      then t8~col10
                      when t8~col11 = 'C' and
                           t8~col13 = t12~col5 and
                           t8~col12    = t12~col6    and
                           t8~col14   = t12~col21        and
                           t8~col15   = t12~col22
                      then t8~col17
                      else t12~col22 end as col22,
                      t12~col21 as col23,
                      t12~col22 as col24,
                      case when t8~col5 = t12~col5 and
                                t8~col6    = t12~col6    and
                                t8~col7   = t12~col21        and
                                t8~col8   = t12~col22
                           then 'X'
                           when t8~col11 = 'C' and
                                t8~col13 = t12~col5 and
                                t8~col12    = t12~col6    and
                                t8~col14   = t12~col21        and
                                t8~col15   = t12~col22
                           then 'X'
                           else ' ' end as col25,
                      t8~col27,
                      t8~col28,
                      t8~col29,
                      t8~col30,
                      t8~col54,
                      t8~col55,
                      t8~col56,
                      t8~col57
       where ( not
         ( t12~col21 = t8~col9 and
             t12~col22 = t8~col10 ) ) and ( not
            ( t8~col11 = 'P' and
             t8~col12    = t12~col6 and
             t8~col13 = t12~col5 and
             t8~col16     = t12~col21 and
             t8~col17     = t12~col22 ) )
    )
    select from +cte25
           fields col19, col20 + 1 as col20, col5, col6,
                  col21, col22, col23, col24, col27,
                  col28, col29,
                  col30
           where col19 = @iv_1 and
                 col20 = @iv_2 and
                 col37 = @iv_3 and
                 col38 = @iv_4 and
                 col39 = @iv_5 and
                 col40 = @iv_6 and
                 col41 = @iv_7 and
                 col42 = @iv_8
    into corresponding fields of table @lt_result.`
];

statementType(tests, "WITH large", Statements.With);
