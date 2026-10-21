export function hasLiveMinuteHighCrossedLastNMinuteHigh(object, n = 3) {

  if (
    !object ||
    !object.minuteData ||
    object.minuteData.length < n ||
    !object.liveMinute
  ) {
    return false;
  }

  // last n completed minute candles
  const lastNCMinutes = object.minuteData.slice(-n);

  // highest high from last n minutes
  const lastNMinuteHigh = Math.max(
    ...lastNCMinutes.map(candle => Number(candle.high))
  );

  // compare live minute high
  let result= Number(object.liveMinute.high) > lastNMinuteHigh;;
  if(!result){
    object.hasWarning=true
object.warningMessages.push(`Live minute high ${object.liveMinute.high} has not crossed last ${n} minute high ${lastNMinuteHigh}`)
  }else{
object.hasWarning=true
obkect.warningMessages.remove(`Live minute high ${object.liveMinute.high} has not crossed last ${n} minute high ${lastNMinuteHigh}`)

  }

  return result;
}