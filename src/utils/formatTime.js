function formatTime(params) {
    let time = null
    if (typeof params === 'string') {
        time = new Date(params)
    } else { time = params }
    let obj = timeStr(time)
    let now = timeStr(new Date())
    if (obj.date === now.date) {
        return { stamp: obj.time, con: obj.time }
    } else {
        return { stamp: obj.date, con: obj.date + ' ' + obj.time }
    }
}

function timeStr(time) {
    let year = time.getFullYear()
    let month = fix(time.getMonth() + 1)
    let date = fix(time.getDate())
    let hour = fix(time.getHours())
    let minute = fix(time.getMinutes())
    return { date: year + '/' + month + '/' + date, time: hour + ':' + minute }
}

function fix(n) {
    if (n < 10) {
        return '0' + n
    } else {
        return n
    }
}

export default formatTime