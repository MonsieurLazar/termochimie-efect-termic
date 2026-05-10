export type TemperaturePoint = { timeSec: number; tempC: number }

export class MainGlassTemperatureGraph {
  history: TemperaturePoint[] = $state([])
  isPaused: boolean = $state(false)

  private lastSampleSec: number = 0
  private readonly sampleIntervalSec: number

  constructor(sampleIntervalSec = 0.2) {
    this.sampleIntervalSec = sampleIntervalSec
  }

  record(simulationTimeSec: number, tempC: number) {
    if (this.isPaused) return
    if (!Number.isFinite(tempC)) return
    if (simulationTimeSec - this.lastSampleSec < this.sampleIntervalSec) return

    this.lastSampleSec = simulationTimeSec
    this.history = [...this.history, { timeSec: simulationTimeSec, tempC }]
  }

  reset(simulationTimeSec = 0) {
    this.history = []
    this.lastSampleSec = simulationTimeSec
  }

  togglePause() {
    this.isPaused = !this.isPaused
  }
}
