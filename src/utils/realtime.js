import { Realtime } from 'leancloud-realtime'
import key from '../../key.js'

const realtime = new Realtime({
    appId: key.appId,
    appKey: key.appKey
})
export default realtime