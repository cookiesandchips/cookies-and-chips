export function subscriberStatus(status:unknown){return status==='subscribed'?'Subscribed':status==='unsubscribed'?'Unsubscribed':'Waiting to confirm';}
export function countSubscribers(rows:{status?:string}[]){return {subscribed:rows.filter(row=>row.status==='subscribed').length,pending:rows.filter(row=>row.status==='pending').length};}
