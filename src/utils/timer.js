module.exports = {
    sleep:function (millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
    }
}