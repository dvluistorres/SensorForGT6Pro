import sensor from '@system.sensor';

export default {
  data: {
    /* ACCELEROMETER */
    ax: '--',
    ay: '--',
    az: '--',

    /* GYROSCOPE */
    gx: '--',
    gy: '--',
    gz: '--',

    /* PRESSURE */
    pressure: '--',

    /* COMPASS */
    direction: '--',
  },

  onShow() {
    this.startAccelerometer()
    this.startGyroscope()
    this.startBarometer()
    this.startCompass()

  },

  onHide() {
    try { sensor.unsubscribeAccelerometer() } catch (e) {}
    try { sensor.unsubscribeGyroscope() } catch (e) {}
    try { sensor.unsubscribeBarometer() } catch (e) {}
    try { sensor.unsubscribeCompass() } catch (e) {}
  },

  /* =========================
     ACCELEROMETER
  ========================= */
  startAccelerometer() {
    var self = this

    sensor.subscribeAccelerometer({
      interval: 'normal',
      success: function(data) {
        self.ax = Number(data.x || 0).toFixed(2)
        self.ay = Number(data.y || 0).toFixed(2)
        self.az = Number(data.z || 0).toFixed(2)
      },
      fail: function(data, code) {
        console.log('Accelerometer error:' + code + data)
      }
    })
  },

  /* =========================
     GYROSCOPE
  ========================= */
  startGyroscope() {
    var self = this

    sensor.subscribeGyroscope({
      interval: 'normal',
      success: function(data) {
        self.gx = Number(data.x || 0).toFixed(2)
        self.gy = Number(data.y || 0).toFixed(2)
        self.gz = Number(data.z || 0).toFixed(2)
      },
      fail: function(data, code) {
        console.log('Gyroscope error:' + code + data)
      }
    })
  },

  /* =========================
     BAROMETER
  ========================= */
  startBarometer() {
    var self = this

    sensor.subscribeBarometer({
      success: function(data) {
        self.pressure = Number(data.pressure || 0).toFixed(1)
      },
      fail: function(data, code) {
        console.log('Barometer error:' + code + data)
      }
    })
  },

  /* =========================
     ORIENTATION / COMPASS
  ========================= */
  startCompass() {
    var self = this

    sensor.subscribeCompass({
      success: function(data) {
        self.direction = Number(data.direction || 0).toFixed(0)
      },
      fail: function(data, code) {
        console.log('Compass error:' + code + data)
      }
    })
  },
}