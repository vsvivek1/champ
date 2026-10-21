function updateOIDropStrength(cis, lookback = 10) {

    const data = cis.minuteData

    cis.oiDropStrength = null
    cis.oiDropPercent = 0

    if (!data || data.length < lookback)
    {
  cis.oiDropPercent = 0
         cis.oiDropStrength = "NONE";
         return
    }
        

    const recent = data.slice(-lookback)

    const highestOI = Math.max(...recent.map(c => c.oi))
    const lowestOI = Math.min(...recent.map(c => c.oi))

    const dropPercent =
        ((highestOI - lowestOI) / highestOI) * 100

    cis.oiDropPercent = dropPercent

    if (dropPercent >= 5)
        cis.oiDropStrength = "INSTITUTIONAL"

    else if (dropPercent >= 3)
        cis.oiDropStrength = "STRONG"

    else if (dropPercent >= 1.5)
        cis.oiDropStrength = "MODERATE"

    // else if (dropPercent >= 0.5)
    //     cis.oiDropStrength = "WEAK"

    else
        cis.oiDropStrength = "NONE"
}


export default updateOIDropStrength;