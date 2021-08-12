/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 30, 'minute')  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 * 
 * @param date  Date to start with
 * @param units  Number of units of the given interval to add.
 * @param interval  One of: year, quarter, month, week, day, hour, minute, second
 */
module.exports = function (date, units, interval) {
	if (!(date instanceof Date))
		return undefined;
	var ret = new Date(date); //don't change original date
	var checkRollover = function () { if (ret.getDate() != date.getDate()) ret.setDate(0); };
	switch (String(interval).toLowerCase()) {
		case 'year':
			ret.setFullYear(ret.getFullYear() + units); checkRollover(); break;
		case 'quarter':
			ret.setMonth(ret.getMonth() + 3 * units); checkRollover(); break;
		case 'month':
			ret.setMonth(ret.getMonth() + units); checkRollover(); break;
		case 'week':
		case 'w':
			ret.setDate(ret.getDate() + 7 * units); break;
		case 'day':
		case 'd':
			ret.setDate(ret.getDate() + units); break;
		case 'hour':
		case 'h':
			ret.setTime(ret.getTime() + units * 3600000); break;
		case 'minute':
		case 'm':
			ret.setTime(ret.getTime() + units * 60000); break;
		case 'second':
		case 's':
			ret.setTime(ret.getTime() + units * 1000); break;
		default: ret = undefined; break;
	}
	return ret;
}