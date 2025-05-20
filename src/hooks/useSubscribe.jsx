import { useEffect, useRef } from 'react'
import { supabase } from '../supabase/supabase'

/** 구독할 테이블을 있는지 확인 할건지 체크 */
const TABLE_CHECK = true;

/** 구독할 테이블이 있는지 확인 */
const tableCheck = async (table, schema) => {
    const { data, error } = await supabase.rpc('table_exists', {
        p_schema: schema,
        p_table: table,
    });

    if (error) {
        alert('테이블 존재 확인 중 오류가 발생했습니다.');
        return false;
    }

    if (!data) {
        alert(`테이블 '${schema}.${table}' 이 존재하지 않습니다.`);
        return false;
    }
    return true;
};

/** 이벤트 타입 */
export const EVENT_TYPES = { INSERT: 'INSERT', UPDATE: 'UPDATE', DELETE: 'DELETE' }

/**
 * 테이블 구독 커스텀 훅 (테이블 존재 여부 체크 포함)
 * @param {Object} params
 * @param {string} params.table 테이블 명
 * @param {Function} params.callback 테이블 변경시 사용될 메서드 (newData, oldData)
 * @param {string|null} params.filter 테이블 조건
 * @param {EVENT_TYPES} params.event 테이블의 변화
 * @param {string} params.schema 테이블의 위치 schema
 */
export const useSubscribe = ({ table, callback = () => {}, filter = null, event = EVENT_TYPES.INSERT, schema = 'public' }) => {
    const channelRef = useRef(null)
    useEffect(() => {
        // 구독 실행
        const subscribe = () => {
            const options = { event, schema, table }
            if (filter) options.filter = filter
            const channel = supabase
                .channel(`realtime:${schema}:${table}`)
                .on('postgres_changes', options, (payload) => {
                    callback({
                        newData: payload.new,
                        oldData: payload.old,
                    })
                })
                .subscribe()
            channelRef.current = channel
        }
        // 유효한 이벤트 타입인지 확인
        if (!Object.values(EVENT_TYPES).includes(event)) {
            alert(`${event}는 유효한 테이블 변화 타입이 아닙니다.`); return
        }
        if (TABLE_CHECK) {
            tableCheck(table,schema).then((result) => {
                if (result) { subscribe() } else { return; }
            })
        } else { subscribe() }
        // 초기화
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, [table, event, schema, callback, filter])
}
