import sensor from '@system.sensor'
import brightness from '@system.brightness'

export default {
  data: {
    /* LIVE */
    ax: '--',
    ay: '--',
    az: '--',

    gx: '--',
    gy: '--',
    gz: '--',

    pressure: '--',
    direction: '--',

    /* DISTANCE */
    distances: [25, 32, 50, 67, 75],
    distanceIndex: 0,
    distanceLabel: '25M',

    /* RECORDING */
    recording: false,
    sampleNo: 0,
    startTime: null,
    rows: [],
    timerId: null,

    /* KEEP SCREEN ALIVE */
    pingTimer: null,

    /* QR EXPORT */
    showQr: false,
    qrText: '',
    qrChunks: [],
    qrIndex: 0,
    qrTimer: null
  },

  onShow() {
    this.keepScreenOn()

    this.startAccelerometer()
    this.startGyroscope()
    this.startBarometer()
    this.startCompass()
  },

  onHide() {
    this.stopRecording()
    this.stopQr()
    this.stopPing()

    try { sensor.unsubscribeAccelerometer() } catch (e) {}
    try { sensor.unsubscribeGyroscope() } catch (e) {}
    try { sensor.unsubscribeBarometer() } catch (e) {}
    try { sensor.unsubscribeCompass() } catch (e) {}
  },

  /* =====================
     SCREEN KEEP ALIVE
  ===================== */
  keepScreenOn() {
    try {
      brightness.setKeepScreenOn({
        keepScreenOn: true
      })
    } catch (e) {}
  },

  startPing() {
    var self = this

    this.stopPing()

    this.pingTimer = setInterval(function () {
      if (self.recording || self.showQr) {
        self.keepScreenOn()
      }
    }, 1000)
  },

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  },

  /* =====================
     DISTANCE
  ===================== */
  nextDistance() {
    if (this.recording || this.showQr) return

    this.distanceIndex++

    if (this.distanceIndex >= this.distances.length) {
      this.distanceIndex = 0
    }

    this.distanceLabel =
      this.distances[this.distanceIndex] + 'M'
  },

  /* =====================
     BUTTON
  ===================== */
  toggleRecording() {
    if (this.showQr) return

    if (this.recording) {
      this.stopRecording()
    } else {
      this.startRecording()
    }
  },

  /* =====================
     RECORD
  ===================== */
  startRecording() {
    var self = this

    this.recording = true
    this.sampleNo = 0
    this.startTime = Date.now()
    this.rows = []

    this.keepScreenOn()
    this.startPing()

    this.timerId = setInterval(function() {
      self.captureSample()
    }, 250)
  },

  stopRecording() {
    if (!this.recording) return

    this.recording = false

    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }

    this.stopPing()

    this.prepareQrExport()
  },

  captureSample() {
    this.keepScreenOn()

    this.sampleNo++

    var d = this.distances[this.distanceIndex]
    var elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2)

    var row =
      d + ',' +
      this.sampleNo + ',' +
      elapsed + ',' +
      this.ax + ',' +
      this.ay + ',' +
      this.az + ',' +
      this.gx + ',' +
      this.gy + ',' +
      this.gz + ',' +
      this.pressure + ',' +
      this.direction

    this.rows.push(row)
  },

  /* =====================
     QR EXPORT
  ===================== */
  prepareQrExport() {
    var csv =
      'distance,sample,seconds,ax,ay,az,gx,gy,gz,pressure,direction\n'

    for (var i = 0; i < this.rows.length; i++) {
      csv += this.rows[i] + '\n'
    }

    /* tamaño seguro incluso para 75m */
    var blockSize = 650
    var arr = []

    for (var p = 0; p < csv.length; p += blockSize) {
      arr.push(csv.slice(p, p + blockSize))
    }

    this.qrChunks = arr
    this.qrIndex = 0
    this.showQr = true

    this.showCurrentQr()
    this.startQrLoop()
  },

  showCurrentQr() {
    this.qrText =
      this.qrChunks[this.qrIndex]
  },

  startQrLoop() {
    var self = this

    this.stopQr()

    this.keepScreenOn()
    this.startPing()

    this.qrTimer = setInterval(function() {
      self.qrIndex++

      if (self.qrIndex >= self.qrChunks.length) {
        self.finishQr()
        return
      }

      self.showCurrentQr()

    }, 10000)
  },

  stopQr() {
    if (this.qrTimer) {
      clearInterval(this.qrTimer)
      this.qrTimer = null
    }
  },

  finishQr() {
    this.stopQr()
    this.stopPing()

    this.showQr = false
    this.qrText = ''

    /* siguiente distancia automática */
    this.distanceIndex++

    if (this.distanceIndex >= this.distances.length) {
      this.distanceIndex = 0
    }

    this.distanceLabel =
      this.distances[this.distanceIndex] + 'M'
  },

  /* =====================
     SENSORS
  ===================== */
  startAccelerometer() {
    var self = this

    sensor.subscribeAccelerometer({
      interval: 'normal',
      success: function(data) {
        self.ax = Number(data.x || 0).toFixed(2)
        self.ay = Number(data.y || 0).toFixed(2)
        self.az = Number(data.z || 0).toFixed(2)
      }
    })
  },

  startGyroscope() {
    var self = this

    sensor.subscribeGyroscope({
      interval: 'normal',
      success: function(data) {
        self.gx = Number(data.x || 0).toFixed(2)
        self.gy = Number(data.y || 0).toFixed(2)
        self.gz = Number(data.z || 0).toFixed(2)
      }
    })
  },

  startBarometer() {
    var self = this

    sensor.subscribeBarometer({
      success: function(data) {
        self.pressure =
          Number(data.pressure || 0).toFixed(1)
      }
    })
  },

  startCompass() {
    var self = this

    sensor.subscribeCompass({
      success: function(data) {
        self.direction =
          Number(data.direction || 0).toFixed(0)
      }
    })
  }
}