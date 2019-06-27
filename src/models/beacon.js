var Beacon = /** @class */ (function () {
    function Beacon(beacon) {
        this.beacon = beacon;
        this.uuid = beacon.uuid;
        this.major = beacon.major;
        this.minor = beacon.minor;
        this.rssi = beacon.rssi;
        this.proximity = beacon.proximity;
        this.tx = beacon.tx;
        this.accuracy = beacon.accuracy;
        this.distance = this.calculateDistance();
    }
    Beacon.prototype.calculateDistance = function () {
        return 10 ^ ((this.tx - this.rssi) / (10 * 2));
    };
    return Beacon;
}());
export { Beacon };
//# sourceMappingURL=beacon.js.map