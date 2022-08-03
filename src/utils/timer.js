export class Timer{
    sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
    }
}