import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Graph } from './graph'
import { faker } from '@faker-js/faker'
import { DataViewer } from './data-viewer'

const rust = import('../pkg')

export interface ViewState {
  clients: {
    id: string
    hash: string
    progress: number
  }[]
  messages: {
    from: string
    to: string
    progress: number
    kind: string
  }[]
  time: number
}

rust
  .then((m) => m.default)
  .then((m) => m.createSimulator())
  .then((simulator) => {
    const App = () => {
      const [state, setState] = useState<ViewState>()
      const [selectId, setSelectId] = useState<string | null>(null)
      const [speed, setSpeed] = useState<number>(10)

      useEffect(() => {
        let animationFrameRequest = 0
        let prevTime: number | null = null
        const loop = (time: DOMHighResTimeStamp) => {
          if (prevTime === null) {
            prevTime = time
          } else {
            simulator.tick(((time - prevTime) / 1000) * (speed / 10))
            const state = simulator.debug() as ViewState
            setState(state)
            prevTime = time
          }
          animationFrameRequest = requestAnimationFrame(loop)
        }
        animationFrameRequest = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(animationFrameRequest)
      }, [speed])

      const handleAddRandomKeyValue = useCallback((id: string) => {
        simulator.set_kv(id, faker.name.firstName(), faker.name.lastName())
      }, [])

      const handleSelectClient = useCallback((selectId: string) => {
        setSelectId(selectId)
      }, [])

      const handleSpeedChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          setSpeed(
            Math.max(1, Math.min(100, parseFloat(e.currentTarget.value)))
          )
        },
        []
      )

      if (state) {
        return (
          <div>
            <label htmlFor="speed">Simulator Speed:</label>
            <input
              name="speed"
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={handleSpeedChange}
            ></input>
            <Graph
              state={{ ...state, selectId }}
              onSelect={handleSelectClient}
            ></Graph>
            <DataViewer
              simulator={simulator}
              state={state}
              style={{ height: 500 }}
              onClickAdd={handleAddRandomKeyValue}
            />
          </div>
        )
      }
      return <></>
    }

    ReactDOM.createRoot(document.body).render(<App />)
  })
  .catch(console.error)
