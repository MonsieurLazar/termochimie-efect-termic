export type TemperaturePoint = { timeSec: number; tempC: number }

export class MainGlassTemperatureGraph {
  history: TemperaturePoint[] = $state([])
  isPaused: boolean = $state(false)

  private lastSampleSec: number = 0
  private readonly sampleIntervalSec: number
  private readonly maxHistorySeconds: number

  constructor(sampleIntervalSec = 0.2, maxHistorySeconds = 120) {
    this.sampleIntervalSec = sampleIntervalSec
    this.maxHistorySeconds = maxHistorySeconds
  }

  record(simulationTimeSec: number, tempC: number) {
    if (this.isPaused) return
    if (!Number.isFinite(tempC)) return
    if (simulationTimeSec - this.lastSampleSec < this.sampleIntervalSec) return

    this.lastSampleSec = simulationTimeSec
    this.history = [
      ...this.history,
      { timeSec: simulationTimeSec, tempC },
    ].filter((point) => simulationTimeSec - point.timeSec <= this.maxHistorySeconds)
  }

  reset(simulationTimeSec = 0) {
    this.history = []
    this.lastSampleSec = simulationTimeSec
  }

  togglePause() {
    this.isPaused = !this.isPaused
  }
}
