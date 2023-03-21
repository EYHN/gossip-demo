import { JsonViewer } from '@textea/json-viewer'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Graph } from './graph'
import { faker } from '@faker-js/faker'

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
  }[]
  time: number
}

rust
  .then((m) => m.default)
  .then((m) => m.createSimulator())
  .then((simulator) => {
    const App = () => {
      const [state, setState] = useState<ViewState>()
      const [clientState, setClientState] = useState<any>()
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
            setState(simulator.debug())
            if (selectId) setClientState(simulator.debug_client(selectId))
            prevTime = time
          }
          animationFrameRequest = requestAnimationFrame(loop)
        }
        animationFrameRequest = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(animationFrameRequest)
      }, [speed, selectId])

      const handleAddRandomKeyValueToSelect = useCallback(() => {
        if (selectId)
          simulator.set_kv(
            selectId,
            faker.name.firstName(),
            faker.name.lastName()
          )
      }, [selectId])

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
            {selectId && (
              <>
                <button onClick={handleAddRandomKeyValueToSelect}>
                  Add random key-value
                </button>
                <JsonViewer editable value={clientState} />
              </>
            )}
          </div>
        )
      }
      return <></>
    }

    ReactDOM.createRoot(document.body).render(<App />)
  })
  .catch(console.error)
